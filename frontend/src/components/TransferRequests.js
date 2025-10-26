import React from 'react';
import { getExplorerTxUrl } from '../utils/explorerUrl';

export default function TransferRequests({
  requests = [],
  user,
  onApprove,
  onReject,
  chainId = 1,
}) {
  if (!user) return <div style={{margin:20}}>Connect your wallet to manage transfers.</div>;
  if (!requests.length) return <div style={{margin:20}}>No transfer requests.</div>;
  return (
    <div style={{margin:20}}>
      <h3>Pending Ownership Transfers</h3>
      <ul style={{maxWidth:600}}>
        {requests.map((req, i) => (
          <li key={i} style={{marginBottom:16, border:'1px solid #333', borderRadius:8, padding:12, background:'#23263a'}}>
            <b>Patent #{req.patentId}</b> {req.patentTitle && `: ${req.patentTitle}`}<br />
            <span>From: <code>{req.from}</code></span><br />
            <span>To: <code>{req.to}</code></span><br />
            <span>Status: <b style={{color:req.status==='approved'?'#4caf50':req.status==='rejected'?'#f44336':'#ffc107'}}>{req.status}</b></span><br />
            {req.txHash && (
              <span>Tx: <a href={getExplorerTxUrl(req.txHash, chainId)} target="_blank" rel="noopener noreferrer">{req.txHash.slice(0,10)}...{req.txHash.slice(-8)}</a></span>
            )}
            <br />
            {req.status==='pending' && req.to && req.to.toLowerCase()===user.toLowerCase() && (
              <>
                <button style={{marginRight:10}} onClick={()=>onApprove && onApprove(req)}>Approve</button>
                <button onClick={()=>onReject && onReject(req)}>Reject</button>
              </>
            )}
            {req.status==='pending' && req.from && req.from.toLowerCase()===user.toLowerCase() && (
              <span style={{color:'#888'}}>Waiting for recipient approval...</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
