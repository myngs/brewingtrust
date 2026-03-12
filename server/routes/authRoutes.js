// Input sanitization library
const sanitizeHtml = require("sanitize-html");

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// =====================
// INPUT VALIDATION & SANITIZATION
// =====================

// Regex patterns for validation
const VALIDATION_PATTERNS = {
  username: /^[a-zA-Z0-9_]{3,20}$/,
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
};

// Sanitization function
const sanitizeInput = (input) => {
  if (typeof input !== "string") return input;
  
  // Remove HTML/script tags
  const clean = sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {}
  });
  
  // Trim whitespace
  return clean.trim();
};

// Validation function with regex
const validateField = (field, value, pattern) => {
  if (!value || typeof value !== "string") {
    return { valid: false, message: `${field} is required` };
  }
  
  const sanitized = sanitizeInput(value);
  
  if (sanitized.length === 0) {
    return { valid: false, message: `${field} cannot be empty` };
  }
  
  if (pattern && !pattern.test(sanitized)) {
    return { valid: false, message: `${field} format is invalid` };
  }
  
  return { valid: true, value: sanitized };
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD
  }
});


// =====================
// SIGNUP
// =====================
// Function to generate unique employee ID
const generateEmployeeId = async () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  const employeeId = `EMP-${timestamp}-${random}`;
  
  // Check if ID already exists
  const existing = await User.findOne({ employeeId });
  if (existing) {
    // Recursively generate if collision
    return generateEmployeeId();
  }
  return employeeId;
};

router.post("/signup", async (req, res) => {
  try {
    const { username, email, password, confirmPassword, fullName } = req.body;

    // Validate all required fields
    if (!username || !email || !password || !confirmPassword || !fullName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate username (alphanumeric + underscore, 3-20 chars)
    const usernameValidation = validateField("Username", username, VALIDATION_PATTERNS.username);
    if (!usernameValidation.valid) {
      return res.status(400).json({ message: usernameValidation.message });
    }

    // Validate email format
    const emailValidation = validateField("Email", email, VALIDATION_PATTERNS.email);
    if (!emailValidation.valid) {
      return res.status(400).json({ message: emailValidation.message });
    }

    // Validate password strength
    const passwordValidation = validateField("Password", password, VALIDATION_PATTERNS.password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ 
        message: "Password must be at least 8 characters with uppercase, lowercase, number, and special character"
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existingUser = await User.findOne({
      $or: [{ email: emailValidation.value }, { username: usernameValidation.value }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Username or email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(passwordValidation.value, 10);
    
    // Auto-generate employee ID
    const employeeId = await generateEmployeeId();

    const newUser = new User({
      username: usernameValidation.value,
      fullName: fullName.trim(),
      employeeId: employeeId,
      email: emailValidation.value,
      password: hashedPassword,
      role: "employee" // default role
    });

    await newUser.save();

    res.status(201).json({ message: "User created successfully", employeeId });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// LOGIN (SEND OTP)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Sanitize email input
    const sanitizedEmail = sanitizeInput(email);

    const user = await User.findOne({ email: sanitizedEmail });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockUntil - new Date()) / 1000 / 60);
      return res.status(400).json({ 
        message: `Account locked. Try again in ${minutesLeft} minutes.`,
        locked: true,
        lockUntil: user.lockUntil
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Increment failed attempts
      user.failedAttempts = (user.failedAttempts || 0) + 1;
      
      if (user.failedAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 5 * 60 * 1000); // Lock for 5 minutes
        await user.save();
        return res.status(400).json({ 
          message: "Too many failed attempts. Account locked for 5 minutes.",
          locked: true
        });
      }
      
      await user.save();
      return res.status(400).json({ 
        message: "Invalid credentials",
        attemptsRemaining: 5 - user.failedAttempts
      });
    }

    // Successful login - reset failed attempts
    user.failedAttempts = 0;
    user.lockUntil = null;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: user.email,
      subject: "Your Login OTP",
      text: `Your OTP code is ${otp}`
    });

    res.json({
      requiresOTP: true,
      user: { id: user._id.toString() },
      message: "OTP sent to email"
    });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// =====================
// VERIFY OTP (GENERATE JWT)
// =====================
router.post("/verify-otp", async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.otp !== otp || user.otpExpires < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.otp = null;
    user.otpExpires = null;
    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        username: user.username,  // 🔥 USERNAME INCLUDED
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, role: user.role, username: user.username });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// =====================
// RESEND OTP
// =====================
router.post("/resend-otp", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity
    await user.save();

    // Send email with error handling
    try {
      await transporter.sendMail({
        from: process.env.EMAIL,
        to: user.email,
        subject: "Your New Login OTP",
        text: `Your new OTP code is ${otp}`
      });
    } catch (emailErr) {
      console.error("Email sending error:", emailErr);
      return res.status(500).json({ message: "Failed to send email. Please try again." });
    }

    res.json({ message: "New OTP sent to your email" });

  } catch (err) {
    console.error("Resend OTP error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// =====================
// ADMIN ROUTE
// =====================
router.get(
  "/admin-dashboard",
  authMiddleware,
  roleMiddleware("admin"),
  (req, res) => {
    res.json({ message: "Welcome Admin 👑" });
  }
);

// =====================
// GET ALL USERS (ADMIN)
// =====================
router.get(
  "/users",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const users = await User.find({}, { password: 0, otp: 0, otpExpires: 0 }); // Exclude sensitive fields
      res.json({ users });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);


// =====================
// EMPLOYEE ROUTE
// =====================
router.get(
  "/employee-dashboard",
  authMiddleware,
  roleMiddleware("employee"),
  (req, res) => {
    res.json({ message: "Welcome Employee 👷" });
  }
);


module.exports = router;
