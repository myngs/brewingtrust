/**
 * Off-Chain Storage Module for Attendance Records
 * 
 * This module handles the storage of actual attendance data off-chain (JSON file storage)
 * following the professor's requirement that actual attendance data must NOT be stored directly in the database.
 * 
 * Data Flow:
 * 1. Employee performs clock-in/clock-out
 * 2. Attendance data is stored in JSON file (off-chain)
 * 3. A SHA-256 hash of the record is generated
 * 4. The hash is stored on the blockchain
 * 5. The MongoDB stores only the metadata/reference (hash)
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const STORAGE_DIR = path.join(__dirname, '..', 'data');

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

/**
 * Generate SHA-256 hash of attendance record
 * @param {Object} record - The attendance record
 * @returns {string} - The hex string of the hash
 */
function generateRecordHash(record) {
  const data = JSON.stringify({
    employeeId: record.employeeId,
    date: record.date,
    clockIn: record.clockIn,
    clockOut: record.clockOut,
    metadata: record.metadata || {}
  });
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Get the file path for attendance records
 * @param {string} date - Date in YYYYMMDD format (optional, for specific date file)
 * @returns {string} - File path
 */
function getFilePath(date = null) {
  if (date) {
    // Store each month's data in separate files
    const year = date.substring(0, 4);
    const month = date.substring(4, 6);
    const monthDir = path.join(STORAGE_DIR, year);
    
    if (!fs.existsSync(monthDir)) {
      fs.mkdirSync(monthDir, { recursive: true });
    }
    
    return path.join(monthDir, `attendance_${year}_${month}.json`);
  }
  return path.join(STORAGE_DIR, 'attendance_all.json');
}

/**
 * Read attendance records from file
 * @param {string} date - Date in YYYYMMDD format (optional)
 * @returns {Array} - Array of attendance records
 */
function readRecords(date = null) {
  const filePath = getFilePath(date);
  
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading attendance records:', error);
  }
  
  return [];
}

/**
 * Write attendance records to file
 * @param {Array} records - Array of attendance records
 * @param {string} date - Date in YYYYMMDD format (optional)
 */
function writeRecords(records, date = null) {
  const filePath = getFilePath(date);
  
  try {
    fs.writeFileSync(filePath, JSON.stringify(records, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing attendance records:', error);
    return false;
  }
}

/**
 * Store attendance record off-chain
 * @param {Object} attendanceData - The attendance data
 * @returns {Object} - Object containing record and hash
 */
function storeAttendanceRecord(attendanceData) {
  const { employeeId, date, clockIn, clockOut, metadata = {} } = attendanceData;
  
  // Create the record
  const record = {
    id: `${employeeId}_${date}`,
    employeeId,
    date,
    clockIn,
    clockOut,
    metadata: {
      ...metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  };
  
  // Generate hash of the record
  const recordHash = generateRecordHash(record);
  
  // Add hash to record
  record.hash = recordHash;
  
  // Read existing records
  const records = readRecords(date);
  
  // Check if record already exists for this employee and date
  const existingIndex = records.findIndex(r => r.employeeId === employeeId && r.date === date);
  
  if (existingIndex >= 0) {
    // Update existing record
    records[existingIndex] = {
      ...record,
      metadata: {
        ...records[existingIndex].metadata,
        createdAt: records[existingIndex].metadata.createdAt,
        updatedAt: new Date().toISOString()
      }
    };
  } else {
    // Add new record
    records.push(record);
  }
  
  // Save records
  const success = writeRecords(records, date);
  
  if (success) {
    return {
      success: true,
      record,
      hash: recordHash
    };
  }
  
  return {
    success: false,
    error: 'Failed to store record'
  };
}

/**
 * Get attendance record by hash
 * @param {string} recordHash - The hash of the record
 * @param {string} date - Date in YYYYMMDD format (optional)
 * @returns {Object|null} - The attendance record or null
 */
function getRecordByHash(recordHash, date = null) {
  const records = readRecords(date);
  return records.find(r => r.hash === recordHash) || null;
}

/**
 * Get attendance record by employee ID and date
 * @param {string} employeeId - The employee ID
 * @param {string} date - Date in YYYYMMDD format
 * @returns {Object|null} - The attendance record or null
 */
function getRecordByEmployeeAndDate(employeeId, date) {
  const records = readRecords(date);
  return records.find(r => r.employeeId === employeeId && r.date === date) || null;
}

/**
 * Get all attendance records for an employee
 * @param {string} employeeId - The employee ID
 * @returns {Array} - Array of attendance records
 */
function getRecordsByEmployee(employeeId) {
  // Read from main file
  const allRecords = readRecords();
  return allRecords.filter(r => r.employeeId === employeeId);
}

/**
 * Get attendance records for a specific date range
 * @param {string} startDate - Start date in YYYYMMDD format
 * @param {string} endDate - End date in YYYYMMDD format
 * @returns {Array} - Array of attendance records
 */
function getRecordsByDateRange(startDate, endDate) {
  const allRecords = readRecords();
  return allRecords.filter(r => r.date >= startDate && r.date <= endDate);
}

/**
 * Verify if a record hash is valid (matches the stored record)
 * @param {string} recordHash - The hash to verify
 * @param {Object} recordData - The record data to compare
 * @returns {boolean} - Whether the hash is valid
 */
function verifyRecordHash(recordHash, recordData) {
  const computedHash = generateRecordHash(recordData);
  return computedHash === recordHash;
}

/**
 * Delete attendance record
 * @param {string} employeeId - The employee ID
 * @param {string} date - Date in YYYYMMDD format
 * @returns {boolean} - Whether deletion was successful
 */
function deleteRecord(employeeId, date) {
  const records = readRecords(date);
  const filteredRecords = records.filter(r => !(r.employeeId === employeeId && r.date === date));
  
  if (filteredRecords.length !== records.length) {
    return writeRecords(filteredRecords, date);
  }
  
  return false;
}

/**
 * Get all attendance records (for admin)
 * @param {string} month - Month in YYYY-MM format (optional)
 * @returns {Array} - Array of all attendance records
 */
function getAllRecords(month = null) {
  if (month) {
    const [year, mon] = month.split('-');
    const startDate = `${year}${mon}01`;
    const endDate = `${year}${mon}31`;
    return getRecordsByDateRange(startDate, endDate);
  }
  return readRecords();
}

module.exports = {
  storeAttendanceRecord,
  getRecordByHash,
  getRecordByEmployeeAndDate,
  getRecordsByEmployee,
  getRecordsByDateRange,
  getAllRecords,
  verifyRecordHash,
  deleteRecord,
  generateRecordHash,
  STORAGE_DIR
};

