/**
 * Web3.js Utilities for Blockchain Interaction
 * 
 * This module handles all blockchain interactions with the Attendance smart contract.
 * It connects to Ganache for local Ethereum blockchain and stores attendance record hashes.
 * 
 * Data Flow:
 * 1. Backend stores attendance data off-chain (JSON)
 * 2. Hash is generated from the record
 * 3. This module sends the hash to the blockchain
 * 4. Transaction hash is returned for MongoDB storage
 */

const { ethers } = require('ethers');

// Blockchain configuration
const RPC_URL = process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:7545';
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '';
const PRIVATE_KEY = process.env.PRIVATE_KEY || '';

// Contract ABI - Updated for hash-based storage
const CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": true, "internalType": "uint256", "name": "date", "type": "uint256" },
      { "indexed": false, "internalType": "bytes32", "name": "recordHash", "type": "bytes32" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "AttendanceRecordStored",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": true, "internalType": "uint256", "name": "date", "type": "uint256" },
      { "indexed": false, "internalType": "bytes32", "name": "recordHash", "type": "bytes32" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "AttendanceRecordUpdated",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "date", "type": "uint256" },
      { "internalType": "bytes32", "name": "recordHash", "type": "bytes32" }
    ],
    "name": "storeAttendanceRecord",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" },
      { "internalType": "uint256", "name": "date", "type": "uint256" },
      { "internalType": "bytes32", "name": "recordHash", "type": "bytes32" }
    ],
    "name": "storeAttendanceRecordFor",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" },
      { "internalType": "uint256", "name": "date", "type": "uint256" }
    ],
    "name": "getAttendanceRecord",
    "outputs": [
      { "internalType": "bytes32", "name": "recordHash", "type": "bytes32" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
      { "internalType": "bool", "name": "exists", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" },
      { "internalType": "uint256", "name": "date", "type": "uint256" },
      { "internalType": "bytes32", "name": "recordHash", "type": "bytes32" }
    ],
    "name": "verifyRecordHash",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "date", "type": "uint256" }],
    "name": "getMyRecordHash",
    "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "stateMutability": "view",
    "type": "function"
  }
];

let provider;
let contract;
let wallet;
let contractOwner;
let isInitialized = false;

function normalizePrivateKey(value) {
  if (!value) return '';
  const trimmed = value.trim();
  if (trimmed.startsWith('0x')) return trimmed;
  // Allow common env style without 0x prefix
  if (/^[0-9a-fA-F]{64}$/.test(trimmed)) return `0x${trimmed}`;
  return trimmed;
}

function normalizeAddress(value, envName) {
  if (!value) return '';
  try {
    return ethers.getAddress(value.trim());
  } catch {
    throw new Error(`${envName} is not a valid Ethereum address: "${value}"`);
  }
}

function formatRpcHint(message) {
  return `${message} (check Ganache/Hardhat node is running and BLOCKCHAIN_RPC_URL is correct)`;
}

function summarizeEthersError(err) {
  if (!err) return '';
  const parts = [];
  if (err.shortMessage) parts.push(err.shortMessage);
  if (err.reason) parts.push(`reason=${err.reason}`);
  if (err.code) parts.push(`code=${err.code}`);
  if (err.info && err.info.error && err.info.error.message) parts.push(err.info.error.message);
  return parts.filter(Boolean).join(' | ');
}

/**
 * Initialize the blockchain connection using HTTP Provider
 */
async function initializeBlockchain() {
  if (isInitialized) return { provider, contract, wallet };
  
  try {
    const rpcUrl = (RPC_URL || '').trim();
    if (!rpcUrl) {
      throw new Error('Missing BLOCKCHAIN_RPC_URL');
    }

    // Ganache can be flaky with JSON-RPC batching; disable it for reliability.
    provider = new ethers.JsonRpcProvider(rpcUrl, undefined, { batchMaxCount: 1 });

    // Actually verify connectivity (JsonRpcProvider construction does not connect).
    const [network, blockNumber] = await Promise.all([
      provider.getNetwork(),
      provider.getBlockNumber()
    ]);

    console.log('Connected to blockchain at:', rpcUrl);
    console.log('Network:', network.name, `chainId=${network.chainId.toString()}`, 'block=', blockNumber);
    
    // Check if we have a private key for transactions
    if (PRIVATE_KEY) {
      const normalizedPrivateKey = normalizePrivateKey(PRIVATE_KEY);
      wallet = new ethers.Wallet(normalizedPrivateKey, provider);
      console.log('Wallet address:', wallet.address);
    }
    
    // Connect to contract if address is provided
    if (CONTRACT_ADDRESS) {
      const normalizedContractAddress = normalizeAddress(CONTRACT_ADDRESS, 'CONTRACT_ADDRESS');

      // Make sure there is contract code at the address (prevents common misconfig like using a wallet address).
      const code = await provider.getCode(normalizedContractAddress);
      if (!code || code === '0x') {
        const extra =
          wallet && wallet.address.toLowerCase() === normalizedContractAddress.toLowerCase()
            ? ' (it matches your PRIVATE_KEY wallet address)'
            : '';
        throw new Error(
          `No contract bytecode found at CONTRACT_ADDRESS=${normalizedContractAddress}${extra}. ` +
            'Deploy the Attendance contract and set CONTRACT_ADDRESS to the deployed contract address.'
        );
      }

      contract = new ethers.Contract(normalizedContractAddress, CONTRACT_ABI, provider);
      
      if (wallet) {
        contract = contract.connect(wallet);
      }
      
      console.log('Connected to contract at:', normalizedContractAddress);

      // Sanity-check that CONTRACT_ADDRESS points to the expected Attendance contract.
      // (If you updated the Solidity and didn't redeploy, eth_call will typically revert with "missing revert data".)
      try {
        await contract.getAttendanceRecord(wallet ? wallet.address : ethers.ZeroAddress, 0);
      } catch (shapeErr) {
        throw new Error(
          `CONTRACT_ADDRESS=${normalizedContractAddress} does not match the expected Attendance contract ABI. ` +
            'Fix: recompile + redeploy the Attendance contract and update CONTRACT_ADDRESS in both `blockchain/.env` and `server/.env`.'
        );
      }

      // Helpful diagnostics: who is the on-chain owner for onlyOwner writes?
      // If this read fails, it usually also indicates an ABI/address mismatch, so surface a strong hint.
      try {
        contractOwner = await contract.owner();
        console.log('Contract owner:', contractOwner);
        if (wallet && contractOwner.toLowerCase() !== wallet.address.toLowerCase()) {
          console.warn(
            `WARNING: PRIVATE_KEY wallet (${wallet.address}) is NOT the contract owner (${contractOwner}). ` +
              'Any write call protected by onlyOwner (e.g. storeAttendanceRecordFor) will revert.'
          );
        }
      } catch (ownerErr) {
        throw new Error(
          'Could not read contract owner(). This usually means CONTRACT_ADDRESS is pointing to an older/different contract. ' +
            'Fix: recompile + redeploy Attendance.sol and update CONTRACT_ADDRESS.'
        );
      }
    }
    
    isInitialized = true;
    return { provider, contract, wallet };
  } catch (error) {
    const message = (error && error.message) ? error.message : String(error);
    if (/socket hang up/i.test(message)) {
      const hinted = formatRpcHint(message);
      console.error('Error initializing blockchain:', hinted);
      throw new Error(hinted);
    } else {
      console.error('Error initializing blockchain:', message);
    }
    throw error;
  }
}

/**
 * Convert a hex string to bytes32
 */
function toBytes32(hexString) {
  let cleanHex = hexString.startsWith('0x') ? hexString.substring(2) : hexString;
  while (cleanHex.length < 64) cleanHex = '0' + cleanHex;
  if (cleanHex.length > 64) cleanHex = cleanHex.substring(0, 64);
  return '0x' + cleanHex;
}

function isSha256Hex(value) {
  if (!value) return false;
  const clean = value.startsWith('0x') ? value.slice(2) : value;
  return /^[0-9a-fA-F]{64}$/.test(clean);
}

async function withRetry(action, { retries = 2, isRetriable } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await action();
    } catch (err) {
      lastError = err;
      const message = (err && err.message) ? err.message : String(err);
      const shouldRetry = attempt < retries && (!isRetriable || isRetriable(message));
      if (!shouldRetry) break;
      await new Promise((r) => setTimeout(r, 250 * (attempt + 1)));
    }
  }
  throw lastError;
}

/**
 * Store attendance record hash on blockchain
 */
async function storeAttendanceOnChain(userWalletAddress, date, recordHash) {
  try {
    console.log('=== BLOCKCHAIN TRANSACTION START ===');
    console.log('RPC_URL:', RPC_URL);
    console.log('CONTRACT_ADDRESS:', CONTRACT_ADDRESS);
    console.log('User wallet address:', userWalletAddress);
    
    // Initialize if not already
    if (!isInitialized) {
      console.log('Initializing blockchain connection...');
      await initializeBlockchain();
    }
    
    if (!wallet) {
      console.error('ERROR: No wallet configured');
      return { success: false, error: 'Wallet not configured - missing PRIVATE_KEY' };
    }

    if (!contract) {
      return {
        success: false,
        error:
          'Contract not configured - missing/invalid CONTRACT_ADDRESS (deploy the contract and set CONTRACT_ADDRESS)'
      };
    }
    
    console.log('Wallet address:', wallet.address);

    // The Attendance contract uses onlyOwner for writes; fail fast with a clear message
    // instead of sending a tx that will revert.
    try {
      if (!contractOwner) contractOwner = await contract.owner();
      if (contractOwner && contractOwner.toLowerCase() !== wallet.address.toLowerCase()) {
        return {
          success: false,
          error:
            `Not owner: PRIVATE_KEY wallet (${wallet.address}) != contract owner (${contractOwner}). ` +
            'Fix: set server PRIVATE_KEY to the deployer/owner wallet, or call transferOwnership(newOwner) ' +
            'from the current owner to your server wallet address.'
        };
      }
    } catch (ownerErr) {
      // If we cannot read owner(), continue and let the tx error surface.
      console.warn('Owner precheck skipped (owner() read failed):', summarizeEthersError(ownerErr) || ownerErr?.message);
    }
    
    const dateUint = parseInt(String(date), 10);
    if (!Number.isFinite(dateUint)) {
      return { success: false, error: `Invalid date (expected YYYYMMDD number): "${date}"` };
    }
    console.log('Date (uint256):', dateUint);

    if (!userWalletAddress) {
      return { success: false, error: 'Missing userWalletAddress (expected an Ethereum address)' };
    }
    const normalizedUserWalletAddress = normalizeAddress(
      userWalletAddress,
      'userWalletAddress'
    );

    if (!isSha256Hex(recordHash)) {
      return { success: false, error: `Invalid recordHash (expected 32-byte hex / sha256): "${recordHash}"` };
    }
    const hashBytes32 = toBytes32(recordHash);
    console.log('Record hash:', recordHash);
    console.log('Hash (bytes32):', hashBytes32);
    
    // Simple transaction
    console.log('Sending transaction to blockchain...');
    
    const tx = await withRetry(
      () =>
        contract.storeAttendanceRecordFor(
          normalizedUserWalletAddress,
          dateUint,
          hashBytes32,
          { gasLimit: 500000 }
        ),
      {
        retries: 2,
        isRetriable: (message) =>
          /socket hang up/i.test(message) ||
          /ECONNRESET/i.test(message) ||
          /fetch failed/i.test(message)
      }
    );
    
    console.log('TX sent:', tx.hash);
    
    const receipt = await tx.wait(1);
    console.log('Receipt:', receipt.status, receipt.gasUsed?.toString());
    
    console.log('=== TRANSACTION MINED ===');
    console.log('Transaction hash:', receipt.hash);
    console.log('Block number:', receipt.blockNumber);
    console.log('Status:', receipt.status === 1 ? 'SUCCESS' : 'FAILED');
    console.log('===========================');
    
    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      status: receipt.status,
      gasUsed: receipt.gasUsed?.toString()
    };
  } catch (error) {
    console.error('=== BLOCKCHAIN TRANSACTION FAILED ===');
    const message =
      summarizeEthersError(error) ||
      ((error && error.message) ? error.message : String(error));
    const hintedMessage = /socket hang up/i.test(message) ? formatRpcHint(message) : message;
    console.error('Error:', hintedMessage);
    console.error('=====================================');
    return { success: false, error: hintedMessage };
  }
}

/**
 * Get attendance record reference from blockchain
 */
async function getAttendanceFromChain(walletAddress, date) {
  try {
    if (!isInitialized) await initializeBlockchain();
    
    const dateUint = parseInt(date);
    const result = await contract.getAttendanceRecord(walletAddress, dateUint);
    
    return { recordHash: result[0], timestamp: result[1], exists: result[2] };
  } catch (error) {
    console.error('Error getting attendance from blockchain:', error.message);
    return { error: error.message };
  }
}

/**
 * Verify if a record hash matches the one stored on blockchain
 */
async function verifyHashOnChain(walletAddress, date, recordHash) {
  try {
    if (!isInitialized) await initializeBlockchain();
    
    const dateUint = parseInt(date);
    const hashBytes32 = toBytes32(recordHash);
    
    return await contract.verifyRecordHash(walletAddress, dateUint, hashBytes32);
  } catch (error) {
    console.error('Error verifying hash on blockchain:', error.message);
    return false;
  }
}

/**
 * Get account balance
 */
async function getBalance(address) {
  try {
    if (!isInitialized) await initializeBlockchain();
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error('Error getting balance:', error.message);
    return '0';
  }
}

/**
 * Check if blockchain is connected
 */
async function isConnected() {
  try {
    if (!provider) return false;
    const network = await provider.getNetwork();
    return network.chainId > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Get blockchain network info
 */
async function getNetworkInfo() {
  try {
    if (!isInitialized) await initializeBlockchain();
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();
    return { chainId: network.chainId, name: network.name, blockNumber, connected: true };
  } catch (error) {
    return { connected: false, error: error.message };
  }
}

module.exports = {
  initializeBlockchain,
  storeAttendanceOnChain,
  getAttendanceFromChain,
  verifyHashOnChain,
  getBalance,
  isConnected,
  getNetworkInfo,
  CONTRACT_ADDRESS,
  CONTRACT_ABI
};
