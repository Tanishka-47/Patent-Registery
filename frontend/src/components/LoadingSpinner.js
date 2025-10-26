import React from 'react';

export default function LoadingSpinner({ show, text }) {
  if (!show) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(24,28,39,0.7)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column'
    }}>
      <div className="lds-dual-ring" style={{marginBottom:10}}></div>
      <div style={{color:'#fff',fontWeight:'bold'}}>{text||'Loading...'}</div>
      <style>{`
      .lds-dual-ring {
        display: inline-block;
        width: 64px;
        height: 64px;
      }
      .lds-dual-ring:after {
        content: " ";
        display: block;
        width: 46px;
        height: 46px;
        margin: 1px;
        border-radius: 50%;
        border: 6px solid #4e8cff;
        border-color: #4e8cff transparent #4e8cff transparent;
        animation: lds-dual-ring 1.2s linear infinite;
      }
      @keyframes lds-dual-ring {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      `}</style>
    </div>
  );
}
