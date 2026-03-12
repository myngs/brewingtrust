// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Attendance
 * @notice Blockchain-based attendance system that stores only attendance record references (hashes)
 * @dev This contract stores only hashes/references to off-chain attendance records
 *      Actual attendance data (clock-in/clock-out times) are stored off-chain
 */
contract Attendance {
    // Struct to store attendance record reference (hash)
    struct RecordReference {
        bytes32 recordHash;    // Hash of the attendance record stored off-chain
        uint256 timestamp;     // When the record was stored on blockchain
        bool exists;           // Whether a record exists for this date
    }

    // user address => date (YYYYMMDD) => RecordReference
    mapping(address => mapping(uint256 => RecordReference)) private recordReferences;

    // Event emitted when attendance record reference is stored
    event AttendanceRecordStored(
        address indexed user,
        uint256 indexed date,
        bytes32 recordHash,
        uint256 timestamp
    );

    // Event emitted when attendance record is updated
    event AttendanceRecordUpdated(
        address indexed user,
        uint256 indexed date,
        bytes32 recordHash,
        uint256 timestamp
    );

    /**
     * @notice Store attendance record reference (hash) on blockchain
     * @dev This stores only a hash that references off-chain attendance data
     * @param date The date in YYYYMMDD format
     * @param recordHash The SHA-256 hash of the attendance record stored off-chain
     */
    function storeAttendanceRecord(uint256 date, bytes32 recordHash) external {
        require(recordHash != bytes32(0), "Record hash cannot be empty");
        
        RecordReference storage ref = recordReferences[msg.sender][date];
        
        if (ref.exists) {
            // Update existing record
            ref.recordHash = recordHash;
            ref.timestamp = block.timestamp;
            emit AttendanceRecordUpdated(msg.sender, date, recordHash, block.timestamp);
        } else {
            // Create new record reference
            ref.exists = true;
            ref.recordHash = recordHash;
            ref.timestamp = block.timestamp;
            emit AttendanceRecordStored(msg.sender, date, recordHash, block.timestamp);
        }
    }

    /**
     * @notice Get attendance record reference for a specific user and date
     * @param user The wallet address of the user
     * @param date The date in YYYYMMDD format
     * @return recordHash The hash of the attendance record
     * @return timestamp The timestamp when the record was stored
     * @return exists Whether a record exists
     */
    function getAttendanceRecord(address user, uint256 date)
        external
        view
        returns (bytes32 recordHash, uint256 timestamp, bool exists)
    {
        RecordReference memory ref = recordReferences[user][date];
        return (ref.recordHash, ref.timestamp, ref.exists);
    }

    /**
     * @notice Verify if an attendance record hash matches the stored reference
     * @param user The wallet address of the user
     * @param date The date in YYYYMMDD format
     * @param recordHash The hash to verify
     * @return bool Whether the hash matches
     */
    function verifyRecordHash(address user, uint256 date, bytes32 recordHash)
        external
        view
        returns (bool)
    {
        RecordReference memory ref = recordReferences[user][date];
        return ref.exists && ref.recordHash == recordHash;
    }

    /**
     * @notice Get the stored record hash for current caller
     * @param date The date in YYYYMMDD format
     * @return recordHash The hash of the attendance record
     */
    function getMyRecordHash(uint256 date) external view returns (bytes32) {
        return recordReferences[msg.sender][date].recordHash;
    }
}
