const express = require("express");
const jwt = require("jsonwebtoken");

const Attendance = require("../models/Attendance");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const offChainStorage = require("../utils/offChainStorage");
const blockchain = require("../utils/blockchain");

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

/**
 * Helper: Get or create attendance record reference in MongoDB
 */
const getOrCreateAttendanceRef = async (user, date, recordHash, blockchainTxHash) => {
  let attendanceRef = await Attendance.findOne({ userId: user._id, date });
  
  if (attendanceRef) {
    // Update existing record
    attendanceRef.recordHash = recordHash;
    attendanceRef.blockchainTxHash = blockchainTxHash || attendanceRef.blockchainTxHash;
    attendanceRef.updatedAt = new Date();
    await attendanceRef.save();
  } else {
    // Create new reference
    attendanceRef = new Attendance({
      userId: user._id,
      walletAddress: user.walletAddress,
      date,
      recordHash,
      blockchainTxHash,
      status: "pending"
    });
    await attendanceRef.save();
  }
  
  return attendanceRef;
};

// =====================
// CLOCK IN
// =====================
/**
 * Clock In Flow (Following Professor's Requirements):
 * 1. Store attendance data off-chain (JSON file)
 * 2. Generate hash of the record
 * 3. Store hash on blockchain
 * 4. Store hash reference in MongoDB
 */
router.post("/clock-in", authMiddleware, roleMiddleware("employee"), async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { date } = req.body;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const clockInTime = Math.floor(Date.now() / 1000); // Unix timestamp
    
    // STEP 1: Store attendance data off-chain (JSON file)
    const offChainResult = offChainStorage.storeAttendanceRecord({
      employeeId: user.employeeId || user._id.toString(),
      date,
      clockIn: clockInTime,
      clockOut: null, // Not clocked out yet
      metadata: {
        action: "clock-in",
        userId: user._id.toString(),
        username: user.username
      }
    });

    if (!offChainResult.success) {
      return res.status(500).json({ message: "Failed to store attendance off-chain" });
    }

    const recordHash = offChainResult.hash;
    
    // STEP 2: Store hash on blockchain (MANDATORY for demo)
    let blockchainTxHash = null;
    try {
      // First initialize blockchain to get the wallet address
      const blockchainModule = await blockchain.initializeBlockchain();
      const serverWalletAddress = blockchainModule.wallet.address;
      
      // Use user's walletAddress if available, otherwise use server's wallet address
      const addressToStore = user.walletAddress || serverWalletAddress;
      
      console.log('🔗 BLOCKCHAIN TX: Address:', addressToStore);
      console.log('🔗 Blockchain RPC:', process.env.BLOCKCHAIN_RPC_URL);
      console.log('🔗 Contract:', process.env.CONTRACT_ADDRESS);
      
      const blockchainResult = await blockchain.storeAttendanceOnChain(
        addressToStore,
        date,
        recordHash
      );
      
      if (!blockchainResult.success) {
        return res.status(500).json({
          message: "BLOCKCHAIN TRANSACTION FAILED - Required for demo",
          error: blockchainResult.error,
          recordHash
        });
      }
      
      blockchainTxHash = blockchainResult.transactionHash;
      console.log('✅ BLOCKCHAIN TX SUCCESS:', blockchainTxHash);
      console.log('⛽ Gas used:', blockchainResult.gasUsed);
      
    } catch (blockchainError) {
      console.error("BLOCKCHAIN ERROR (FATAL):", blockchainError.message);
      return res.status(500).json({
        message: "BLOCKCHAIN REQUIRED - Transaction failed",
        error: blockchainError.message,
        recordHash
      });
    }

    // STEP 3: Store hash reference in MongoDB (NOT the actual attendance data)
    await getOrCreateAttendanceRef(user, date, recordHash, blockchainTxHash);

    res.json({
      message: "Clocked in successfully",
      clockIn: clockInTime,
      recordHash, // This hash can be used to retrieve the full record from off-chain storage
      blockchainTxHash,
      offChainRef: offChainResult.record.id
    });

  } catch (err) {
    console.error("Clock in error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// =====================
// CLOCK OUT
// =====================
/**
 * Clock Out Flow (Following Professor's Requirements):
 * 1. Get existing off-chain record
 * 2. Update with clock-out time off-chain
 * 3. Generate new hash of updated record
 * 4. Store new hash on blockchain
 * 5. Update hash reference in MongoDB
 */
router.post("/clock-out", authMiddleware, roleMiddleware("employee"), async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { date } = req.body;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    // Find existing attendance reference in MongoDB
    const attendanceRef = await Attendance.findOne({ userId: user._id, date });

    if (!attendanceRef) {
      return res.status(400).json({ message: "No clock-in record found for this date" });
    }

    // Get the existing off-chain record using the stored hash
    const existingRecord = offChainStorage.getRecordByHash(attendanceRef.recordHash, date);

    if (!existingRecord || !existingRecord.clockIn) {
      return res.status(400).json({ message: "Invalid or missing clock-in record" });
    }

    if (existingRecord.clockOut) {
      return res.status(400).json({ message: "Already clocked out for this date" });
    }

    const clockOutTime = Math.floor(Date.now() / 1000); // Unix timestamp
    const totalHours = (clockOutTime - existingRecord.clockIn) / 3600;

    // STEP 1 & 2: Update attendance data off-chain (JSON file)
    const offChainResult = offChainStorage.storeAttendanceRecord({
      employeeId: user.employeeId || user._id.toString(),
      date,
      clockIn: existingRecord.clockIn, // Keep original clock-in
      clockOut: clockOutTime,
      metadata: {
        action: "clock-out",
        userId: user._id.toString(),
        username: user.username,
        totalHours: Math.max(0, totalHours)
      }
    });

    if (!offChainResult.success) {
      return res.status(500).json({ message: "Failed to update attendance off-chain" });
    }

    const newRecordHash = offChainResult.hash;

    // STEP 3: Store updated hash on blockchain (MANDATORY)
    let blockchainTxHash = null;
    const blockchainModule = await blockchain.initializeBlockchain();
    const serverWalletAddress = blockchainModule.wallet.address;
    
    const addressToStore = user.walletAddress || serverWalletAddress;
    
    console.log('🔗 BLOCKCHAIN TX START (Clock Out):');
    console.log('  Address:', addressToStore);
    
    const blockchainResult = await blockchain.storeAttendanceOnChain(
      addressToStore,
      date,
      newRecordHash
    );
    
    if (!blockchainResult.success) {
      return res.status(500).json({
        message: "BLOCKCHAIN TRANSACTION FAILED - Cannot complete clock-out",
        error: blockchainResult.error,
        recordHash: newRecordHash
      });
    }
    
    blockchainTxHash = blockchainResult.transactionHash;
    console.log('✅ BLOCKCHAIN TX SUCCESS:', blockchainTxHash);

    // STEP 4: Update hash reference in MongoDB
    attendanceRef.recordHash = newRecordHash;
    attendanceRef.blockchainTxHash = blockchainTxHash || attendanceRef.blockchainTxHash;
    attendanceRef.status = "completed";
    attendanceRef.updatedAt = new Date();
    await attendanceRef.save();

    res.json({
      message: "Clocked out successfully",
      clockOut: clockOutTime,
      totalHours: Math.max(0, totalHours),
      recordHash: newRecordHash,
      blockchainTxHash,
      verified: true // Can be verified against blockchain
    });

  } catch (err) {
    console.error("Clock out error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// =====================
// GET TODAY'S RECORD
// =====================
/**
 * Get Attendance Record:
 * 1. Get hash reference from MongoDB
 * 2. Use hash to fetch actual data from off-chain storage
 * 3. Optionally verify against blockchain
 */
router.get("/today/:date", authMiddleware, roleMiddleware("employee"), async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { date } = req.params;

    // Get reference from MongoDB
    const attendanceRef = await Attendance.findOne({ userId: user._id, date });

    if (!attendanceRef) {
      return res.json({
        clockIn: null,
        clockOut: null,
        totalHours: null,
        status: "not-started",
        verified: false
      });
    }

    // Get actual attendance data from off-chain storage
    const offChainRecord = offChainStorage.getRecordByHash(attendanceRef.recordHash, date);
    
    let verified = false;
    // Optionally verify against blockchain
    try {
      if (user.walletAddress) {
        verified = await blockchain.verifyHashOnChain(
          user.walletAddress,
          date,
          attendanceRef.recordHash
        );
      }
    } catch (error) {
      console.warn("Blockchain verification failed:", error.message);
    }

    const totalHours = offChainRecord?.clockOut 
      ? (offChainRecord.clockOut - offChainRecord.clockIn) / 3600 
      : null;

    res.json({
      clockIn: offChainRecord?.clockIn || null,
      clockOut: offChainRecord?.clockOut || null,
      totalHours: totalHours ? Math.max(0, totalHours) : null,
      status: attendanceRef.status,
      recordHash: attendanceRef.recordHash,
      blockchainTxHash: attendanceRef.blockchainTxHash,
      verified,
      offChainRef: offChainRecord?.id
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

    // Get references from MongoDB
    const attendanceRefs = await Attendance.find({ userId: user._id })
      .sort({ date: -1, createdAt: -1 });

    if (!attendanceRefs || attendanceRefs.length === 0) {
      return res.json({ records: [] });
    }

    // Get actual records from off-chain storage
    const records = attendanceRefs.map(ref => {
      const offChainRecord = offChainStorage.getRecordByHash(ref.recordHash, ref.date);
      
      const totalHours = offChainRecord?.clockOut && offChainRecord?.clockIn
        ? (offChainRecord.clockOut - offChainRecord.clockIn) / 3600
        : 0;

      return {
        date: ref.date,
        clockIn: offChainRecord?.clockIn || null,
        clockOut: offChainRecord?.clockOut || null,
        totalHours: totalHours ? Math.max(0, totalHours) : null,
        status: ref.status,
        recordHash: ref.recordHash,
        blockchainTxHash: ref.blockchainTxHash
      };
    });

    res.json({ records });

  } catch (err) {
    console.error("Get my records error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Helper function to mask sensitive data
const maskSensitiveData = (record) => {
  const maskedRecord = { ...record };

  const maskNamePart = (part) => {
    if (!part) return part;
    const trimmed = String(part).trim();
    if (!trimmed) return trimmed;
    return `${trimmed[0]}****`;
  };
  
  // Mask username (show first 2 chars + asterisks)
  if (maskedRecord.userId?.username) {
    const username = maskedRecord.userId.username;
    maskedRecord.userId.username = username.length > 2 
      ? username.substring(0, 2) + "*".repeat(username.length - 2)
      : "**";
  }

  // Mask full name (show first char per word + "****")
  if (maskedRecord.userId?.fullName) {
    const fullName = String(maskedRecord.userId.fullName).trim();
    if (fullName) {
      maskedRecord.userId.fullName = fullName
        .split(/\s+/)
        .filter(Boolean)
        .map(maskNamePart)
        .join(" ");
    }
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
    // Get references from MongoDB
    const attendanceRefs = await Attendance.find()
      .populate("userId", "username fullName email walletAddress employeeId")
      .sort({ date: -1, createdAt: -1 });

    // Get actual records from off-chain storage and combine with references
    const records = attendanceRefs.map(ref => {
      const offChainRecord = offChainStorage.getRecordByHash(ref.recordHash, ref.date);
      
      const totalHours = offChainRecord?.clockOut && offChainRecord?.clockIn
        ? (offChainRecord.clockOut - offChainRecord.clockIn) / 3600
        : 0;

      return {
        date: ref.date,
        clockIn: offChainRecord?.clockIn || null,
        clockOut: offChainRecord?.clockOut || null,
        totalHours: totalHours ? Math.max(0, totalHours) : null,
        status: ref.status,
        recordHash: ref.recordHash,
        blockchainTxHash: ref.blockchainTxHash,
        userId: ref.userId,
        createdAt: ref.createdAt,
        updatedAt: ref.updatedAt
      };
    });

    // Mask sensitive data before sending response
    const maskedRecords = records.map(record => maskSensitiveData(record));

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

    // Get references from MongoDB
    const attendanceRefs = await Attendance.find({ userId })
      .populate("userId", "username fullName email walletAddress employeeId")
      .sort({ date: -1 });

    // Get actual records from off-chain storage
    const records = attendanceRefs.map(ref => {
      const offChainRecord = offChainStorage.getRecordByHash(ref.recordHash, ref.date);
      
      const totalHours = offChainRecord?.clockOut && offChainRecord?.clockIn
        ? (offChainRecord.clockOut - offChainRecord.clockIn) / 3600
        : 0;

      return {
        date: ref.date,
        clockIn: offChainRecord?.clockIn || null,
        clockOut: offChainRecord?.clockOut || null,
        totalHours: totalHours ? Math.max(0, totalHours) : null,
        status: ref.status,
        recordHash: ref.recordHash,
        blockchainTxHash: ref.blockchainTxHash
      };
    });

    // Mask sensitive data before sending response
    const maskedRecords = records.map(record => maskSensitiveData(record));

    res.json({ records: maskedRecords });

  } catch (err) {
    console.error("Get employee attendance error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// =====================
// VERIFY ATTENDANCE RECORD (Blockchain)
// =====================
router.get("/verify/:date", authMiddleware, roleMiddleware("employee"), async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { date } = req.params;

    // Get reference from MongoDB
    const attendanceRef = await Attendance.findOne({ userId: user._id, date });

    if (!attendanceRef) {
      return res.json({ verified: false, message: "No record found" });
    }

    // Verify against blockchain
    let blockchainVerified = false;
    try {
      if (user.walletAddress) {
        blockchainVerified = await blockchain.verifyHashOnChain(
          user.walletAddress,
          date,
          attendanceRef.recordHash
        );
      }
    } catch (error) {
      console.warn("Blockchain verification error:", error.message);
    }

    // Verify off-chain data integrity
    const offChainRecord = offChainStorage.getRecordByHash(attendanceRef.recordHash, date);
    const offChainVerified = offChainRecord !== null;

    res.json({
      verified: blockchainVerified && offChainVerified,
      blockchainVerified,
      offChainVerified,
      recordHash: attendanceRef.recordHash,
      blockchainTxHash: attendanceRef.blockchainTxHash
    });

  } catch (err) {
    console.error("Verify attendance error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// =====================
// BLOCKCHAIN STATUS (Admin)
// =====================
router.get("/blockchain-status", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  try {
    const networkInfo = await blockchain.getNetworkInfo();
    const isBlockChainConnected = await blockchain.isConnected();
    
    res.json({
      connected: isBlockChainConnected,
      network: networkInfo
    });
  } catch (err) {
    console.error("Blockchain status error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
