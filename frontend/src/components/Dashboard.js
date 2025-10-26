import React from 'react';

import PatentStatusTimeline from './PatentStatusTimeline';

export default function Dashboard({ user, patents }) {
  return (
    <div style={{padding: 24}}>
      <h2>Welcome{user ? `, ${user}` : ''}!</h2>
      <div style={{marginTop: 20, marginBottom: 20}}>
        <b>Total Registered Patents:</b> {patents.length}
      </div>
      <div style={{marginBottom: 20}}>
        <b>My Patents:</b>
        <ul>
          {patents.filter(p => user && p.owner && p.owner.toLowerCase() === user.toLowerCase()).length === 0 ? (
            <li>No patents registered by you yet.</li>
          ) : patents.filter(p => user && p.owner && p.owner.toLowerCase() === user.toLowerCase()).map(patent => (
            <li key={patent.id}>
              <b>#{patent.id}</b>: {patent.title} <br />
              <span>Status: <b>{patent.status || 'Pending'}</b></span><br />
              <span>Inventor: {patent.inventor}</span><br />
              <span>IPFS: <code>{patent.metadataHash}</code></span><br />
              <span>Timestamp: {new Date(patent.timestamp * 1000).toLocaleString()}</span>
              <div style={{margin:'10px 0'}}>
                <PatentStatusTimeline status={patent.status || 'Pending'} />
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div style={{marginTop:40, color:'#888'}}>
        <b>Quick Actions:</b>
        <ul>
          <li>Register a new patent</li>
          <li>Transfer ownership</li>
          <li>View blockchain audit trail</li>
        </ul>
      </div>
    </div>
  );
}
