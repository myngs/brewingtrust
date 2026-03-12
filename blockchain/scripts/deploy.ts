import { ethers } from "hardhat";

async function main() {
  console.log("Starting deployment...");

  // Get all available accounts
  const signers = await ethers.getSigners();

  // Pick the first available account
  const deployer = signers[0];

  console.log("Deploying with account:", deployer.address);

  const Attendance = await ethers.getContractFactory(
    "Attendance",
    deployer // 👈 IMPORTANT
  );

  // Guard against stale artifacts (older Attendance ABI without hash-based storage).
  try {
    Attendance.interface.getFunction("storeAttendanceRecord");
    Attendance.interface.getFunction("getAttendanceRecord");
  } catch {
    throw new Error(
      'Stale/incorrect Attendance artifact detected. Run "npx hardhat compile" in the blockchain folder, then redeploy.'
    );
  }

  const attendance = await Attendance.deploy();
  console.log("Deploy transaction sent");

  await attendance.waitForDeployment();
  console.log("Contract deployed");

  const address = await attendance.getAddress();
  console.log("Attendance address:", address);
}

main().catch((error) => {
  console.error("DEPLOY ERROR:", error);
  process.exitCode = 1;
});
