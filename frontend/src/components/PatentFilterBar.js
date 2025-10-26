import React from 'react';

export default function PatentFilterBar({ filters, onChange, onReset }) {
  return (
    <div style={{marginBottom: 16, display:'flex', gap:10, flexWrap:'wrap'}}>
      <input
        type="text"
        value={filters.title||''}
        onChange={e => onChange({...filters, title: e.target.value})}
        placeholder="Title"
        style={{padding:8, borderRadius:4, border:'1px solid #ccc', width:120}}
      />
      <input
        type="text"
        value={filters.inventor||''}
        onChange={e => onChange({...filters, inventor: e.target.value})}
        placeholder="Inventor"
        style={{padding:8, borderRadius:4, border:'1px solid #ccc', width:120}}
      />
      <input
        type="text"
        value={filters.owner||''}
        onChange={e => onChange({...filters, owner: e.target.value})}
        placeholder="Owner"
        style={{padding:8, borderRadius:4, border:'1px solid #ccc', width:120}}
      />
      <input
        type="text"
        value={filters.applicationNumber||''}
        onChange={e => onChange({...filters, applicationNumber: e.target.value})}
        placeholder="Application #"
        style={{padding:8, borderRadius:4, border:'1px solid #ccc', width:120}}
      />
      <select
        value={filters.status||''}
        onChange={e => onChange({...filters, status: e.target.value})}
        style={{padding:8, borderRadius:4, border:'1px solid #ccc', width:120}}
      >
        <option value="">Any Status</option>
        <option value="Pending">Pending</option>
        <option value="Granted">Granted</option>
        <option value="Rejected">Rejected</option>
        <option value="Expired">Expired</option>
        <option value="Under Examination">Under Examination</option>
      </select>
      <button onClick={onReset} style={{padding:'8px 20px'}}>Reset</button>
    </div>
  );
}
