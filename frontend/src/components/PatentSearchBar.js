import React from 'react';

export default function PatentSearchBar({ value, onChange, onSearch }) {
  return (
    <div style={{marginBottom: 16, display:'flex', gap:10}}>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search by title, inventor, owner..."
        style={{padding:8, borderRadius:4, border:'1px solid #ccc', width:250}}
      />
      <button onClick={onSearch} style={{padding:'8px 20px'}}>Search</button>
    </div>
  );
}
