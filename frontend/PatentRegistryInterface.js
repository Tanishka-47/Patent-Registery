import { ethers } from 'ethers';

// Replace with your deployed contract address and ABI
const CONTRACT_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
const CONTRACT_ABI = [
  // Minimal ABI for demo; extend as needed
  // --- Transfer request/approval functions ---
  {
    "inputs": [
      { "internalType": "uint256", "name": "patentId", "type": "uint256" },
      { "internalType": "address", "name": "to", "type": "address" }
    ],
    "name": "requestTransfer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [ { "internalType": "uint256", "name": "patentId", "type": "uint256" } ],
    "name": "approveTransfer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [ { "internalType": "uint256", "name": "patentId", "type": "uint256" } ],
    "name": "rejectTransfer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [ { "internalType": "uint256", "name": "patentId", "type": "uint256" } ],
    "name": "getTransferRequest",
    "outputs": [
      { "internalType": "uint256", "name": "patentId", "type": "uint256" },
      { "internalType": "address", "name": "from", "type": "address" },
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint8", "name": "status", "type": "uint8" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_title", "type": "string" },
      { "internalType": "string", "name": "_inventor", "type": "string" },
      { "internalType": "string", "name": "_metadataHash", "type": "string" }
    ],
    "name": "registerPatent",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [ { "internalType": "uint256", "name": "patentId", "type": "uint256" } ],
    "name": "getPatent",
    "outputs": [
      { "internalType": "string", "name": "title", "type": "string" },
      { "internalType": "string", "name": "inventor", "type": "string" },
      { "internalType": "string", "name": "metadataHash", "type": "string" },
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "patentCount",
    "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ],
    "stateMutability": "view",
    "type": "function"
  }
];

export async function registerPatent(title, inventor, metadataHash, signer) {
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  const tx = await contract.registerPatent(title, inventor, metadataHash);
  await tx.wait();
  return tx.hash;
}

// --- Transfer request/approval functions ---
export async function requestTransfer(patentId, to, signer) {
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  const tx = await contract.requestTransfer(patentId, to);
  await tx.wait();
  return tx.hash;
}

export async function approveTransfer(patentId, signer) {
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  const tx = await contract.approveTransfer(patentId);
  await tx.wait();
  return tx.hash;
}

export async function rejectTransfer(patentId, signer) {
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  const tx = await contract.rejectTransfer(patentId);
  await tx.wait();
  return tx.hash;
}

export async function getTransferRequest(patentId, provider) {
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  const [pid, from, to, status, timestamp] = await contract.getTransferRequest(patentId);
  return {
    patentId: pid.toNumber ? pid.toNumber() : Number(pid),
    from,
    to,
    status: Number(status), // 0=None, 1=Pending, 2=Approved, 3=Rejected, 4=Completed
    timestamp: timestamp.toNumber ? timestamp.toNumber() : Number(timestamp),
  };
}

export async function fetchPatents(provider) {
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  const count = await contract.patentCount();
  const patents = [];
  for (let i = 1; i <= count; i++) {
    try {
      const [title, inventor, metadataHash, owner, timestamp] = await contract.getPatent(i);
      patents.push({
        id: i,
        title,
        inventor,
        metadataHash,
        owner,
        timestamp: Number(timestamp)
      });
    } catch (err) {
      // skip if not exists
    }
  }
  return patents;
}
