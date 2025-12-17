"use client";

import React, { useEffect, useRef } from "react";
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

  return (
    <div className="mobile-right-overlay" onClick={handleOverlayClick}>
      <div className="mobile-right-panel-wrap" onClick={(e) => e.stopPropagation()}>
        <div className="mobile-right-panel-inner">
          <button className="mobile-right-close" onClick={onClose} aria-label="Close">✕</button>
          <CommunityRightPanel />
        </div>
      </div>
    </div>
  );
}
