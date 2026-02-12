const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD
  }
});

const router = express.Router();


// SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;
    
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
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await user.save();

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: user.email,
      subject: "Your Login OTP",
      text: `Your OTP code is ${otp}`
    });

    res.json({
    requiresOTP: true,
    userId: user._id,
    message: "OTP sent to email"
    });



  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// VERIFY OTP
router.post("/verify-otp", async (req, res) => {
  const { userId, otp } = req.body;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  if (
    user.otp !== otp ||
    user.otpExpires < new Date()
  ) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  user.otp = null;
  user.otpExpires = null;
  await user.save();

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "15s" }
  );

  res.json({ token });
});

// PROTECTED TEST ROUTE
router.get("/protected", authMiddleware, (req, res) => {
  res.json({
    message: "You accessed a protected route 🔐",
    user: req.user
  });
});

module.exports = router;
