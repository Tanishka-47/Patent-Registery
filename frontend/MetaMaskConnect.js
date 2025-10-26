import React, { useState } from 'react';
import { ethers } from 'ethers';

export default function MetaMaskConnect({ onWallet }) {
  const [account, setAccount] = useState('');
  const [error, setError] = useState('');

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        if (onWallet) onWallet(accounts[0]);
      } catch (err) {
        setError('User denied wallet connection');
      }
    } else {
      setError('MetaMask not detected');
    }
  };

  return (
    <div style={{ margin: 10, background: '#23263a', padding: 20, borderRadius: 8 }}>
      <h3>MetaMask Wallet Connection</h3>
      {account ? (
        <div>Connected: <code>{account}</code></div>
      ) : (
        <button onClick={connectWallet}>Connect MetaMask</button>
      )}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
}
