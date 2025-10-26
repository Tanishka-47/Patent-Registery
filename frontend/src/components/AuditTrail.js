import React from 'react';

import { getExplorerTxUrl } from '../utils/explorerUrl';

export default function AuditTrail({ logs, chainId = 1 }) {
  return (
    <div style={{padding:24}}>
      <h2>Blockchain Audit Trail</h2>
      {logs.length === 0 ? (
        <div>No events found.</div>
      ) : (
        <ul>
          {logs.map((log, i) => (
            <li key={i} style={{marginBottom:12}}>
              <b>Event:</b> {log.event}<br />
              <b>Patent ID:</b> {log.patentId}<br />
              <b>From:</b> {log.from}<br />
              <b>To:</b> {log.to}<br />
              <b>Timestamp:</b> {log.timestamp ? new Date(log.timestamp * 1000).toLocaleString() : 'N/A'}<br />
              <b>Tx Hash:</b> {log.txHash ? (
                <>
                  <code style={{fontSize:12}}>{log.txHash.slice(0,10)}...{log.txHash.slice(-8)}</code>
                  <button style={{marginLeft:6, fontSize:11}} onClick={()=>navigator.clipboard.writeText(log.txHash)}>Copy</button>
                  <a href={getExplorerTxUrl(log.txHash, chainId)} target="_blank" rel="noopener noreferrer" style={{marginLeft:8, color:'#4e8cff'}}>View</a>
                </>
              ) : 'N/A'}<br />
              <b>Block:</b> {log.blockNumber || 'N/A'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
