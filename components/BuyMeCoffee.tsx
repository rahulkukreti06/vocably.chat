'use client';

import { useEffect, useRef } from 'react';

export default function BuyMeCoffee() {
  return (
    <button
      onClick={() => window.open('https://www.buymeacoffee.com/rahulkukreti06', '_blank', 'noopener,noreferrer')}
      className="header-btn buy-coffee-btn"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        background: 'linear-gradient(180deg,#ffe066,#ffd400)',
        border: '1.4px solid #ffe066',
        borderRadius: '12px',
        cursor: 'pointer',
        padding: '0 0.8rem',
        boxShadow: '0 2px 8px -2px rgba(0,0,0,0.45)',
        transition: 'background 0.22s, transform 0.18s',
        fontWeight: 650,
        fontSize: 'clamp(13px,0.8vw,15px)',
        color: '#1d1d1d'
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
    >
  <span style={{ whiteSpace: 'nowrap' }}>Buy me a coffee</span>
    </button>
  );
}