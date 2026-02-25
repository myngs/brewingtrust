export const contractAddress = "0xa60Cf04F07b29E7bcA1190D393351F3e67bB6Dff";

export const contractABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "date",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "time",
        "type": "uint256"
      }
    ],
    "name": "ClockIn",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "date",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "time",
        "type": "uint256"
      }
    ],
    "name": "ClockOut",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "date",
        "type": "uint256"
      }
    ],
    "name": "clockIn",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "date",
        "type": "uint256"
      }
    ],
    "name": "clockOut",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "date",
        "type": "uint256"
      }
    ],
    "name": "getRecord",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "clockIn",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "clockOut",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];
