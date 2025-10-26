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
    <div style={{ 
      margin: 10, 
      background: '#23263a', 
      padding: 20, 
      borderRadius: 8,
      color: 'white'
    }}>
      <h3 style={{ color: 'white', marginBottom: 15 }}>MetaMask Wallet Connection</h3>
      {account ? (
        <div style={{ color: 'white' }}>Connected: <code style={{ color: '#a77c4d' }}>{account}</code></div>
      ) : (
        <button 
          onClick={connectWallet}
          style={{
            background: '#a77c4d',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: '1em',
            transition: 'background 0.3s ease'
          }}
          onMouseOver={(e) => e.target.style.background = '#8a6a3b'}
          onMouseOut={(e) => e.target.style.background = '#a77c4d'}
        >
          Connect MetaMask
        </button>
      )}
      {error && <div style={{ color: '#ff6b6b', marginTop: 10 }}>{error}</div>}
    </div>
  );
}
