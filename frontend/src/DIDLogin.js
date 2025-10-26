import React, { useState } from 'react';

// Placeholder for DID login (e.g., Ceramic, uPort)
export default function DIDLogin({ onDID }) {
  const [did, setDID] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    // Simulate DID login for demo
    try {
      // In a real implementation, integrate with Ceramic/uPort SDKs
      const fakeDID = 'did:example:' + Math.random().toString(36).substring(2, 10);
      setDID(fakeDID);
      if (onDID) onDID(fakeDID);
    } catch (err) {
      setError('DID login failed');
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
      <h3 style={{ color: 'white', marginBottom: 15 }}>Decentralized Identity (DID) Login</h3>
      {did ? (
        <div style={{ color: 'white' }}>Logged in as: <code style={{ color: '#a77c4d' }}>{did}</code></div>
      ) : (
        <button 
          onClick={handleLogin}
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
          Login with DID
        </button>
      )}
      {error && <div style={{ color: '#ff6b6b', marginTop: 10 }}>{error}</div>}
    </div>
  );
}
