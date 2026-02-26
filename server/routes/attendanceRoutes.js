const express = require("express");
const jwt = require("jsonwebtoken");

const Attendance = require("../models/Attendance");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Helper function to get user from token
const getUserFromToken = async (req) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return await User.findById(decoded.id);
  } catch (err) {
    return null;
  }
};

// =====================
// CLOCK IN
// =====================
router.post("/clock-in", authMiddleware, roleMiddleware("employee"), async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { date, blockchainTxHash } = req.body;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    // Check if already clocked in for this date
    const existingRecord = await Attendance.findOne({ userId: user._id, date });

    if (existingRecord && existingRecord.clockIn) {
      return res.status(400).json({ message: "Already clocked in for this date" });
    }

    const clockInTime = Math.floor(Date.now() / 1000); // Unix timestamp

    if (existingRecord) {
      // Update existing record
      existingRecord.clockIn = clockInTime;
      existingRecord.blockchainTxHash = blockchainTxHash || existingRecord.blockchainTxHash;
      existingRecord.status = "clocked-in";
      await existingRecord.save();
    } else {
      // Create new record
      const newAttendance = new Attendance({
        userId: user._id,
        walletAddress: user.walletAddress,
        date,
        clockIn: clockInTime,
        blockchainTxHash,
        status: "clocked-in"
      });
      await newAttendance.save();
    }

    res.json({
      message: "Clocked in successfully",
      clockIn: clockInTime
    });

  } catch (err) {
    console.error("Clock in error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// =====================
// CLOCK OUT
// =====================
router.post("/clock-out", authMiddleware, roleMiddleware("employee"), async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { date, blockchainTxHash } = req.body;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    // Find the attendance record
    const attendanceRecord = await Attendance.findOne({ userId: user._id, date });

    if (!attendanceRecord) {
      return res.status(400).json({ message: "No clock-in record found for this date" });
    }

    if (!attendanceRecord.clockIn) {
      return res.status(400).json({ message: "Must clock in first before clocking out" });
    }

    if (attendanceRecord.clockOut) {
      return res.status(400).json({ message: "Already clocked out for this date" });
    }

    const clockOutTime = Math.floor(Date.now() / 1000); // Unix timestamp
    const totalHours = (clockOutTime - attendanceRecord.clockIn) / 3600; // Convert to hours

    // Update record
    attendanceRecord.clockOut = clockOutTime;
    attendanceRecord.totalHours = Math.max(0, totalHours); // Ensure non-negative
    attendanceRecord.blockchainTxHash = blockchainTxHash || attendanceRecord.blockchainTxHash;
    attendanceRecord.status = "completed";
    await attendanceRecord.save();

    res.json({
      message: "Clocked out successfully",
      clockOut: clockOutTime,
      totalHours: attendanceRecord.totalHours
    });

  } catch (err) {
    console.error("Clock out error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// =====================
// GET TODAY'S RECORD
// =====================
router.get("/today/:date", authMiddleware, roleMiddleware("employee"), async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { date } = req.params;

    const record = await Attendance.findOne({ userId: user._id, date });

    if (!record) {
      return res.json({
        clockIn: 0,
        clockOut: 0,
        totalHours: 0,
        status: "not-started"
      });
    }

    res.json({
      clockIn: record.clockIn || 0,
      clockOut: record.clockOut || 0,
      totalHours: record.totalHours || 0,
      status: record.status,
      blockchainTxHash: record.blockchainTxHash
    });

  } catch (err) {
    console.error("Get today record error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// =====================
// GET ALL ATTENDANCE RECORDS FOR CURRENT USER
// =====================
router.get("/my-records", authMiddleware, roleMiddleware("employee"), async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const records = await Attendance.find({ userId: user._id })
      .sort({ date: -1, createdAt: -1 });

    if (!records || records.length === 0) {
      return res.json({ records: [] });
    }

    res.json({
      records: records.map(record => ({
        date: record.date,
        clockIn: record.clockIn || 0,
        clockOut: record.clockOut || 0,
        totalHours: record.totalHours || 0,
        status: record.status,
        blockchainTxHash: record.blockchainTxHash
      }))
    });

  } catch (err) {
    console.error("Get my records error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Helper function to mask sensitive data
const maskSensitiveData = (record) => {
  const maskedRecord = { ...record };
  
  // Mask username (show first 2 chars + asterisks)
  if (maskedRecord.userId?.username) {
    const username = maskedRecord.userId.username;
    maskedRecord.userId.username = username.length > 2 
      ? username.substring(0, 2) + "*".repeat(username.length - 2)
      : "**";
  }
  
  // Mask email (show first part + asterisks + domain)
  if (maskedRecord.userId?.email) {
    const email = maskedRecord.userId.email;
    const atIndex = email.indexOf("@");
    if (atIndex > 2) {
      maskedRecord.userId.email = email.substring(0, 2) + "*".repeat(atIndex - 2) + email.substring(atIndex);
    } else {
      maskedRecord.userId.email = "**" + email.substring(atIndex);
    }
  }
  
  // Mask wallet address (show first 6 and last 4 chars)
  if (maskedRecord.userId?.walletAddress) {
    const wallet = maskedRecord.userId.walletAddress;
    if (wallet.length > 10) {
      maskedRecord.userId.walletAddress = wallet.substring(0, 6) + "..." + wallet.substring(wallet.length - 4);
    } else {
      maskedRecord.userId.walletAddress = "***";
    }
  }
  
  // Mask userId to a masked ID reference
  if (maskedRecord.userId?._id) {
    maskedRecord.userId._id = "REF-" + maskedRecord.userId._id.toString().substring(0, 8);
  }
  
  return maskedRecord;
};

// =====================
// GET ALL ATTENDANCE RECORDS (ADMIN)
// =====================
router.get("/all", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  try {
    const records = await Attendance.find()
      .populate("userId", "username email walletAddress")
      .sort({ date: -1, createdAt: -1 });

    // Mask sensitive data before sending response
    const maskedRecords = records.map(record => maskSensitiveData(record.toObject()));

    res.json({ records: maskedRecords });

  } catch (err) {
    console.error("Get all attendance error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// =====================
// GET EMPLOYEE ATTENDANCE RECORDS (ADMIN)
// =====================
router.get("/employee/:userId", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  try {
    const { userId } = req.params;

    const records = await Attendance.find({ userId })
      .populate("userId", "username email walletAddress")
      .sort({ date: -1 });

    // Mask sensitive data before sending response
    const maskedRecords = records.map(record => maskSensitiveData(record.toObject()));

    res.json({ records: maskedRecords });

  } catch (err) {
    console.error("Get employee attendance error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
