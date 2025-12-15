"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function CommunitySidePanel({ mobile, open = true, onClose }: { mobile?: boolean, open?: boolean, onClose?: () => void }) {
  const year = new Date().getFullYear();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // trigger enter animation
    const t = setTimeout(() => setVisible(open), 10);
    return () => clearTimeout(t);
  }, [open]);

  const handleClose = () => {
    setVisible(false);
    // wait for animation to finish then call onClose
    setTimeout(() => onClose && onClose(), 240);
  };

  const mobileStyle: React.CSSProperties = mobile ? {
    position: 'fixed',
    top: 52,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    padding: 0,
    boxSizing: 'border-box',
    background: 'transparent',
    zIndex: 1000,
    overflow: 'hidden'
  } : {
    position: 'fixed',
    top: 64,
    left: 0,
    width: 240,
    bottom: 0,
    padding: 12,
    boxSizing: 'border-box',
    borderRight: '1px solid rgba(245,243,243,0.23)',
    background: '#000',
    zIndex: 998,
    overflowY: 'auto'
  };

  return (
    <aside className={"left-fixed" + (mobile ? ' mobile-panel' : '')} style={mobileStyle}>
      {!mobile && (
        <div className="left-inner" style={{ padding: 12 }}>
          <nav className="nav-list">
          <a className="nav-item" href="/">
            <span className="nav-icon">🏠</span>
            <span className="nav-label">Home</span>
          </a>
          <a className="nav-item" href="https://vocably.chat/community/chat" onClick={(e) => { e.preventDefault(); alert('Feature coming soon'); }}>
            <span className="nav-icon">💬</span>
            <span className="nav-label">Vocably Chat</span>
          </a>
          <a className="nav-item" href="/community/explore">
            <span className="nav-icon">🔍</span>
            <span className="nav-label">Explore</span>
          </a>
          <a className="nav-item" href="/community">
            <span className="nav-icon">📊</span>
            <span className="nav-label">All</span>
          </a>
          <a className="nav-item" href="/community/create">
            <span className="nav-icon">➕</span>
            <span className="nav-label">New conversation</span>
          </a>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.03)', margin: '12px 0' }} />

          <div className="links-section">
            <div className="games-title">Explore</div>
            <nav className="links-list" style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              <a className="nav-item" href="/blog"><span className="nav-icon">📰</span><span className="nav-label">Blog</span></a>
              <a className="nav-item" href="/blog/features"><span className="nav-icon">⚙️</span><span className="nav-label">Features</span></a>
              <a className="nav-item" href="/blog/how-it-works"><span className="nav-icon">🔎</span><span className="nav-label">How It Works</span></a>
              <a className="nav-item" href="/blog/about"><span className="nav-icon">ℹ️</span><span className="nav-label">About</span></a>
              <a className="nav-item" href="/"><span className="nav-icon">🚀</span><span className="nav-label">Try Vocably</span></a>
              <a className="nav-item" href="/privacy"><span className="nav-icon">🔒</span><span className="nav-label">Privacy Policy</span></a>
            </nav>
          <div className="sidepanel-footer" style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.03)', color: '#9ca3af', fontSize: 12, textAlign: 'center' }}>
            © {year} Vocably — All rights reserved
          </div>
        </div>
          </nav>
        </div>
      )}
      {mobile && (
        <>
          <div className={"mobile-overlay" + (visible ? ' open' : '')} onClick={handleClose} />
          <div className={"mobile-panel-inner" + (visible ? ' open' : '')} aria-hidden={!visible}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ color: '#fff', fontWeight: 800 }}>Community</div>
            </div>
            <div style={{ padding: 12 }}>
              {/* reuse existing nav list content */}
              <nav className="nav-list">
                <a className="nav-item" href="/">
                  <span className="nav-icon">🏠</span>
                  <span className="nav-label">Home</span>
                </a>
                <a className="nav-item" href="https://vocably.chat/community/chat" onClick={(e) => { e.preventDefault(); alert('Feature coming soon'); }}>
                  <span className="nav-icon">💬</span>
                  <span className="nav-label">Vocably Chat</span>
                </a>
                <a className="nav-item" href="/community/explore">
                  <span className="nav-icon">🔍</span>
                  <span className="nav-label">Explore</span>
                </a>
                <a className="nav-item" href="/community">
                  <span className="nav-icon">📊</span>
                  <span className="nav-label">All</span>
                </a>
                <a className="nav-item" href="/community/create">
                  <span className="nav-icon">➕</span>
                  <span className="nav-label">Start new conversation</span>
                </a>

                <div style={{ height: 1, background: 'rgba(255,255,255,0.03)', margin: '12px 0' }} />

                <div className="links-section">
                  <div className="games-title">Explore</div>
                  <nav className="links-list" style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                    <a className="nav-item" href="/blog"><span className="nav-icon">📰</span><span className="nav-label">Blog</span></a>
                    <a className="nav-item" href="/blog/features"><span className="nav-icon">⚙️</span><span className="nav-label">Features</span></a>
                    <a className="nav-item" href="/blog/how-it-works"><span className="nav-icon">🔎</span><span className="nav-label">How It Works</span></a>
                    <a className="nav-item" href="/blog/about"><span className="nav-icon">ℹ️</span><span className="nav-label">About</span></a>
                    <a className="nav-item" href="/"><span className="nav-icon">🚀</span><span className="nav-label">Try Vocably</span></a>
                    <a className="nav-item" href="/privacy"><span className="nav-icon">🔒</span><span className="nav-label">Privacy Policy</span></a>
                  </nav>
                  <div className="sidepanel-footer" style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.03)', color: '#9ca3af', fontSize: 12, textAlign: 'center' }}>
                    © {year} Vocably — All rights reserved
                  </div>
                </div>
              </nav>
            </div>
          </div>
        </>
      )}
      <style dangerouslySetInnerHTML={{ __html: `
        .left-fixed { font-family: Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial }
        .left-fixed .nav-list{ display:flex; flex-direction:column; gap:8px }
        /* hide scrollbar by default, show thin scrollbar on hover (WebKit + Firefox) */
        .left-fixed { scrollbar-width: none; -ms-overflow-style: none }
        .left-fixed::-webkit-scrollbar{ width: 0; height: 0; }
        .left-fixed:hover { scrollbar-width: thin; }
        .left-fixed:hover::-webkit-scrollbar{ width: 8px; }
        .left-fixed::-webkit-scrollbar-track{ background: transparent }
        .left-fixed::-webkit-scrollbar-thumb{ background: rgba(255,255,255,0.12); border-radius: 8px; }
        .left-fixed .nav-item .nav-icon{ width:34px; height:34px; display:inline-flex; align-items:center; justify-content:center; background:transparent; border-radius:8px; flex:0 0 34px; font-size:18px; transition: background 160ms ease, transform 160ms ease; box-sizing: border-box }
          /* keep box-sizing and reserve border space so hover doesn't change layout */
          .left-fixed .nav-item{ display:flex; align-items:center; gap:14px; padding:10px 12px; color:#cbd5e1; text-decoration:none; border-radius:10px; font-size:15px; transition: background 180ms ease, color 180ms ease, box-shadow 200ms ease; box-sizing: border-box; border: 1px solid rgba(255,255,255,0.00) }
          /* apply the icon's inner highlight to the whole button on hover; remove the icon-only background to avoid double-highlighting */
          .left-fixed .nav-item:hover{ background: rgba(255,255,255,0.28); color:#000; transform: none; box-shadow: 0 10px 26px rgba(0,0,0,0.6), inset 0 -2px 6px rgba(0,0,0,0.18); border-color: rgba(255,255,255,0.14) }
          .left-fixed .nav-item:hover .nav-icon{ background: transparent; color: inherit; transform: none; box-shadow: none }
        .games-title{ color:#9ca3af; font-size:12px; margin:8px 2px; font-weight:700 }
        .game-sub{ font-size:12px; opacity:0.9 }
        .new-badge{ background:#ff7b3a; color:#fff; padding:4px 6px; border-radius:999px; font-size:11px; font-weight:800 }
        .games-list{ display:flex; flex-direction:column; gap:8px; margin-top:10px }
        .game-card{ display:flex; align-items:center; gap:14px; padding:8px 10px; border-radius:12px; background: linear-gradient(180deg,#9b51e0 0%, #7c3aed 100%); color:#fff; border:none; width:100%; text-align:left }
        .game-avatar{ width:28px; height:28px; border-radius:8px; display:inline-flex; align-items:center; justify-content:center; font-size:16px; background: rgba(255,255,255,0.08) }
        .game-name{ font-weight:800; font-size:14px }

        .games-item{ color:#cbd5e1; text-decoration:none; padding:6px 9px; border-radius:8px }
        .games-item:hover{ color:#fff; background: rgba(255,255,255,0.02) }

        @media (max-width: 1024px) {
          .community-grid { grid-template-columns: 1fr !important; }
          .left-fixed { display: none !important; }
          .left-fixed.mobile-panel { display: block !important; }
          .community-main-wrapper { padding-left: 0 !important }
          .right-rail { width: 100% !important }
        }

        /* mobile overlay and panel animation */
        .mobile-overlay { position: fixed; top: 52px; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0); transition: background 200ms ease; z-index: 999 }
        .mobile-overlay.open { background: rgba(0,0,0,0.45) }
        .mobile-panel-inner { position: fixed; top: 52px; right: 0; bottom: 0; width: 50%; max-width: 420px; min-width: 240px; background: #000; transform: translateX(100%); transition: transform 220ms cubic-bezier(.2,.9,.2,1); z-index: 1000; box-shadow: -8px 0 24px rgba(2,6,23,0.5); overflow-y: auto; scrollbar-width: none; -ms-overflow-style: none; }
        .mobile-panel-inner::-webkit-scrollbar{ width: 0; height: 0 }
        .mobile-panel-inner.open { transform: translateX(0) }

        @media (min-width: 1025px) {
          .community-main-wrapper { padding-left: 260px; }
        }
      ` }} />
    </aside>
  );
}
