// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Attendance {
    struct Record {
        uint256 clockIn;
        uint256 clockOut;
    }

    // user address => date (YYYYMMDD) => Record
    mapping(address => mapping(uint256 => Record)) private records;

    event ClockIn(address indexed user, uint256 date, uint256 time);
    event ClockOut(address indexed user, uint256 date, uint256 time);

    /// Clock in for today
    function clockIn(uint256 date) external {
        Record storage record = records[msg.sender][date];

        require(record.clockIn == 0, "Already clocked in");

        record.clockIn = block.timestamp;

        emit ClockIn(msg.sender, date, block.timestamp);
    }

    /// Clock out for today
    function clockOut(uint256 date) external {
        Record storage record = records[msg.sender][date];

        require(record.clockIn != 0, "Not clocked in");
        require(record.clockOut == 0, "Already clocked out");

        record.clockOut = block.timestamp;

        emit ClockOut(msg.sender, date, block.timestamp);
    }

    /// View attendance record
    function getRecord(address user, uint256 date)
        external
        view
        returns (uint256 clockIn, uint256 clockOut)
    {
        Record memory record = records[user][date];
        return (record.clockIn, record.clockOut);
    }
}
