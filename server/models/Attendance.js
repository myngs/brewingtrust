const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  walletAddress: {
    type: String,
    required: false,
    lowercase: true,
    trim: true
  },
  date: {
    type: String, // Format: YYYYMMDD (e.g., "20260224")
    required: true
  },
  clockIn: {
    type: Number, // Unix timestamp
    default: null
  },
  clockOut: {
    type: Number, // Unix timestamp
    default: null
  },
  totalHours: {
    type: Number, // Calculated hours worked
    default: 0
  },
  blockchainTxHash: {
    type: String, // Transaction hash from blockchain
    default: null
  },
  status: {
    type: String,
    enum: ["clocked-in", "clocked-out", "completed"],
    default: "clocked-in"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure one record per user per date
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
