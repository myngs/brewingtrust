import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    ganache: {
      url: process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:7545",
      chainId: 1337,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    },
  },
};

export default config;
