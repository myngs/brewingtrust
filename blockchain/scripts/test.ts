import { ethers } from "hardhat";

async function main() {
  const contractAddress = "0x529fCeA39cA81F1f6da74667b986838f64a5819c";

  const Attendance = await ethers.getContractAt(
    "Attendance",
    contractAddress
  );

  // ✅ Correct way in Hardhat v6
  const [signer] = await ethers.getSigners();
  const address = await signer.getAddress();

  const today = Math.floor(Date.now() / 1000);

  console.log("Sending clockIn...");

  const tx = await Attendance.connect(signer).clockIn(today);
  await tx.wait();

  console.log("Transaction confirmed!");

  const record = await Attendance.getRecord(address, today);

  console.log("Clock In:", record.clockIn.toString());
  console.log("Clock Out:", record.clockOut.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
