"use client";

import Link from "next/link";
import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import { useSession } from "next-auth/react";
import GoogleSignInModal from './GoogleSignInModal';

export default function CommunityRightPanel() {
  const { data: session } = useSession();
  const [members, setMembers] = useState<number>(0);
  const [joined, setJoined] = useState<boolean>(false);
  const [totalPosts, setTotalPosts] = useState<number | null>(null);
  const [showGoogleSignIn, setShowGoogleSignIn] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadMembers() {
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
          // fallback to localStorage
          try {
            const raw = localStorage.getItem('vocably_community_join');
            if (raw) {
              const parsed = JSON.parse(raw);
              if (typeof parsed.members === 'number') setMembers(parsed.members);
              if (typeof parsed.joined === 'boolean') setJoined(parsed.joined);
            }
          } catch (e) { console.error('local fallback parse error', e); }
        }
      } catch (e) {
        console.error('Failed to fetch /api/community-members', e);
        try {
          const raw = localStorage.getItem('vocably_community_join');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (typeof parsed.members === 'number') setMembers(parsed.members);
            if (typeof parsed.joined === 'boolean') setJoined(parsed.joined);
          }
        } catch (e) { console.error('local fallback parse error', e); }
      }
    }
    loadMembers();
    return () => { mounted = false; };
  }, [session]);

  useEffect(() => {
    let mounted = true;
    async function loadTotalPosts() {
      try {
        const res = await supabase.from('community_posts').select('*', { count: 'exact', head: true });
        const cnt = res.count ?? null;
        if (mounted) setTotalPosts(typeof cnt === 'number' ? cnt : 0);
      } catch (e) {}
    }
    loadTotalPosts();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
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

  function handleJoinClick() {
    if (!session?.user) {
      setShowGoogleSignIn(true);
      return;
    }
    const nextJoined = !joined;
    (async () => {
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
        console.log('community-members response', res.status, data);
        if (res.ok && data && typeof data.members === 'number') {
          setJoined(!!data.joined);
          setMembers(data.members);
          try { localStorage.setItem('vocably_community_join', JSON.stringify({ joined: !!data.joined, members: data.members })); } catch (e) {}
          try { window.dispatchEvent(new CustomEvent('vocably_join_changed')); } catch (e) {}
          return;
        }
      } catch (err) {
        console.error('Error calling /api/community-members:', err);
      }

      // fallback to localStorage behavior
      const nextMembers = nextJoined ? members + 1 : Math.max(0, members - 1);
      setJoined(nextJoined);
      setMembers(nextMembers);
      try { localStorage.setItem('vocably_community_join', JSON.stringify({ joined: nextJoined, members: nextMembers })); } catch (e) {}
      try { window.dispatchEvent(new CustomEvent('vocably_join_changed')); } catch (e) {}
    })();
  }

  const asideRef = useRef<HTMLElement | null>(null);
  const baseTopRef = useRef<number | null>(null);
  const startScrollRef = useRef<number>(0);

  useEffect(() => {
    function updateTop() {
      if (typeof window === 'undefined') return;
      if (window.innerWidth < 1025) {
        if (asideRef.current) asideRef.current.style.top = '';
        baseTopRef.current = null;
        startScrollRef.current = 0;
        return;
      }
      const grid = document.querySelector('.community-grid');
      const minTop = 64;
      const maxShift = 64; // how much the rail can lift upward as you scroll
      let top = minTop;
      if (grid) {
        const rect = grid.getBoundingClientRect();
        if (baseTopRef.current === null) {
          baseTopRef.current = rect.top;
          startScrollRef.current = window.scrollY || 0;
        }
        const baseTop = baseTopRef.current ?? rect.top;
        const delta = Math.max(0, (window.scrollY || 0) - (startScrollRef.current || 0));
        const shift = Math.min(maxShift, delta);
        top = Math.max(minTop, Math.round(baseTop - shift));
      }
      if (asideRef.current) asideRef.current.style.top = `${top}px`;
    }

    // run initially and on resize
    updateTop();
    let raf = 0;
    function onScroll() {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updateTop);
    }
    window.addEventListener('resize', updateTop);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('resize', updateTop);
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf as number);
    };
  }, []);

  return (
    <>
    <aside ref={asideRef} className="right-rail" style={{ width: 340, maxHeight: 'calc(100vh - 96px)', overflowY: 'auto' }}>
      <div style={{ padding: 12, borderRadius: 8, background: '#000' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
          <div style={{ color: '#9ca3af', fontSize: 12, fontWeight: 700 }}>About this community</div>
          <button
            onClick={handleJoinClick}
            className="inline-flex items-center"
            style={{
              background: 'transparent',
              border: '2px solid rgba(255,255,255,0.95)',
              color: '#ffffff',
              padding: '6px 14px',
              borderRadius: 999,
              fontWeight: 800,
              fontSize: 14,
              lineHeight: '18px',
              minWidth: 72,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {joined ? 'Joined' : 'Join'}
          </button>
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
          Users can share questions, discussion ideas, or conversation prompts. Engage with others through comments and reactions. Posts help users discover topics and connect before joining live voice rooms. Active discussions often lead to real-time conversations on Vocably.
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

        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: 12 }}>
          <a href="https://vocably.chat/" target="_blank" rel="noreferrer" style={{ color: '#9ca3af', textDecoration: 'none', fontWeight: 700 }}>vocably.chat</a>
          <div style={{ marginLeft: 'auto', color: '#9ca3af', fontSize: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
            <span>Public</span>
          </div>
        </div>

        {/* Community bookmarks removed per UI update */}

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
    </aside>
    <GoogleSignInModal isOpen={showGoogleSignIn} onClose={() => setShowGoogleSignIn(false)} message={"Sign in to join the Vocably Community"} />
    <style dangerouslySetInnerHTML={{ __html: `
        .right-rail { scrollbar-width: none; -ms-overflow-style: none; }
        .right-rail::-webkit-scrollbar { width: 0; height: 0; }
        /* Pin to viewport on desktop while keeping the grid placeholder (.desktop-right-wrap)
           so the center column layout and post sizes do not change. Uses centered maxWidth 1440px. */
        @media (min-width: 1025px) {
          .desktop-right-wrap { width: 340px; }
          .right-rail { position: fixed; top: 64px; right: calc((100vw - 1440px)/2); width: 340px; box-sizing: border-box; padding: 12px; z-index: 998; max-height: calc(100vh - 140px); overflow-y: auto; }
        }
      ` }} />
    </>
  );
}
