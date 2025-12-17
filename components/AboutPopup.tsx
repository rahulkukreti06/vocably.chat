"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../lib/supabaseClient";
import { useSession, signIn } from "next-auth/react";

type Props = {
	open: boolean;
	onClose: () => void;
};

export default function AboutPopup({ open, onClose }: Props) {
	const { data: session } = useSession();
	const [ignoreUntil, setIgnoreUntil] = useState(0);
	const [members, setMembers] = useState<number>(0);
	const [joined, setJoined] = useState<boolean>(false);
	const [totalPosts, setTotalPosts] = useState<number | null>(null);

	useEffect(() => {
		if (open) {
			setIgnoreUntil(Date.now() + 300);
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [open]);

	useEffect(() => {
		if (!open) return;
		let mounted = true;
		(async () => {
			try {
				const userId = session?.user ? (session.user.id ?? session.user.email) : null;
				const url = userId ? `/api/community-members?userId=${encodeURIComponent(String(userId))}` : '/api/community-members';
				const res = await fetch(url);
				const data = await res.json().catch(() => null);
				if (!mounted) return;
				if (res.ok && data && typeof data.members === 'number') {
					setMembers(data.members);
					if (typeof data.joined === 'boolean') setJoined(!!data.joined);
				} else {
					try {
						const raw = localStorage.getItem('vocably_community_join');
						if (raw) {
							const parsed = JSON.parse(raw);
							if (typeof parsed.members === 'number') setMembers(parsed.members);
							if (typeof parsed.joined === 'boolean') setJoined(parsed.joined);
						}
					} catch (e) {}
				}
			} catch (e) {
				try {
					const raw = localStorage.getItem('vocably_community_join');
					if (raw) {
						const parsed = JSON.parse(raw);
						if (typeof parsed.members === 'number') setMembers(parsed.members);
						if (typeof parsed.joined === 'boolean') setJoined(parsed.joined);
					}
				} catch (e) {}
			}
		})();

		return () => { mounted = false; };
	}, [open, session]);

	useEffect(() => {
		if (!open) return;
		let mounted = true;
		(async () => {
			try {
				const res = await supabase.from('community_posts').select('*', { count: 'exact', head: true });
				const cnt = res.count ?? null;
				if (mounted) setTotalPosts(typeof cnt === 'number' ? cnt : 0);
			} catch (e) {}
		})();
		return () => { mounted = false; };
	}, [open]);

	useEffect(() => {
		function onJoinChanged() {
			try {
				const raw = localStorage.getItem('vocably_community_join');
				if (raw) {
					const parsed = JSON.parse(raw);
					if (typeof parsed.members === 'number') setMembers(parsed.members);
					if (typeof parsed.joined === 'boolean') setJoined(parsed.joined);
				}
			} catch (e) {}
		}
		window.addEventListener('vocably_join_changed', onJoinChanged as EventListener);
		return () => window.removeEventListener('vocably_join_changed', onJoinChanged as EventListener);
	}, []);

	async function handleJoinClick() {
		if (!session?.user) {
			signIn();
			return;
		}
		const nextJoined = !joined;
		try {
			const body = {
				action: nextJoined ? 'join' : 'leave',
				userId: session.user.id ?? session.user.email,
				userName: session.user.name ?? null,
				userEmail: session.user.email ?? null,
				userImage: session.user.image ?? null
			};
			const res = await fetch('/api/community-members', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
			const data = await res.json().catch(() => null);
			if (res.ok && data && typeof data.members === 'number') {
				setJoined(!!data.joined);
				setMembers(data.members);
				try { localStorage.setItem('vocably_community_join', JSON.stringify({ joined: !!data.joined, members: data.members })); } catch (e) {}
				try { window.dispatchEvent(new CustomEvent('vocably_join_changed')); } catch (e) {}
				return;
			}
		} catch (err) {
			// ignore
		}

		const nextMembers = nextJoined ? members + 1 : Math.max(0, members - 1);
		setJoined(nextJoined);
		setMembers(nextMembers);
		try { localStorage.setItem('vocably_community_join', JSON.stringify({ joined: nextJoined, members: nextMembers })); } catch (e) {}
		try { window.dispatchEvent(new CustomEvent('vocably_join_changed')); } catch (e) {}
	}

	if (!open || typeof document === "undefined") return null;

	const overlay = (
		<div
			onClick={(e) => {
				if (Date.now() < ignoreUntil) {
					e.stopPropagation();
					return;
				}
				onClose();
			}}
			onTouchEnd={(e) => {
				if (Date.now() < ignoreUntil) {
					e.stopPropagation();
					return;
				}
			}}
			style={{
				position: "fixed",
				inset: 0,
				background: "rgba(0,0,0,0.6)",
				zIndex: 9999,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				padding: 16,
			}}
		>
			<div
				role="dialog"
				aria-modal="true"
				onClick={(e) => e.stopPropagation()}
				style={{
					position: "relative",
					width: "100%",
					maxWidth: 720,
					maxHeight: "90vh",
					overflow: "auto",
					background: "#0b0b0b",
					borderRadius: 12,
					padding: 16,
					boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
				}}
			>
				<button
					onClick={onClose}
					aria-label="Close"
					style={{
						position: "absolute",
						top: -10,
						right: -10,
						width: 36,
						height: 36,
						borderRadius: 999,
						background: "rgba(255,255,255,0.06)",
						border: "none",
						color: "#fff",
						fontSize: 18,
					}}
				>
					✕
				</button>

				<div style={{ padding: 12 }}>
					<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}> 
						<div style={{ color: '#9ca3af', fontSize: 12, fontWeight: 700 }}>About this community</div>
						<button onClick={handleJoinClick} className="inline-flex items-center" style={{ background: 'transparent', border: '2px solid rgba(255,255,255,0.95)', color: '#ffffff', padding: '6px 14px', borderRadius: 999, fontWeight: 800, fontSize: 14, lineHeight: '18px', minWidth: 72, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{joined ? 'Joined' : 'Join'}</button>
					</div>

					<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
						<img src="/favicon.png" alt="Vocably" style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'cover' }} />
						<div style={{ flex: 1 }}>
							<div style={{ margin: 0, color: '#fff', fontWeight: 900, fontSize: 18 }}>Vocably</div>
							<div style={{ color: '#9ca3af', fontSize: 12, marginTop: 4 }}>Talk with strangers & learn new languages</div>
						</div>
					</div>

					<p style={{ marginTop: 10, color: '#cbd5e1', fontSize: 14 }}>
						Vocably is a topic-based voice and video chat platform built for meaningful conversations with people around the world. This community is designed for text-based posts and comments around conversation topics.
					</p>

					<div style={{ marginTop: 12, display: 'flex', gap: 12, justifyContent: 'space-between' }}>
						<div style={{ textAlign: 'center' }}>
							<div style={{ fontWeight: 800, color: '#fff' }}>{members}</div>
							<div style={{ color: '#9ca3af', fontSize: 12 }}>Members</div>
						</div>
						<div style={{ textAlign: 'center' }}>
							<div style={{ fontWeight: 800, color: '#fff' }}>{typeof totalPosts === 'number' ? totalPosts : '—'}</div>
							<div style={{ color: '#9ca3af', fontSize: 12 }}>Weekly contributions</div>
						</div>
					</div>

					<div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: 12 }}>
						<div style={{ color: '#9ca3af', fontSize: 12, fontWeight: 700 }}>COMMUNITY RULES</div>
						<ol style={{ marginTop: 8, paddingLeft: 18, color: '#cbd5e1', fontSize: 14 }}>
							<li style={{ marginBottom: 8 }}>Read the stickied post at the top of the community.</li>
							<li style={{ marginBottom: 8 }}>Be respectful and kind; treat others with courtesy.</li>
							<li style={{ marginBottom: 8 }}>No hate speech, harassment, or targeted abuse.</li>
							<li style={{ marginBottom: 8 }}>No spamming, advertising, or self-promotion.</li>
							<li style={{ marginBottom: 8 }}>Keep discussions on-topic and constructive.</li>
							<li style={{ marginBottom: 8 }}>Use clear, descriptive titles for your posts.</li>
							<li style={{ marginBottom: 8 }}>Do not share private or personal information without consent.</li>
							<li style={{ marginBottom: 8 }}>Report rule violations to moderators; be patient with moderation.</li>
						</ol>
					</div>
				</div>
			</div>
		</div>
	);

	return createPortal(overlay, document.body);
}

