import React from 'react';

import PatentStatusTimeline from './PatentStatusTimeline';
import { getExplorerTxUrl } from '../utils/explorerUrl';

export default function PatentDetails({ patent, onBack }) {
  if (!patent) return <div>No patent selected.</div>;
  return (
    <div style={{padding:24}}>
      <button onClick={onBack} style={{marginBottom:16}}>Back to Results</button>
      <h2>Patent #{patent.id}: {patent.title}</h2>
      {/* Patent Status Timeline */}
      <div style={{margin:'24px 0 32px 0', padding:'0 8px'}}>
        <PatentStatusTimeline status={patent.status || 'Pending'} />
      </div>
      <div><b>Inventor:</b> {patent.inventor}</div>
      <div><b>Owner:</b> {patent.owner}</div>
      <div><b>Status:</b> {patent.status || 'Pending'}</div>
      <div><b>Application Number:</b> {patent.applicationNumber || 'N/A'}</div>
      <div><b>Filing Date:</b> {patent.filingDate ? new Date(patent.filingDate * 1000).toLocaleDateString() : 'N/A'}</div>
      <div><b>Grant Date:</b> {patent.grantDate ? new Date(patent.grantDate * 1000).toLocaleDateString() : 'N/A'}</div>
      <div><b>IPFS Hash:</b> <code>{patent.metadataHash}</code></div>
      <div><b>Abstract:</b> {patent.abstract || 'N/A'}</div>
      <div><b>Claims:</b> {patent.claims || 'N/A'}</div>
      <div><b>Description:</b> {patent.description || 'N/A'}</div>
      <div><b>Drawings:</b> {patent.drawings ? <a href={patent.drawings} target="_blank" rel="noopener noreferrer">View</a> : 'N/A'}</div>
      <div style={{marginTop:20}}>
        <button onClick={() => window.open(`https://ipfs.io/ipfs/${patent.metadataHash}`, '_blank')}>Download Document</button>
      </div>
      <div style={{marginTop:40}}>
        <b>Ownership History:</b>
        <ul>
          {(patent.owners || [patent.owner]).map((o, i) => (
            <li key={i}>{o}</li>
          ))}
        </ul>
      </div>
      <div style={{marginTop:40}}>
        <b>Blockchain Audit Trail:</b>
        <ul>
          {(patent.auditTrail || []).length === 0 ? <li>No events yet.</li> : patent.auditTrail.map((log, i) => (
            <li key={i}>
              <b>{log.event}</b> by {log.actor} at {log.timestamp ? new Date(log.timestamp * 1000).toLocaleString() : 'N/A'}<br />
              <b>Tx Hash:</b> {log.txHash ? (
                <>
                  <code style={{fontSize:12}}>{log.txHash.slice(0,10)}...{log.txHash.slice(-8)}</code>
                  <button style={{marginLeft:6, fontSize:11}} onClick={()=>navigator.clipboard.writeText(log.txHash)}>Copy</button>
                  <a href={getExplorerTxUrl(log.txHash, 1)} target="_blank" rel="noopener noreferrer" style={{marginLeft:8, color:'#4e8cff'}}>View</a>
                </>
              ) : 'N/A'}<br />
              <b>Block:</b> {log.blockNumber || 'N/A'}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
