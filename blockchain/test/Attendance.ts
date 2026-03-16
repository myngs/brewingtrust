import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";

describe("Attendance", function () {
  async function deployFixture() {
    const [owner, employee] = await hre.ethers.getSigners();
    const Attendance = await hre.ethers.getContractFactory("Attendance");
    const attendance = await Attendance.deploy();
    return { attendance, owner, employee };
  }

  it("sets deployer as owner", async function () {
    const { attendance, owner } = await loadFixture(deployFixture);
    expect(await attendance.owner()).to.equal(owner.address);
  });

  it("stores and reads attendance record reference", async function () {
    const { attendance, employee } = await loadFixture(deployFixture);

    const date = 20260316;
    const hash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("clock-in"));

    await expect(attendance.storeAttendanceRecordFor(employee.address, date, hash))
      .to.emit(attendance, "AttendanceRecordStored")
      .withArgs(employee.address, date, hash, anyValue);

    const [storedHash, timestamp, exists] = await attendance.getAttendanceRecord(
      employee.address,
      date
    );

    expect(storedHash).to.equal(hash);
    expect(timestamp).to.be.greaterThan(0);
    expect(exists).to.equal(true);
  });

  it("updates an existing record reference", async function () {
    const { attendance, employee } = await loadFixture(deployFixture);

    const date = 20260316;
    const hash1 = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("clock-in"));
    const hash2 = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("clock-out"));

    const tx1 = await attendance.storeAttendanceRecordFor(employee.address, date, hash1);
    const receipt1 = await tx1.wait();

    await expect(attendance.storeAttendanceRecordFor(employee.address, date, hash2))
      .to.emit(attendance, "AttendanceRecordUpdated")
      .withArgs(employee.address, date, hash2, anyValue);

    const [storedHash, , exists] = await attendance.getAttendanceRecord(
      employee.address,
      date
    );
    expect(storedHash).to.equal(hash2);
    expect(exists).to.equal(true);

    const tx2 = await attendance.storeAttendanceRecordFor(employee.address, date, hash2);
    const receipt2 = await tx2.wait();
    expect(receipt1?.gasUsed).to.not.equal(undefined);
    expect(receipt2?.gasUsed).to.not.equal(undefined);
    expect(receipt1!.gasUsed).to.be.greaterThan(receipt2!.gasUsed);
  });

  it("only owner can write", async function () {
    const { attendance, employee } = await loadFixture(deployFixture);
    const date = 20260316;
    const hash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("x"));

    await expect(
      attendance.connect(employee).storeAttendanceRecordFor(employee.address, date, hash)
    ).to.be.revertedWith("Not owner");
  });

  it("verifies record hashes", async function () {
    const { attendance, employee } = await loadFixture(deployFixture);
    const date = 20260316;
    const hash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("record"));
    const otherHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("other"));

    await attendance.storeAttendanceRecordFor(employee.address, date, hash);
    expect(await attendance.verifyRecordHash(employee.address, date, hash)).to.equal(true);
    expect(await attendance.verifyRecordHash(employee.address, date, otherHash)).to.equal(
      false
    );
  });
});

