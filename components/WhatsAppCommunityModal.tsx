import React, { useEffect, useState } from 'react';

interface WhatsAppCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WHATSAPP_LINK = 'https://chat.whatsapp.com/L3L3IHcWojn62u03l2p4AD'; // TODO: Replace with actual link

export const WhatsAppCommunityModal: React.FC<WhatsAppCommunityModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.6)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        background: 'rgb(65 61 61)',
        borderRadius: 24,
        padding: '2rem',
        maxWidth: 480,
        width: '90vw',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        textAlign: 'center',
      }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem', color: '#25D366' }}>Join Our WhatsApp Community!</h2>
        <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'rgb(247 240 240)' }}>
          Get announcements and a chance to get <b>premium membership</b>!<br />
          Only for the <b>first 100 members</b> (few spots remaining).
        </p>
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            background: '#25D366',
            color: '#fff',
            fontWeight: 700,
            fontSize: '1.2rem',
            padding: '0.9rem 2rem',
            borderRadius: 16,
            textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(37,211,102,0.15)',
            marginBottom: '1rem',
            transition: 'background 0.2s',
          }}
        >
          Join WhatsApp Group
        </a>
        <div>
          <button
            onClick={onClose}
            style={{
              marginTop: '1rem',
              background: '#eee',
              color: '#333',
              border: 'none',
              borderRadius: 8,
              padding: '0.6rem 1.4rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

