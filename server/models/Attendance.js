const mongoose = require("mongoose");

/**
 * Attendance Schema
 * 
 * This schema stores only metadata/reference to off-chain attendance records.
 * Following the professor's requirement:
 * - The actual attendance data is stored off-chain (JSON file)
 * - This schema stores only the reference/hash that points to the off-chain record
 * - MongoDB stores metadata, blockchain stores the hash reference
 */
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
  // OFF-CHAIN REFERENCE - Hash of the attendance record stored in JSON
  recordHash: {
    type: String, // SHA-256 hash of the off-chain attendance record
    required: true
  },
  // Reference ID to the off-chain storage file
  offChainRef: {
    type: String, // Can be used to reference specific file or record ID
    default: null
  },
  // Blockchain transaction hash
  blockchainTxHash: {
    type: String, // Transaction hash from blockchain
    default: null
  },
  // Status of the attendance
  status: {
    type: String,
    enum: ["pending", "clocked-in", "clocked-out", "completed"],
    default: "pending"
  },
  // Metadata for additional info
  metadata: {
    type: Object,
    default: {}
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

// Index for searching by record hash
attendanceSchema.index({ recordHash: 1 });

// Index for searching by blockchain transaction
attendanceSchema.index({ blockchainTxHash: 1 });

module.exports = mongoose.model("Attendance", attendanceSchema);
