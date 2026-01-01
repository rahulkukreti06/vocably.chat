"use client";

import React from 'react';
import { signIn } from 'next-auth/react';

export default function GoogleSignInModal({ isOpen, onClose, message }: { isOpen: boolean; onClose: () => void; message?: string }) {
  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 'min(460px, 92vw)', background: '#0f1112', color: '#fff', borderRadius: 14, padding: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.6)' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>Sign Up</h2>
          <p style={{ marginTop: 8, marginBottom: 18, color: '#9aa1a8', fontSize: 13 }}>{message ?? 'By continuing, you agree to our User Agreement and acknowledge that you understand the Privacy Policy.'}</p>

          <button
            onClick={() => signIn('google')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              width: '100%',
              background: '#fff',
              color: '#111',
              borderRadius: 999,
              padding: '12px 16px',
              fontWeight: 700,
              fontSize: 16,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 18px rgba(0,0,0,0.25)'
            }}
            aria-label="Continue with Google"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" style={{ display: 'block' }}>
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.74 1.22 9.26 3.23l6.93-6.93C36.44 2.54 30.53 0 24 0 14.93 0 6.93 5.12 2.74 12.57l7.98 6.2C12.94 15.01 17.99 9.5 24 9.5z"/>
              <path fill="#34A853" d="M46.49 24.5c0-1.66-.14-3.27-.39-4.82H24v9.13h12.87c-.55 2.96-2.22 5.47-4.74 7.12l7.7 5.94C43.96 38.13 46.49 31.7 46.49 24.5z"/>
              <path fill="#4A90E2" d="M9.19 28.77A14.8 14.8 0 0 1 8 24c0-1.34.2-2.64.56-3.86L.58 13.93A23.97 23.97 0 0 0 0 24c0 3.9.93 7.59 2.56 10.86l6.63-6.09z"/>
              <path fill="#FBBC05" d="M24 48c6.53 0 12.44-2.54 16.64-6.51l-7.7-5.94C30.74 34.95 27.54 36.17 24 36.17c-6.01 0-11.06-5.51-13.28-12.29l-7.98 6.2C6.93 42.88 14.93 48 24 48z"/>
            </svg>
            <span style={{ flex: 1 }}>Continue with Google</span>
          </button>

          <div style={{ height: 12 }} />
          <button onClick={onClose} style={{ background: 'transparent', color: '#cbd5e1', border: 'none', fontWeight: 700, padding: '8px 12px', cursor: 'pointer' }}>Close</button>
        </div>
      </div>
    </div>
  );
}
