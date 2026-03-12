import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import { subtask } from "hardhat/config";
import {
  TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD,
  TASK_COMPILE_SOLIDITY_LOG_DOWNLOAD_COMPILER_END,
  TASK_COMPILE_SOLIDITY_LOG_DOWNLOAD_COMPILER_START,
} from "hardhat/builtin-tasks/task-names";
import {
  CompilerDownloader,
  CompilerPlatform,
} from "hardhat/internal/solidity/compiler/downloader";
import { getCompilersDir } from "hardhat/internal/util/global-dir";
import dotenv from "dotenv";

dotenv.config();

function normalizePrivateKey(value?: string): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith("0x")) return trimmed;
  // Allow envs without 0x prefix
  if (/^[0-9a-fA-F]{64}$/.test(trimmed)) return `0x${trimmed}`;
  return trimmed;
}

// Force Solidity compilation to use solc-js (WASM) instead of a native solc binary.
// This avoids Windows environments where spawning the native solc.exe fails (EPERM / AV blocking).
subtask(TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD).setAction(
  async (
    { quiet, solcVersion }: { quiet: boolean; solcVersion: string },
    hre
  ) => {
    const compilersCache = await getCompilersDir();
    const downloader = CompilerDownloader.getConcurrencySafeDownloader(
      CompilerPlatform.WASM,
      compilersCache
    );

    await downloader.downloadCompiler(
      solcVersion,
      async (isCompilerDownloaded: boolean) => {
        await hre.run(TASK_COMPILE_SOLIDITY_LOG_DOWNLOAD_COMPILER_START, {
          solcVersion,
          isCompilerDownloaded,
          quiet,
        });
      },
      async (isCompilerDownloaded: boolean) => {
        await hre.run(TASK_COMPILE_SOLIDITY_LOG_DOWNLOAD_COMPILER_END, {
          solcVersion,
          isCompilerDownloaded,
          quiet,
        });
      }
    );

    const wasmCompiler = await downloader.getCompiler(solcVersion);
    if (!wasmCompiler) {
      throw new Error(`WASM build of solc ${solcVersion} isn't working`);
    }

    return wasmCompiler as any;
  }
);

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    // Alias both "localhost" and "ganache" to the same RPC for convenience.
    localhost: {
      url: process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:7545",
      chainId: 1337,
      accounts: normalizePrivateKey(process.env.PRIVATE_KEY)
        ? [normalizePrivateKey(process.env.PRIVATE_KEY)!]
        : []
    },
    ganache: {
      url: process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:7545",
      chainId: 1337,
      accounts: normalizePrivateKey(process.env.PRIVATE_KEY)
        ? [normalizePrivateKey(process.env.PRIVATE_KEY)!]
        : []
    }
  },
};

export default config;
