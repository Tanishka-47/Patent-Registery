import React from 'react';

const STATUSES = [
  'Filed',
  'Under Examination',
  'Granted',
  'Rejected',
  'Transferred',
  'Expired',
];

function getStatusIndex(status) {
  // Normalize and find closest match
  const idx = STATUSES.findIndex(s => s.toLowerCase() === (status || '').toLowerCase());
  if (idx !== -1) return idx;
  // Fallback for 'Pending' or unknown
  if ((status || '').toLowerCase() === 'pending') return 0;
  return 0;
}

export default function PatentStatusTimeline({ status }) {
  const currentIdx = getStatusIndex(status);
  return (
    <div style={{ display: 'flex', alignItems: 'center', margin: '0 0 8px 0' }}>
      {STATUSES.map((s, i) => (
        <React.Fragment key={s}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: i < currentIdx ? '#4e8cff' : (i === currentIdx ? '#ffc107' : '#bbb'),
            color: i <= currentIdx ? '#fff' : '#222',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: i === currentIdx ? 'bold' : 'normal',
            border: i === currentIdx ? '3px solid #ff9800' : '2px solid #888',
            fontSize: 13
          }}>{s[0]}</div>
          {i < STATUSES.length - 1 && (
            <div style={{
              flex: 1,
              height: 4,
              background: i < currentIdx ? '#4e8cff' : '#bbb',
              margin: '0 4px', borderRadius: 2
            }} />
          )}
        </React.Fragment>
      ))}
      <div style={{marginLeft:16, fontSize:13, color:'#888'}}>
        <b>Legend:</b> <span style={{color:'#4e8cff'}}>Completed</span>, <span style={{color:'#ffc107'}}>Current</span>, <span style={{color:'#bbb'}}>Upcoming</span>
      </div>
    </div>
  );
}
