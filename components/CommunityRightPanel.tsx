"use client";

import Link from "next/link";
import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import { useSession, signIn } from "next-auth/react";

export default function CommunityRightPanel() {
  const { data: session } = useSession();
  const [members, setMembers] = useState<number>(0);
  const [joined, setJoined] = useState<boolean>(false);
  const [totalPosts, setTotalPosts] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('vocably_community_join');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.members === 'number') setMembers(parsed.members);
        if (typeof parsed.joined === 'boolean') setJoined(parsed.joined);
      }
    } catch (e) {}
  }, []);

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
      signIn();
      return;
    }
    const nextJoined = !joined;
    const nextMembers = nextJoined ? members + 1 : Math.max(0, members - 1);
    setJoined(nextJoined);
    setMembers(nextMembers);
    try {
      localStorage.setItem('vocably_community_join', JSON.stringify({ joined: nextJoined, members: nextMembers }));
      try { window.dispatchEvent(new CustomEvent('vocably_join_changed')); } catch (e) {}
    } catch (e) {}
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#9ca3af' }}>
            <path d="M21 12a9 9 0 1 0-18 0 9 9 0 0 0 18 0z"></path>
            <path d="M2.05 12H21.95"></path>
          </svg>
          <a href="https://vocably.chat/" target="_blank" rel="noreferrer" style={{ color: '#9ca3af', textDecoration: 'none' }}>vocably.chat</a>
          <div style={{ marginLeft: 'auto', color: '#9ca3af', fontSize: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#9ca3af' }}>
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a8 8 0 0 0 0-6" />
              <path d="M4.6 9a8 8 0 0 0 0 6" />
            </svg>
            <span>Public</span>
          </div>
        </div>

        <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: 12 }}>
          <div style={{ color: '#9ca3af', fontSize: 12, fontWeight: 700 }}>COMMUNITY BOOKMARKS</div>
          <div style={{ marginTop: 8 }}>
            <button style={{ width: '100%', padding: '8px 12px', borderRadius: 999, background: '#111', border: '1px solid rgba(255,255,255,0.03)', color: '#fff', fontWeight: 700 }}>Links ▾</button>
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
    </aside>
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
