"use client";

import React, { useEffect, useState } from 'react';

export default function MaintenanceBanner() {
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    const show = () => setVisible(true);
    const hide = () => setVisible(false);
    window.addEventListener('showMaintenance', show as EventListener);
    window.addEventListener('hideMaintenance', hide as EventListener);

    // Respect optional localStorage flag
    try {
      const stored = localStorage.getItem('vocably:maintenance');
      if (stored === '1' || stored === 'true') setVisible(true);
    } catch (e) {}

    return () => {
      window.removeEventListener('showMaintenance', show as EventListener);
      window.removeEventListener('hideMaintenance', hide as EventListener);
    };
  }, []);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 2147483647,
      padding: 12,
      textAlign: 'center',
      background: '#ffedd5',
      color: '#92400e',
      fontWeight: 500,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif",
      boxShadow: '0 2px 6px rgba(0,0,0,0.12)'
    }} role="status" aria-live="polite">
      Server under maintenance. Will reopen tomorrow. You can use the Vocably Community in the meantime. <a href="/community" style={{ color: '#0b1220', fontWeight: 700, marginLeft: 8, textDecoration: 'none' }}>Open Vocably Community</a>
      <button onClick={() => window.dispatchEvent(new CustomEvent('hideMaintenance'))} aria-label="Close maintenance banner" style={{ position: 'absolute', right: 12, top: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280' }}>✕</button>
    </div>
  );
}
