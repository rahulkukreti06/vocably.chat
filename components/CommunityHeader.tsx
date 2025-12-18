"use client";

import React, { useState, useEffect, useRef } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { supabase } from "../lib/supabaseClient";
import { markNotificationsRead } from "../lib/notifications";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { usePathname } from "next/navigation";
import Link from "next/link";
import CommunitySidePanel from "./CommunitySidePanel";

const headerHeight = 52;

export default function CommunityHeader() {
  const [open, setOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const [showNotif, setShowNotif] = useState(false);
  const notifWrapRef = useRef<HTMLDivElement | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{ posts: any[]; rooms: any[] }>({ posts: [], rooms: [] });
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const searchWrapRef = useRef<HTMLDivElement | null>(null);
  const searchDebounceRef = useRef<any>(null);
  const [searchCounter, setSearchCounter] = useState(0);

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname === href + "/" || pathname.startsWith(href + "/");
  };

  useEffect(() => {
    const check = () => setIsMobile(typeof window !== "undefined" && window.innerWidth <= 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (typeof window === "undefined") return;
      setScrolled(window.scrollY > 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close profile menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    if (profileMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileMenuOpen]);

  // close search dropdown when clicking outside
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!showSearchDropdown) return;
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    }
    if (showSearchDropdown) document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [showSearchDropdown]);

  async function performSearch(q: string) {
    const trimmed = q.trim();
    if (!trimmed) {
      setSearchResults({ posts: [], rooms: [] });
      setShowSearchDropdown(false);
      return;
    }
    setSearching(true);
    setSearchError(null);
    setShowSearchDropdown(true);
    try {
      const qLike = `%${trimmed.replace(/%/g, '')}%`;
      const [postsRes, roomsRes] = await Promise.all([
        supabase.from('community_posts').select('id,title').or(`title.ilike.${qLike},content.ilike.${qLike}`).limit(6),
        supabase.from('rooms').select('id,name').or(`name.ilike.${qLike},topic.ilike.${qLike}`).limit(6),
      ]);

      const posts = (postsRes.data as any[]) || [];
      const rooms = (roomsRes.data as any[]) || [];
      setSearchResults({ posts, rooms });
      setShowSearchDropdown(true);
    } catch (e) {
      console.warn('search failed', e);
      setSearchError('Search failed');
      setSearchResults({ posts: [], rooms: [] });
      setShowSearchDropdown(true);
    } finally {
      setSearchCounter((s) => s + 1);
      setSearching(false);
    }
  }

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchQuery.trim().length === 0) return;
      performSearch(searchQuery);
    }
    if (e.key === 'Escape') {
      setShowSearchDropdown(false);
    }
  }

  // debounce search-on-type
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    const trimmed = searchQuery.trim();
    if (trimmed.length === 0) {
      setSearchResults({ posts: [], rooms: [] });
      setShowSearchDropdown(false);
      setSearching(false);
      setSearchError(null);
      return;
    }
    // small debounce so typing triggers search
    searchDebounceRef.current = setTimeout(() => {
      performSearch(trimmed);
    }, 400);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchQuery]);

  // close notifications popup when clicking outside
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!showNotif) return;
      if (notifWrapRef.current && !notifWrapRef.current.contains(e.target as Node)) {
        setShowNotif(false);
      }
    }
    if (showNotif) document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [showNotif]);

  // fetch notifications for logged-in user and poll periodically
  useEffect(() => {
    let mounted = true;
    let poll: any = null;
    async function load() {
      if (!session?.user) {
        if (mounted) {
          setNotifications([]);
          setUnreadCount(0);
        }
        return;
      }
      try {
        const userId = String(session.user.id);
        const { data } = await supabase.from('community_notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20);
        if (mounted) {
          setNotifications(data || []);
          setUnreadCount(((data as any[]) || []).filter((n: any) => !n.read).length);
        }
      } catch (e) {
        console.warn('failed loading notifications', e);
      }
    }
    load();
    poll = setInterval(load, 12000);
    return () => { mounted = false; if (poll) clearInterval(poll); };
  }, [session?.user]);

  return (
    <>
      <header style={{ ...headerWrap, background: scrolled ? "#000" : headerWrap.background }}>
        {/* Grid layout: left brand (flush), center search+CTA, right (hamburger) */}
        <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', padding: '4px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/" style={{ ...brandLink, alignItems: 'center' }}>
              <span className="brand-text" style={brand}>Vocably</span>
            </Link>
          </div>

          <div style={{ justifySelf: 'center', width: '100%', maxWidth: 720 }}>
            {!isMobile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', maxWidth: 560, margin: '0 auto' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div ref={searchWrapRef} style={{ position: 'relative' }}>
                    <input
                      ref={searchInputRef}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleSearchKeyDown}
                      aria-label="Search community"
                      placeholder="Search posts, people, topics"
                      className="w-full pl-12 pr-4 py-1 text-sm rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,184,62,0.16)', paddingLeft: 40, height: 40 }}
                    />

                    {showSearchDropdown && (
                      <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, background: '#000000', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 8, boxShadow: '0 12px 38px rgba(2,6,23,0.5)', zIndex: 1200, padding: 8 }}>
                        <div style={{ color: '#9ca3af', fontSize: 12, marginBottom: 6, fontWeight: 700 }}>Top results</div>
                        {searching ? (
                          <div style={{ color: '#9ca3af' }}>Searching…</div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {/* show up to 3 combined important results (posts first, then rooms) */}
                            {(() => {
                              const combined: Array<any> = [];
                              if (searchResults.posts?.length) combined.push(...searchResults.posts.map((p) => ({ ...p, _type: 'post' })));
                              if (searchResults.rooms?.length) combined.push(...searchResults.rooms.map((r) => ({ ...r, _type: 'room' })));
                              const slice = combined.slice(0, 3);
                              if (slice.length === 0) return <div style={{ color: '#9ca3af' }}>No results</div>;
                              return slice.map((it) => (
                                <Link key={`${it._type}-${it.id}`} href={it._type === 'post' ? `/community/${it.id}` : `/rooms/${it.id}`} onClick={() => setShowSearchDropdown(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', color: '#fff', textDecoration: 'none', borderRadius: 6 }}>
                                  <div style={{ width: 8, height: 8, borderRadius: 2, background: it._type === 'post' ? '#f59e0b' : '#06b6d4' }} />
                                  <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.title || it.name || (it._type === 'post' ? 'Untitled post' : 'Room')}</div>
                                  <div style={{ color: '#9ca3af', fontSize: 12, fontWeight: 700, marginLeft: 8 }}>{it._type === 'post' ? 'Post' : 'Room'}</div>
                                </Link>
                              ));
                            })()}

                            {/* separator / different line per search */}
                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 8, color: '#9ca3af', fontSize: 12 }}>
                              Search session #{searchCounter} — results may differ
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12 }}>
              {!isMobile && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginRight: 8, whiteSpace: 'nowrap' }}>
                <div>
                  <Link href="/community/create" className="create-btn" style={{ ...ctaBtn }}>+ Create</Link>
                </div>
                <div ref={notifWrapRef} style={{ position: 'relative' }}>
                  <button aria-label="Notifications" className="notif-logo" onClick={async () => {
                    // open popup
                    setShowNotif((v) => !v);
                    // if opening, mark unread as read (optimistic)
                    if (!showNotif && notifications && notifications.length) {
                      const unread = notifications.filter((n) => !n.read).map((n) => n.id);
                      if (unread.length) {
                        // optimistic update
                        setNotifications((prev) => prev.map((n) => unread.includes(n.id) ? { ...n, read: true } : n));
                        setUnreadCount(0);
                        try {
                          await markNotificationsRead(unread);
                        } catch (e) {
                          console.warn('mark read failed', e);
                        }
                      }
                    }
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2a6 6 0 00-6 6v4.586L4.293 15.293A1 1 0 005 17h14a1 1 0 00.707-1.707L18 12.586V8a6 6 0 00-6-6zM12 22a2.5 2.5 0 002.45-2H9.55A2.5 2.5 0 0012 22z" />
                    </svg>
                    {unreadCount > 0 && (
                      <span style={{ position: 'absolute', top: 4, right: 4, background: '#ef4444', color: '#fff', borderRadius: 999, padding: '2px 6px', fontSize: 12, fontWeight: 800 }}>
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  {showNotif ? (
                    <div className="notif-popup" style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#0b1220', color: '#fff', padding: '8px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)', boxShadow: '0 8px 24px rgba(2,6,23,0.6)', zIndex: 1200, fontWeight: 700, fontSize: 13, minWidth: 320 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                        <div style={{ fontWeight: 800 }}>Notifications</div>
                        <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 700 }}>{notifications.length} recent</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflow: 'auto' }}>
                        {notifications.length === 0 ? (
                          <div style={{ color: '#9ca3af', fontWeight: 700 }}>No notifications</div>
                        ) : (
                          notifications.map((n) => (
                            <div key={n.id} style={{ padding: 10, borderRadius: 8, background: n.read ? 'transparent' : 'rgba(255,255,255,0.02)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.03)', display: 'grid', placeItems: 'center', fontWeight: 800 }}>{n.actor_id ? n.actor_id[0]?.toUpperCase() : 'U'}</div>
                              <div style={{ flex: 1 }}>
                                <div style={{ color: '#fff', fontSize: 13, fontWeight: 800 }}>
                                  {n.type === 'comment' ? 'New comment' : (n.type || 'Notification')}
                                </div>
                                <div style={{ color: '#9ca3af', fontSize: 13, fontWeight: 700 }}>{String(n.data?.content || '').slice(0, 180) || '—'}</div>
                                <div style={{ color: '#6b7280', fontSize: 12, marginTop: 6 }}>{n.created_at ? new Date(n.created_at).toLocaleString() : ''}</div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div ref={profileMenuRef}>
                  {status === 'loading' ? null : status !== 'authenticated' ? (
                    <button className="signin-btn" onClick={() => signIn('google')}>Sign in</button>
                  ) : (
                    <div style={{ position: 'relative' }}>
                      <button className="profile-btn" onClick={() => setProfileMenuOpen((v) => !v)} aria-haspopup="true" aria-expanded={profileMenuOpen}>
                        <Avatar style={{ width: 28, height: 28 }}>
                          {session.user?.image && <AvatarImage src={session.user.image} alt={session.user.name || 'User'} />}
                          <AvatarFallback>{session.user?.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                        </Avatar>
                        <span className="profile-name">{session.user?.name || 'Profile'}</span>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: 6 }}><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>

                      {profileMenuOpen && (
                        <div className="profile-menu" role="menu">
                          <button className="profile-item signout" onClick={() => { signOut(); setProfileMenuOpen(false); }}>Sign out</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* mobile actions: search toggle + compact create icon + hamburger */}
            {isMobile && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {/* search moved to left of create */}
                  <button aria-label="Search" className="mobile-icon" onClick={() => setMobileSearchOpen((s) => !s)} style={{ background: 'transparent', border: '1px solid transparent', padding: 8, width: 36, height: 36, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 21L16.65 16.65" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="11" cy="11" r="6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>

                  <Link href="/community/create" style={{ background: 'transparent', border: 'none', padding: 0, display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }} aria-label="Create">
                    <div className="mobile-create-box" style={{ width: 24, height: 24, display: 'grid', placeItems: 'center', borderRadius: 6, border: '2px solid #ffffff', color: '#fff', padding: 0, background: 'rgba(255,255,255,0.02)' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </Link>

                  {/* notification icon replaces previous search spot */}
                  <div ref={notifWrapRef} style={{ position: 'relative' }}>
                    <button aria-label="Notifications" onClick={async () => {
                      setShowNotif((v) => !v);
                      if (!showNotif && notifications && notifications.length) {
                        const unread = notifications.filter((n) => !n.read).map((n) => n.id);
                        if (unread.length) {
                          setNotifications((prev) => prev.map((n) => unread.includes(n.id) ? { ...n, read: true } : n));
                          setUnreadCount(0);
                          try { await markNotificationsRead(unread); } catch (e) { console.warn('mark read failed', e); }
                        }
                      }
                    }} style={{ width: 24, height: 24, display: 'grid', placeItems: 'center', borderRadius: 6, border: '2px solid #ffffff', color: '#fff', padding: 0, background: 'rgba(255,255,255,0.02)' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2a6 6 0 00-6 6v4.586L4.293 15.293A1 1 0 005 17h14a1 1 0 00.707-1.707L18 12.586V8a6 6 0 00-6-6zM12 22a2.5 2.5 0 002.45-2H9.55A2.5 2.5 0 0012 22z" /></svg>
                      {unreadCount > 0 && (
                        <span style={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', color: '#fff', borderRadius: 999, padding: '2px 6px', fontSize: 11, fontWeight: 800 }}>
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    {showNotif ? (
                      <div className="notif-popup" style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#0b1220', color: '#fff', padding: '8px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)', boxShadow: '0 8px 24px rgba(2,6,23,0.6)', zIndex: 1200, fontWeight: 700, fontSize: 13, minWidth: 280 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                          <div style={{ fontWeight: 800 }}>Notifications</div>
                          <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 700 }}>{notifications.length} recent</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflow: 'auto' }}>
                          {notifications.length === 0 ? (
                            <div style={{ color: '#9ca3af', fontWeight: 700 }}>No notifications</div>
                          ) : (
                            notifications.map((n) => (
                              <div key={n.id} style={{ padding: 10, borderRadius: 8, background: n.read ? 'transparent' : 'rgba(255,255,255,0.02)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.03)', display: 'grid', placeItems: 'center', fontWeight: 800 }}>{n.actor_id ? n.actor_id[0]?.toUpperCase() : 'U'}</div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ color: '#fff', fontSize: 13, fontWeight: 800 }}>
                                    {n.type === 'comment' ? 'New comment' : (n.type || 'Notification')}
                                  </div>
                                  <div style={{ color: '#9ca3af', fontSize: 13, fontWeight: 700 }}>{String(n.data?.content || '').slice(0, 180) || '—'}</div>
                                  <div style={{ color: '#6b7280', fontSize: 12, marginTop: 6 }}>{n.created_at ? new Date(n.created_at).toLocaleString() : ''}</div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <button className="hamburger" aria-label="Open menu" onClick={() => setOpen((v) => !v)} style={{ width: 40, height: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 6, borderRadius: 8, background: 'transparent', border: 'none' }}>
                    {open ? (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18M6 6l12 12" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    ) : (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6h18M3 12h18M3 18h18" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* mobile search overlay inside header */}
        {mobileSearchOpen && isMobile ? (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: headerHeight, zIndex: 1200, display: 'flex', alignItems: 'center', padding: '6px 12px', background: 'rgba(0,0,0,0.98)' }}>
            <button aria-label="Back" onClick={() => { setMobileSearchOpen(false); setShowSearchDropdown(false); }} style={{ background: 'transparent', border: 'none', color: '#fff', padding: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 18l-6-6 6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>

            <div style={{ position: 'relative', flex: 1 }}>
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                aria-label="Find anything"
                placeholder="Find anything"
                className="w-full pl-4 pr-12 py-2 text-sm rounded-full text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
                style={{ background: '#0f1418', border: '1px solid rgba(255,255,255,0.04)', paddingLeft: 12, height: 36 }}
              />

              {showSearchDropdown && (
                <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, background: '#000000', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 8, boxShadow: '0 12px 38px rgba(2,6,23,0.5)', zIndex: 1210, padding: 8 }}>
                  <div style={{ color: '#9ca3af', fontSize: 12, marginBottom: 6, fontWeight: 700 }}>Top results</div>
                  {searching ? (
                    <div style={{ color: '#9ca3af' }}>Searching…</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {(() => {
                        const combined: Array<any> = [];
                        if (searchResults.posts?.length) combined.push(...searchResults.posts.map((p) => ({ ...p, _type: 'post' })));
                        if (searchResults.rooms?.length) combined.push(...searchResults.rooms.map((r) => ({ ...r, _type: 'room' })));
                        const slice = combined.slice(0, 3);
                        if (slice.length === 0) return <div style={{ color: '#9ca3af' }}>No results</div>;
                        return slice.map((it) => (
                          <Link key={`${it._type}-${it.id}`} href={it._type === 'post' ? `/community/${it.id}` : `/rooms/${it.id}`} onClick={() => setShowSearchDropdown(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', color: '#fff', textDecoration: 'none', borderRadius: 6 }}>
                            <div style={{ width: 8, height: 8, borderRadius: 2, background: it._type === 'post' ? '#f59e0b' : '#06b6d4' }} />
                            <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.title || it.name || (it._type === 'post' ? 'Untitled post' : 'Room')}</div>
                            <div style={{ color: '#9ca3af', fontSize: 12, fontWeight: 700, marginLeft: 8 }}>{it._type === 'post' ? 'Post' : 'Room'}</div>
                          </Link>
                        ));
                      })()}

                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 8, color: '#9ca3af', fontSize: 12 }}>
                        Search session #{searchCounter} — results may differ
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Ask button removed as requested */}
          </div>
        ) : null}

        {open && isMobile && (
          <CommunitySidePanel mobile onClose={() => setOpen(false)} />
        )}

        <style dangerouslySetInnerHTML={{ __html: `
          .hamburger{ display:none; background:transparent; border:none; padding:6px; transition: transform .12s ease; }
          .brand-text{ font-size: 26px; font-weight:900; display:inline-block; line-height:1.12; transform: translateY(2px); padding-bottom:2px; transition: color .22s ease, transform .12s ease }
          .brand-image{ width:36px; height:36px; object-fit:contain; margin-right:8px; vertical-align:middle; display:inline-block; flex-shrink:0; transition: opacity .25s ease }
          .community-header-right a { white-space: nowrap }
          .community-nav a, .community-header-right a, .mobile-link, .mobile-cta { transition: color .22s ease, background .22s ease, transform .12s ease, box-shadow .12s ease; }
          .community-nav a:hover, .community-nav a:focus { color: inherit; background: transparent; border-radius:6px; }
          .community-header-right a:hover, .community-header-right a:focus { transform: translateY(-2px); box-shadow: 0 8px 26px rgba(0,0,0,0.08); }
          .mobile-link:hover { background:#f1f5f9; border-radius:6px; }
          .mobile-cta:hover, .mobile-cta:focus { transform: translateY(-2px); box-shadow: 0 8px 26px rgba(0,0,0,0.08); }
          .community-nav a:focus, .mobile-link:focus, .mobile-cta:focus { outline: 3px solid rgba(0,0,0,0.08); outline-offset: 3px; }
          .hamburger:hover{ transform: scale(1.04); }

          .mobile-menu{ position:fixed; top:${headerHeight}px; left:0; right:0; background:#fff; border-top:1px solid #eee; box-shadow:0 8px 24px rgba(2,6,23,0.08); z-index:80 }
          .mobile-menu-inner{ display:flex; flex-direction:column; gap:8px; padding:16px }
          .mobile-link{ padding:10px 12px; color:#0f172a; text-decoration:none; font-weight:700 }
          .mobile-cta{ margin-top:6px; padding:10px 12px; background:#000; color:#fff; border-radius:8px; text-decoration:none; font-weight:800 }

          /* Desktop create button: white text, grey translucent hover */
          .create-btn{ color:#fff; background:transparent; border:1px solid rgba(255,255,255,0.06); padding:6px 12px; border-radius:10px; font-weight:700; text-decoration:none; display:inline-flex; align-items:center; white-space:nowrap; vertical-align:middle }
          .create-btn:hover, .create-btn:focus{ background: rgba(255,255,255,0.04) !important; color: #fff !important; box-shadow: none !important }

          .notif-logo{ background:transparent; border:1px solid rgba(255,255,255,0.08); color:#fff; padding:4px; border-radius:10px; display:inline-flex; align-items:center; justify-content:center; width:40px; height:40px; white-space:nowrap; vertical-align:middle }
          .notif-logo:hover{ background: rgba(255,255,255,0.04) !important; box-shadow: none !important }

          .profile-btn{ background:transparent !important; border:1px solid rgba(255,255,255,0.06) !important; color:#fff !important; display:inline-flex; align-items:center; gap:6px; padding:4px 6px; border-radius:999px; cursor:pointer; transition: background .12s ease; margin:0; white-space:nowrap; vertical-align:middle }
          .profile-btn:focus{ outline: 2px solid rgba(255,255,255,0.08); }
          .profile-btn:hover, .profile-btn:active, .profile-btn:focus{ background: rgba(255,255,255,0.04) !important; color:#fff !important; box-shadow: none !important }
          .profile-btn > * { margin-top: 0 !important; margin-bottom: 0 !important }
          .profile-name{ font-weight:700; font-size:15px; line-height:1; margin:0; white-space:nowrap }

          /* search input placeholder sizing */
          input[aria-label="Search community"]::placeholder { font-size:14px; color: rgba(255,255,255,0.9); }
          input[aria-label="Search community"]:-ms-input-placeholder { font-size:14px; color: rgba(255,255,255,0.9); }
          input[aria-label="Search community"]::-ms-input-placeholder { font-size:14px; color: rgba(255,255,255,0.9); }

          .signin-btn{ color:#fff; background:transparent; border:1px solid rgba(255,255,255,0.06); padding:8px 12px; border-radius:8px; font-weight:700 }
          .signin-btn:hover, .signin-btn:focus{ background: transparent; box-shadow: none }

          .profile-menu{ position:absolute; right:0; top:calc(100% + 8px); background:#0b1220; color:#fff; border-radius:10px; box-shadow:0 12px 38px rgba(2,6,23,0.36); min-width:200px; overflow:hidden; z-index:999 }
          .profile-item{ display:block; padding:10px 12px; color:inherit; text-decoration:none; font-weight:700; background:transparent; border:none; width:100%; text-align:left }
          .profile-item:hover{ background: transparent }
          .profile-item.signout{ color:#ef4444 }

          @media (max-width: 640px){ .profile-name{ display:none } }

          @media (max-width: 640px){
            .community-nav{ display:none }
            .community-header-right{ display:none }
            .hamburger{ display:inline-flex; margin-left: auto }
            .brand-text{ font-size: 22px !important; line-height:1.08; transform: translateY(1px); padding-bottom:1px }
            .brand-image{ width:28px; height:28px }
            .community-header-right a { white-space: nowrap; padding: 6px 10px !important; font-size: 14px !important }
          }
        ` }} />
      </header>
      <div style={{ height: headerHeight }} aria-hidden="true" />
    </>
  );
}

const headerWrap: React.CSSProperties = {
  background: '#000000',
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  zIndex: 999,
  borderBottomWidth: '2px',
  borderBottomStyle: 'solid',
  borderBottomColor: 'rgba(245, 243, 243, 0.23)'
};

const container: React.CSSProperties = {
  maxWidth: 1200,
  margin: '0 auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '14px 12px'
};

const left: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 12 };
const brand: React.CSSProperties = { fontWeight: 900, color: '#fff' };
const brandLink: React.CSSProperties = { textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 };

const nav: React.CSSProperties = { display: 'flex', gap: 24, alignItems: 'center' };
const navLink: React.CSSProperties = { color: '#fff', textDecoration: 'none', fontWeight: 700, padding: '6px 8px', borderRadius: 8 };

const right: React.CSSProperties = { display: 'flex', gap: 14, alignItems: 'center' };
const ctaBtn: React.CSSProperties = { padding: '6px 12px', borderRadius: 10, background: 'transparent', color: '#fff', fontWeight: 700, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.06)', display: 'inline-flex', alignItems: 'center' };
const brandScrolled: React.CSSProperties = { color: '#ffffff', fontWeight: 900 };

