require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-ethers");
require("@openzeppelin/hardhat-upgrades");
require("hardhat-abi-exporter");
require("hardhat-contract-sizer");
require("solidity-coverage");
require("dotenv").config();

// Quantum-resistant cryptography libraries
const { qanx } = require("@qanplatform/qanx.js");
const { KeyRing } = require("@qanplatform/keyring");

// QAN testnet configuration
const QAN_RPC_URL = process.env.QAN_RPC_URL || "https://testnet.qanx.link";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
      allowUnlimitedContractSize: true,
    },
    qanTestnet: {
      url: QAN_RPC_URL,
      chainId: 35442, // QAN testnet chain ID
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      gas: "auto",
      gasPrice: "auto",
      gasMultiplier: 1,
    },
    qanMainnet: {
      url: process.env.QAN_MAINNET_RPC_URL || "https://qanx.link",
      chainId: 35441, // QAN mainnet chain ID
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      gas: "auto",
      gasPrice: "auto",
      gasMultiplier: 1,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 40000,
  },
  abiExporter: {
    path: "./abi",
    runOnCompile: true,
    clear: true,
    flat: true,
    spacing: 2,
  },
  // Quantum-resistant cryptography configuration
  quantumResistant: {
    enabled: true,
    algorithm: "CRYSTALS-Dilithium", // Default quantum-resistant algorithm
    keySize: 2048, // Key size in bits
    signatureScheme: "Dilithium5", // Security level
  },
};

// Initialize quantum-resistant keyring
const keyring = new KeyRing({
  network: "testnet",
  algorithm: "CRYSTALS-Dilithium",
  keySize: 2048,
});

// Export quantum-resistant utilities
global.qanx = qanx;
global.keyring = keyring;
