"use client";
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { FaHome, FaUsers, FaComments } from 'react-icons/fa';

export default function MobileBottomNav(): JSX.Element {
	const [visible, setVisible] = useState(true);
	const lastY = useRef(0);
	const ticking = useRef(false);

	useEffect(() => {
		// initialize lastY
		lastY.current = typeof window !== 'undefined' ? window.scrollY || 0 : 0;

		function onScroll() {
			const currentY = window.scrollY || 0;
			if (ticking.current) return;
			ticking.current = true;
			requestAnimationFrame(() => {
				const delta = currentY - lastY.current;
				// ignore tiny movements
				if (Math.abs(delta) > 8) {
					if (delta > 0 && currentY > 80) {
						// scrolling down
						setVisible(false);
					} else if (delta < 0) {
						// scrolling up
						setVisible(true);
					}
				}
				lastY.current = currentY;
				ticking.current = false;
			});
		}

		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll);
		return () => {
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
		};
	}, []);

	// motion preferences
	const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	const navStyle: React.CSSProperties = {
		position: 'fixed',
		bottom: 0,
		left: 0,
		right: 0,
		zIndex: 2147483647,
		paddingBottom: 'env(safe-area-inset-bottom)',
		WebkitTapHighlightColor: 'transparent',
		pointerEvents: 'auto',
		transform: visible ? 'translateY(0%)' : 'translateY(120%)',
		transition: prefersReduced ? undefined : 'transform 520ms cubic-bezier(.16,.84,.24,1), opacity 420ms ease',
		opacity: visible ? 1 : 0
	};

	useEffect(() => {
		if (typeof window === 'undefined') return;
		try {
			window.dispatchEvent(new CustomEvent('mobile-nav-visibility', { detail: { visible } }));
		} catch (err) {
			// ignore
		}
	}, [visible]);

	const innerStyle: React.CSSProperties = {
		background: 'rgba(0,0,0,0.92)',
		color: '#fff',
		borderTop: '1px solid rgba(255,255,255,0.04)',
		boxShadow: '0 -6px 30px rgba(0,0,0,0.6)',
		maxWidth: 1024,
		margin: '0 auto',
		display: 'flex',
		justifyContent: 'space-around',
		alignItems: 'center',
		height: 50,
		padding: '4px 8px'
	};

	const topLineStyle: React.CSSProperties = {
		height: 1,
		width: '100%',
		maxWidth: 1024,
		margin: '0 auto',
		background: '#535353'
	};
	
	const itemStyle: React.CSSProperties = {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		color: '#e5e7eb',
		textDecoration: 'none',
		fontSize: 10,
		gap: 3,
		fontWeight: 400
	};

	return (
		<nav data-debug-mobile-bottom-nav="1" aria-label="Mobile bottom navigation" style={navStyle}>
			<div style={innerStyle}>
				<Link href="/" aria-label="Home" style={itemStyle}>
					<FaHome size={20} />
					<span style={{ fontSize: 9, fontWeight: 400 }}>Home</span>
				</Link>

				<Link href="/community" aria-label="Community" style={itemStyle}>
					<FaUsers size={20} />
					<span style={{ fontSize: 9, fontWeight: 400 }}>Community</span>
				</Link>

				<Link href="/chat" aria-label="Chat" style={itemStyle}>
					<FaComments size={20} />
					<span style={{ fontSize: 9, fontWeight: 400 }}>Chat</span>
				</Link>
			</div>
		</nav>
	);
}
