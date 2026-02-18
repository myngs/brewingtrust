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
      password: hashedPassword,
      role: "employee" // default role
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

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

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
      userId: user._id,
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
