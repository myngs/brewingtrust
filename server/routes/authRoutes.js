const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

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
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password, confirmPassword, walletAddress } = req.body;

    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Username or email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: "employee", // default role
      walletAddress: walletAddress || undefined
    });

    await newUser.save();

    res.status(201).json({ message: "User created successfully" });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// =====================
// LOGIN (SEND OTP)
// =====================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
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
        role: user.role  // 🔥 ROLE INCLUDED
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, role: user.role });

  } catch (err) {
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
