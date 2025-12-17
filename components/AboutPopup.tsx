"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import CommunityRightPanel from "./CommunityRightPanel";

export default function AboutPopup({ onClose }: { onClose: () => void }) {
  const openedAt = useRef<number>(Date.now());
  useEffect(() => {
    openedAt.current = Date.now();
    console.log('[debug] AboutPopup mounted');
    return () => console.log('[debug] AboutPopup unmounted');
  }, []);

  // Ignore overlay clicks that happen immediately after opening (tap carryover)
  function handleOverlayClick() {
    try {
      const elapsed = Date.now() - openedAt.current;
      if (elapsed < 250) {
        console.log('[debug] Ignoring overlay click right after open (elapsed', elapsed, 'ms)');
        return;
      }
    } catch (e) {}
    onClose();
  }

  const overlay = (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
      <div className="mobile-right-overlay" onClick={handleOverlayClick} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999 }}>
        <div className="mobile-right-panel-wrap" onClick={(e) => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', inset: 0, padding: 16, zIndex: 10000 }}>
          <div className="mobile-right-panel-inner" style={{ position: 'relative', zIndex: 10001 }}>
            <button className="mobile-right-close" onClick={onClose} aria-label="Close" style={{ position: 'absolute', top: -10, right: -10, background: 'rgba(255,255,255,0.06)', border: 'none', color: '#fff', fontSize: 18, width: 36, height: 36, borderRadius: 999 }}>✕</button>
            <CommunityRightPanel />
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(overlay, document.body);
}
