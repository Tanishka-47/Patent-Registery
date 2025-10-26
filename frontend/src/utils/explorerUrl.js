// Returns the correct explorer base URL for the current network
export function getExplorerBaseUrl(chainId) {
  // Defaults for common networks
  switch (String(chainId)) {
    case '1': return 'https://etherscan.io/tx/'; // Mainnet
    case '5': return 'https://goerli.etherscan.io/tx/';
    case '11155111': return 'https://sepolia.etherscan.io/tx/';
    case '31337': return 'http://localhost:8545/tx/'; // Hardhat local
    default: return 'https://etherscan.io/tx/';
  }
}

export function getExplorerTxUrl(txHash, chainId) {
  return getExplorerBaseUrl(chainId) + txHash;
}
