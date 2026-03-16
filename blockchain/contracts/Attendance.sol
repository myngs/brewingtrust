// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Attendance
 * @notice Blockchain-based attendance system that stores only attendance record references (hashes)
 * @dev This contract stores only hashes/references to off-chain attendance records
 *      Actual attendance data (clock-in/clock-out times) are stored off-chain
 */
contract Attendance {
    address public owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner is the zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    // Struct to store attendance record reference (hash)
    struct RecordReference {
        bytes32 recordHash;    // Hash of the attendance record stored off-chain
        uint256 timestamp;     // When the record was stored on blockchain
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

    function _store(address user, uint256 date, bytes32 recordHash) internal {
        require(user != address(0), "User cannot be zero address");
        require(recordHash != bytes32(0), "Record hash cannot be empty");

        RecordReference storage ref = recordReferences[user][date];
        uint256 ts = block.timestamp;

        if (ref.recordHash != bytes32(0)) {
            // Update existing record
            ref.recordHash = recordHash;
            ref.timestamp = ts;
            emit AttendanceRecordUpdated(user, date, recordHash, ts);
        } else {
            // Create new record reference
            ref.recordHash = recordHash;
            ref.timestamp = ts;
            emit AttendanceRecordStored(user, date, recordHash, ts);
        }
    }

    /**
     * @notice Store attendance record reference (hash) on blockchain
     * @dev This stores only a hash that references off-chain attendance data
     * @param date The date in YYYYMMDD format
     * @param recordHash The SHA-256 hash of the attendance record stored off-chain
     */
    function storeAttendanceRecord(uint256 date, bytes32 recordHash) external onlyOwner {
        _store(msg.sender, date, recordHash);
    }

    /**
     * @notice Store attendance record reference (hash) on blockchain for a specific user
     * @dev Only the contract owner (your backend wallet) can write on-chain in this mode.
     * @param user The wallet address that the record should be associated with
     * @param date The date in YYYYMMDD format
     * @param recordHash The SHA-256 hash of the attendance record stored off-chain
     */
    function storeAttendanceRecordFor(address user, uint256 date, bytes32 recordHash) external onlyOwner {
        _store(user, date, recordHash);
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
        RecordReference storage ref = recordReferences[user][date];
        recordHash = ref.recordHash;
        timestamp = ref.timestamp;
        exists = (recordHash != bytes32(0));
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
        RecordReference storage ref = recordReferences[user][date];
        bytes32 stored = ref.recordHash;
        return stored != bytes32(0) && stored == recordHash;
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
