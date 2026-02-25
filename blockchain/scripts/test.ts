// scripts/test.ts
import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying Attendance contract...");

  // 1️⃣ Deploy the contract
  const Attendance = await ethers.getContractFactory("Attendance");
  const attendance = await Attendance.deploy();
  await attendance.waitForDeployment();

  console.log("✅ Contract deployed at:", attendance.target); // Use only .target

  // 2️⃣ Get the 3rd prefunded Ganache account
  // Make sure hardhat.config.ts includes ONLY the 3rd account's private key
  const [thirdAccount] = await ethers.getSigners();

  console.log("\n👤 Testing 3rd prefunded account:", thirdAccount.address);

  const today = new Date();
  const date = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

  // 3️⃣ Clock In
  const txIn = await attendance.connect(thirdAccount).clockIn(date);
  await txIn.wait();
  console.log("⏰ Clocked In!");

  // 4️⃣ Clock Out
  const txOut = await attendance.connect(thirdAccount).clockOut(date);
  await txOut.wait();
  console.log("⏰ Clocked Out!");

  // 5️⃣ Fetch the attendance record
  const record = await attendance.getRecord(thirdAccount.address, date);
  console.log(
    `📋 Attendance Record → ClockIn: ${record.clockIn.toString()} | ClockOut: ${record.clockOut.toString()}`
  );

  console.log("\n🎉 Test completed for 3rd prefunded account!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

