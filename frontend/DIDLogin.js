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
    <div style={{ margin: 10, background: '#23263a', padding: 20, borderRadius: 8 }}>
      <h3>Decentralized Identity (DID) Login</h3>
      {did ? (
        <div>Logged in as: <code>{did}</code></div>
      ) : (
        <button onClick={handleLogin}>Login with DID</button>
      )}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
}
