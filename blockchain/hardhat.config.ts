import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545",
      chainId: 1337,
      accounts: ["4f8526b03cc193a71724481b5ca8bc7ff5731383b8a03ba50232b770b3d6be4a"]
    },
  },
};

export default config;
