"use client";

import React from "react";
import { createPortal } from "react-dom";
import CommunityRightPanel from "./CommunityRightPanel";

export default function AboutPopup({ onClose }: { onClose: () => void }) {
	if (typeof document === 'undefined') return null;

	React.useEffect(() => {
		console.log('[debug] AboutPopup mounted (portal)');
		return () => console.log('[debug] AboutPopup unmounted (portal)');
	}, []);

	const overlay = (
		<div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999 }} onClick={onClose}>
			<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 16 }} onClick={(e) => e.stopPropagation()}>
				<div style={{ position: 'relative', width: '100%', maxWidth: 420, maxHeight: 'calc(100vh - 96px)', overflow: 'auto', background: '#000', borderRadius: 12, boxShadow: '0 10px 40px rgba(0,0,0,0.6)', padding: 12 }}>
					<button onClick={onClose} aria-label="Close" style={{ position: 'absolute', top: -10, right: -10, background: 'rgba(255,255,255,0.06)', border: 'none', color: '#fff', fontSize: 18, width: 36, height: 36, borderRadius: 999 }}>✕</button>
					<CommunityRightPanel />
				</div>
			</div>
		</div>
	);

	return createPortal(overlay, document.body);
}

