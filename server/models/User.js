const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  fullName: {
    type: String,
    trim: true
  },
  employeeId: {
    type: String,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["admin", "employee"],
    default: "employee"
  },
  walletAddress: {
    type: String,
    trim: true,
    lowercase: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  otp: {
  type: String,
  },
  otpExpires: {
  type: Date
  },
  failedAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    default: null
  },
  passwordResetOtpHash: {
    type: String
  },
  passwordResetOtpExpires: {
    type: Date
  },
  passwordResetGrantId: {
    type: String
  },
  passwordResetGrantExpires: {
    type: Date
  }

});

module.exports = mongoose.model("User", userSchema);
