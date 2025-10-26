import React, { useState } from 'react';

export default function TransferPatent({ patents, onTransfer }) {
  const [patentId, setPatentId] = useState('');
  const [newOwner, setNewOwner] = useState('');
  const [status, setStatus] = useState('');

  const handleTransfer = async (e) => {
    e.preventDefault();
    setStatus('Transferring...');
    try {
      await onTransfer(Number(patentId), newOwner);
      setStatus('Transfer requested!');
    } catch (err) {
      setStatus('Transfer failed: ' + err.message);
    }
  };

  return (
    <div style={{padding:24}}>
      <h2>Transfer Patent Ownership</h2>
      <form onSubmit={handleTransfer} style={{marginBottom:20}}>
        <div>
          <label>Patent ID:</label>
          <input type="number" value={patentId} onChange={e => setPatentId(e.target.value)} required style={{margin:8}} />
        </div>
        <div>
          <label>New Owner Address:</label>
          <input type="text" value={newOwner} onChange={e => setNewOwner(e.target.value)} required style={{margin:8}} />
        </div>
        <button type="submit">Request Transfer</button>
      </form>
      {status && <div>{status}</div>}
      <div style={{marginTop:30}}>
        <b>My Patents:</b>
        <ul>
          {patents.map(p => (
            <li key={p.id}>
              <b>#{p.id}</b>: {p.title} <br />
              <span>Current Owner: {p.owner}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
