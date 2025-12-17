"use client";

import React from "react";
import CommunityRightPanel from "./CommunityRightPanel";

export default function AboutPopup({ onClose }: { onClose: () => void }) {
  return (
    <div className="mobile-right-overlay" onClick={onClose}>
      <div className="mobile-right-panel-wrap" onClick={(e) => e.stopPropagation()}>
        <div className="mobile-right-panel-inner">
          <button className="mobile-right-close" onClick={onClose} aria-label="Close">✕</button>
          <CommunityRightPanel />
        </div>
      </div>
    </div>
  );
}
