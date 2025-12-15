"use client";

import React, { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CommunityHeader from "../../components/CommunityHeader";
import CommunitySidePanel from "../../components/CommunitySidePanel";
import CommunityRightPanel from "../../components/CommunityRightPanel";
import { supabase } from "../../lib/supabaseClient";

type Post = {
  id: string;
  community_id?: string | null;
  title?: string | null;
  content: string;
  created_by?: string | null;
  created_by_name?: string | null;
  created_by_image?: string | null;
  created_at?: string | null;
  comments?: {
    id: string;
    post_id?: string;
    content: string;
    created_by?: string | null;
    created_by_name?: string | null;
    created_by_image?: string | null;
    created_at?: string;
  }[];
  vote_count?: number;
  user_vote?: number;
};

const LOCAL_KEY = "vocably_community_posts_v1";

function timeAgo(iso?: string | null) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function PostBody({ content }: { content: string }) {
  if (!content) return null;
  return (
    <div>
      <div className="post-clamp" style={{ color: '#cbd5e1', marginTop: 6, fontSize: 'var(--post-body-size, 15px)', lineHeight: 1.5 }}>
        {content}
      </div>
    </div>
  );
}

export default function CommunityPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [userName, setUserName] = useState<string | null>(null);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loadingVotes, setLoadingVotes] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [joinedState, setJoinedState] = useState<boolean>(false);
  const [membersState, setMembersState] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    function onWindowClick() {
      setOpenMenuId(null);
    }
    window.addEventListener('click', onWindowClick);
    async function init() {
      // try to fetch posts from Supabase
      try {
        const { data, error } = await supabase.from("community_posts").select("*").order("created_at", { ascending: false }).limit(200);
        if (!error && data && mounted) {
          // fetch comments for these posts
          const ids = (data as any[]).map((r) => r.id).filter(Boolean);
          let comments: any[] = [];
          if (ids.length) {
            const { data: cdata, error: cerr } = await supabase.from("community_comments").select("*").in("post_id", ids).order("created_at", { ascending: true });
            if (!cerr && cdata) comments = cdata;
          }

          const mapped = (data as any[]).map((r) => ({ ...(r || {}), comments: comments.filter((c) => c.post_id === r.id) }));
          setPosts(mapped as Post[]);
          setLoading(false);
        } else {
          // fallback to localStorage
          const raw = localStorage.getItem(LOCAL_KEY);
          if (raw) setPosts(JSON.parse(raw));
          setLoading(false);
        }
      } catch (e) {
        const raw = localStorage.getItem(LOCAL_KEY);
        if (raw) setPosts(JSON.parse(raw));
        setLoading(false);
      }

        // user info is set from next-auth session (see separate effect)
    }
    init();
    return () => {
      mounted = false;
      window.removeEventListener('click', onWindowClick);
    };
  }, []);

  useEffect(() => {
    if (session?.user) {
      setUserName((session.user.name as string) || (session.user.email as string) || null);
      setUserImage((session.user.image as string) || null);
      setUserId(session.user.id ? String(session.user.id) : null);
    }
  }, [session]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    function refreshFromStorage() {
      try {
        const raw = localStorage.getItem('vocably_community_join');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (typeof parsed.joined === 'boolean') setJoinedState(parsed.joined);
          if (typeof parsed.members === 'number') setMembersState(parsed.members);
        }
      } catch (e) {}
    }
    refreshFromStorage();
    window.addEventListener('vocably_join_changed', refreshFromStorage as EventListener);
    return () => window.removeEventListener('vocably_join_changed', refreshFromStorage as EventListener);
  }, []);

  // load vote counts and user's votes when posts or session change
  useEffect(() => {
    async function loadVotes() {
      if (!posts || posts.length === 0) return;
      setLoadingVotes(true);
      try {
        const ids = posts.map((p) => p.id).filter(Boolean);
        const { data: vdata, error: verror } = await supabase.from('community_post_votes').select('*').in('post_id', ids as any[]);
        if (!verror && vdata) {
          const counts: Record<string, number> = {};
          const userVotes: Record<string, number> = {};
          vdata.forEach((v: any) => {
            counts[v.post_id] = (counts[v.post_id] || 0) + (v.vote || 0);
            if (session?.user && String(v.user_id) === String(session.user.id)) userVotes[v.post_id] = v.vote;
          });
          setPosts((prev) => prev.map((p) => ({ ...p, vote_count: counts[p.id] || 0, user_vote: userVotes[p.id] ?? 0 })));
        }
      } catch (e) {
        // ignore
      } finally {
        setLoadingVotes(false);
      }
    }
    loadVotes();
  }, [posts.length, session?.user]);

  useEffect(() => {
    // persist fallback posts to localStorage when posts change (only for fallback entries)
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(posts));
    } catch (e) {}
  }, [posts]);

  async function createPost(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!content.trim()) return;
    if (!userId || !userName) {
      alert("Please sign in to post to the community.");
      return;
    }

    const newPost: Post = {
      id: Math.random().toString(36).slice(2),
      community_id: null,
      title: title.trim() || null,
      content: content.trim(),
      created_by: userId,
      created_by_name: userName,
      created_by_image: userImage || null,
      created_at: new Date().toISOString(),
      comments: [],
    };

    // optimistic UI
    setPosts((p) => [newPost, ...p]);
    setTitle("");
    setContent("");

    // attempt to persist to Supabase, otherwise keep local
    try {
      const { error } = await supabase.from("community_posts").insert([{ community_id: newPost.community_id, title: newPost.title, content: newPost.content, created_by: newPost.created_by, created_by_name: newPost.created_by_name, created_by_image: newPost.created_by_image }]);
      if (error) {
        console.warn("Supabase insert failed, keeping local copy:", error.message);
      }
    } catch (err) {
      // no-op
    }
  }

  async function addComment(postId: string, commentText: string) {
    if (!commentText.trim()) return;


    if (!userId || !userName) {
      alert("Please sign in to comment.");
      return;
    }

    const comment = { id: Math.random().toString(36).slice(2), post_id: postId, content: commentText.trim(), created_by: userId, created_by_name: userName, created_by_image: userImage || null, created_at: new Date().toISOString() };

    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, comments: [...(p.comments ?? []), comment] } : p)));

    try {
      const { error } = await supabase.from("community_comments").insert([{ post_id: postId, content: comment.content, created_by: comment.created_by, created_by_name: comment.created_by_name, created_by_image: comment.created_by_image }]);
      if (error) console.warn("Supabase comment insert failed:", error.message);
    } catch (e) {}
  }

  async function handleVote(postId: string, value: number) {
    if (!session?.user) {
      signIn();
      return;
    }

    setPosts((prev) => {
      return prev.map((p) => {
        if (p.id !== postId) return p;
        const prevVote = p.user_vote || 0;
        const newVote = prevVote === value ? 0 : value;
        const delta = newVote - prevVote;
        return { ...p, user_vote: newVote, vote_count: (p.vote_count || 0) + delta };
      });
    });

    try {
      const user_id = session.user.id as any;
      const prev = posts.find((x) => x.id === postId)?.user_vote || 0;
      const willBe = prev === value ? 0 : value;

      // Fetch existing vote for this user+post
      const { data: existing, error: selErr } = await supabase.from('community_post_votes').select('id,vote').eq('post_id', postId).eq('user_id', user_id).maybeSingle();
      if (selErr) {
        console.warn('vote select failed', selErr);
      }

      if (!existing) {
        if (willBe !== 0) {
          // insert new vote
          const { error: insErr } = await supabase.from('community_post_votes').insert([{ post_id: postId, user_id: user_id, vote: willBe }]);
          if (insErr) console.warn('vote insert failed', insErr);
        }
      } else {
        if (willBe === 0) {
          const { error: delErr } = await supabase.from('community_post_votes').delete().eq('id', existing.id);
          if (delErr) console.warn('vote delete failed', delErr);
        } else {
          const { error: updErr } = await supabase.from('community_post_votes').update({ vote: willBe }).eq('id', existing.id);
          if (updErr) console.warn('vote update failed', updErr);
        }
      }
    } catch (e) {
      console.warn('vote persist failed', e);
    }
  }

  return (
    <div style={{ background: '#121212' }} className="min-h-screen w-full text-gray-100 py-14 px-5 sm:px-8">
      <div className="relative max-w-5xl mx-auto text-left">
        <div className="mb-8">
          <CommunityHeader />
        </div>

        <main style={{ display: 'flex', justifyContent: 'center' }}>
          {/* fixed left rail placed flush to the left of the viewport */}
          <CommunitySidePanel />

          <div style={{ width: '100%', maxWidth: 1440 }} className="community-main-wrapper">
            <div style={{ marginBottom: 12, textAlign: 'center' }}>
              <h1 className="community-title-h1">Vocably Community</h1>

              <div className="mobile-action-row" style={{ marginTop: 20 }}>
                <button
                  className="mobile-action-btn"
                  onClick={() => router.push('/community/create')}
                >
                  Create Post
                </button>
                <button
                  className="mobile-action-btn"
                  onClick={() => setShowRightPanel(true)}
                >
                  About
                </button>
                <button
                  className="mobile-action-btn"
                  onClick={() => {
                    try {
                      if (!session?.user) {
                        signIn();
                        return;
                      }
                      const raw = localStorage.getItem('vocably_community_join');
                      let parsed = { joined: false, members: 0 } as any;
                      if (raw) parsed = JSON.parse(raw);
                      const nextJoined = !parsed.joined;
                      const nextMembers = nextJoined ? (parsed.members || 0) + 1 : Math.max(0, (parsed.members || 0) - 1);
                      localStorage.setItem('vocably_community_join', JSON.stringify({ joined: nextJoined, members: nextMembers }));
                      window.dispatchEvent(new CustomEvent('vocably_join_changed'));
                    } catch (e) {}
                  }}
                >
                  {joinedState ? 'Joined' : 'Join'}
                </button>
              </div>
            </div>
            <div className="community-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
              <section style={{ maxWidth: 900 }}>
            

            <div>
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <article key={i} className="animate-pulse" style={{ padding: 12, marginBottom: 12, borderRadius: 8, background: 'rgba(255,255,255,0.04)' }}>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 999, background: 'rgba(255,255,255,0.08)' }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ height: 12, width: '40%', background: 'rgba(255,255,255,0.12)', borderRadius: 6, marginBottom: 8 }} />
                          <div style={{ height: 16, width: '80%', background: 'rgba(255,255,255,0.08)', borderRadius: 6, marginBottom: 6 }} />
                          <div style={{ height: 12, width: '60%', background: 'rgba(255,255,255,0.06)', borderRadius: 6 }} />
                        </div>
                      </div>
                      <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                        <div style={{ height: 28, width: 80, borderRadius: 8, background: 'rgba(255,255,255,0.06)' }} />
                        <div style={{ height: 28, width: 120, borderRadius: 8, background: 'rgba(255,255,255,0.06)' }} />
                      </div>
                    </article>
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <div style={{ color: "#9ca3af" }}>No posts yet — be the first to share.</div>
              ) : (
                posts.map((post, i) => (
                  <React.Fragment key={post.id}>
                    <article
                      className="community-post"
                      role="link"
                      tabIndex={0}
                      onClick={() => router.push(`/community/${post.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") router.push(`/community/${post.id}`);
                      }}
                      style={{ position: 'relative', padding: 16, marginBottom: 16, borderRadius: 8, cursor: 'pointer' }}
                    >
                      <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === post.id ? null : post.id); }} aria-label="Post menu" style={{ position: 'absolute', top: 12, right: 12, background: 'transparent', border: 'none', color: '#cbd5e1', padding: 6, borderRadius: 8 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="5" cy="12" r="1.6" />
                          <circle cx="12" cy="12" r="1.6" />
                          <circle cx="19" cy="12" r="1.6" />
                        </svg>
                      </button>

                      {openMenuId === post.id ? (
                        <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', top: 40, right: 12, background: '#0b0b0b', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, boxShadow: '0 6px 20px rgba(0,0,0,0.6)', padding: 6, zIndex: 40 }}>
                          <button onClick={async () => {
                            try {
                              const url = `${window.location.origin}/community/${post.id}`;
                              if ((navigator as any).share) {
                                await (navigator as any).share({ title: post.title || 'Vocably post', url });
                              } else {
                                await navigator.clipboard.writeText(url);
                                alert('Link copied to clipboard');
                              }
                            } catch (e) {
                              alert('Unable to share');
                            } finally {
                              setOpenMenuId(null);
                            }
                          }} style={{ display: 'block', padding: '8px 12px', background: 'transparent', border: 'none', color: '#e5e7eb', textAlign: 'left', width: '100%' }}>Share</button>

                          <button onClick={() => { alert('Reported — thank you'); setOpenMenuId(null); }} style={{ display: 'block', padding: '8px 12px', background: 'transparent', border: 'none', color: '#e5e7eb', textAlign: 'left', width: '100%' }}>Report</button>
                        </div>
                      ) : null}
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          {post.created_by_image ? (
                            <img src={post.created_by_image} alt={post.created_by_name ?? post.created_by ?? 'avatar'} style={{ width: 20, height: 20, borderRadius: 999 }} />
                          ) : (
                            <div style={{ width: 20, height: 20, borderRadius: 999, background: 'rgba(255,255,255,0.03)', display: 'inline-block' }} />
                          )}
                          <div style={{ color: '#9ca3af', fontSize: 12, fontWeight: 700 }}>{post.created_by_name ?? post.created_by ?? 'Anonymous'} · {timeAgo(post.created_at)}</div>
                        </div>
                        {post.title ? (
                          <h3 style={{ margin: 0, color: "#ffe066", fontSize: 'var(--post-title-size, 17px)', fontWeight: 600 }}>
                            <Link href={`/community/${post.id}`} onClick={(e) => e.stopPropagation()}>{post.title}</Link>
                          </h3>
                        ) : null}
                        <PostBody content={post.content} />
                      </div>
                    </div>

                    <div style={{ marginTop: 10, display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <button onClick={(e) => { e.stopPropagation(); handleVote(post.id, 1); }} aria-pressed={post.user_vote === 1} className="inline-flex items-center rounded-md px-2 py-1" style={{ background: post.user_vote === 1 ? 'rgba(96,165,250,0.12)' : 'transparent', border: '1px solid rgba(255,255,255,0.04)', color: '#9ca3af' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'translateY(1px)' }}>
                            <path d="M12 19V5"></path>
                            <path d="M5 12l7-7 7 7"></path>
                          </svg>
                        </button>
                        <div style={{ color: '#cbd5e1', fontWeight: 700, minWidth: 30, textAlign: 'center' }}>{post.vote_count ?? 0}</div>
                        <button onClick={(e) => { e.stopPropagation(); handleVote(post.id, -1); }} aria-pressed={post.user_vote === -1} className="inline-flex items-center rounded-md px-2 py-1" style={{ background: post.user_vote === -1 ? 'rgba(248,113,113,0.08)' : 'transparent', border: '1px solid rgba(255,255,255,0.04)', color: '#9ca3af' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'translateY(-1px)' }}>
                            <path d="M12 5v14"></path>
                            <path d="M19 12l-7 7-7-7"></path>
                          </svg>
                        </button>
                      </div>

                      <Link href={`/community/${post.id}`} style={{ textDecoration: 'none' }} onClick={(e) => e.stopPropagation()}>
                        <button onClick={(e) => e.stopPropagation()} className="inline-flex items-center rounded-md px-3 py-1" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.04)', color: '#9ca3af' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                          </svg>
                          <span style={{ marginLeft: 8 }}>{(post.comments ?? []).length} comments</span>
                        </button>
                      </Link>
                    </div>
                    </article>
                    {i < posts.length - 1 ? <div style={{ height: 1, background: 'rgba(255,255,255,0.12)', margin: '12px 0' }} /> : null}
                  </React.Fragment>
                ))
              )}
            </div>
              </section>

              <div className="desktop-right-wrap">
                <CommunityRightPanel />
              </div>
            </div>
          </div>
        </main>

        {showRightPanel ? (
          <div className="mobile-right-overlay" onClick={() => setShowRightPanel(false)}>
            <div className="mobile-right-panel-wrap" onClick={(e) => e.stopPropagation()}>
              <div className="mobile-right-panel-inner">
                <button className="mobile-right-close" onClick={() => setShowRightPanel(false)} aria-label="Close">✕</button>
                <CommunityRightPanel />
              </div>
            </div>
          </div>
        ) : null}

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
          .left-fixed .nav-item{ display:flex; align-items:center; gap:14px; padding:8px 10px; color:#cbd5e1; text-decoration:none; border-radius:8px; font-size:14px }
          .left-fixed .nav-item .nav-icon{ width:28px; height:28px; display:inline-flex; align-items:center; justify-content:center; background:transparent; border-radius:6px; flex:0 0 28px }
          .left-fixed .nav-item:hover{ background: rgba(255,255,255,0.02); color:#fff }
          .games-title{ color:#9ca3af; font-size:12px; margin:8px 2px; font-weight:700 }
          .game-sub{ font-size:12px; opacity:0.9 }
          .new-badge{ background:#ff7b3a; color:#fff; padding:4px 6px; border-radius:999px; font-size:11px; font-weight:800 }
          .games-list{ display:flex; flex-direction:column; gap:8px; margin-top:10px }
          .game-card{ display:flex; align-items:center; gap:14px; padding:8px 10px; border-radius:12px; background: linear-gradient(180deg,#9b51e0 0%, #7c3aed 100%); color:#fff; border:none; width:100%; text-align:left }
          .game-avatar{ width:28px; height:28px; border-radius:8px; display:inline-flex; align-items:center; justify-content:center; font-size:16px; background: rgba(255,255,255,0.08) }
          .game-name{ font-weight:800; font-size:14px }

          .games-item{ color:#cbd5e1; text-decoration:none; padding:6px 9px; border-radius:8px }
          .games-item:hover{ color:#fff; background: rgba(255,255,255,0.02) }

          /* Mobile action row (shown only on small screens) */
          .mobile-action-row { display: none; }
          .mobile-action-btn { background: transparent; border: 1px solid rgba(255,255,255,0.12); color: #cbd5e1; padding: 6px 12px; border-radius: 999px; font-weight: 600; min-width: 88px }

          @media (max-width: 1024px) {
            .community-grid { grid-template-columns: 1fr !important; }
            .left-fixed { display: none !important; }
            .community-main-wrapper { padding-left: 0 !important }
            .right-rail { width: 100% !important }
            .desktop-right-wrap { display: none !important }
          }

          @media (min-width: 1025px) {
            .community-main-wrapper { padding-left: 260px; }
            /* Nudge the page title left on large screens */
            .community-title-h1 { text-align: left; transform: translateX(-65px); }
          }

          /* Community page title styling */
          .community-title-h1 { color: #fff; font-weight: 900; margin: 0; margin-top: 16px; text-align: center; font-family: 'Poppins', Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; letter-spacing: 0.2px; text-shadow: 0 2px 10px rgba(0,0,0,0.6); font-size: 36px; line-height: 1.02 }
          @media (max-width: 640px) {
            /* Strong override for small screens */
            .community-title-h1 { font-size: 20px !important; margin-top: 18px; letter-spacing: 0.4px; line-height: 1 }
            .mobile-action-row { display: flex; justify-content: center; gap: 8px; margin-top: 20px }
            .mobile-action-btn { font-size: 13px; padding: 6px 10px; font-weight: 600; border: 1px solid rgba(255,255,255,0.12) }
            /* overlay for small-screen right panel */
            .mobile-right-overlay { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 60 }
            .mobile-right-panel-wrap { display: flex; align-items: center; justify-content: center; position: fixed; inset: 0; z-index: 70; padding: 16px }
            .mobile-right-panel-inner { position: relative }
            .mobile-right-close { position: absolute; top: -10px; right: -10px; background: rgba(255,255,255,0.06); border: none; color: #fff; font-size: 18px; width: 36px; height: 36px; border-radius: 999px }
          }
          /* Small-screen adjustments for post typography */
          @media (max-width: 640px) {
            :root { --post-title-size: 17px; --post-body-size: 14px; }
            .community-post h3 { font-size: var(--post-title-size) !important; font-weight: 600 !important; }
            .post-clamp { font-size: var(--post-body-size) !important; }
          }
          /* Make posts full-bleed on very small screens (card background reaches edges) */
          @media (max-width: 640px) {
            .community-main-wrapper { max-width: 100vw; padding-left: 0; padding-right: 0; }
            .community-post {
              position: relative;
              left: 50%;
              right: 50%;
              margin-left: -50vw;
              margin-right: -50vw;
              width: 100vw;
              border-radius: 0 !important;
              padding-left: 16px !important;
              padding-right: 16px !important;
              box-sizing: border-box;
            }
          }
          /* Post hover color-only effect */
          .community-post { transition: background-color 120ms ease; background: #121212; }
          .community-post:hover { background: #252525; }
          /* Disable hover effects on small screens */
          @media (max-width: 640px) {
            .community-post { transition: none !important; }
            .community-post:hover { background: inherit !important; }
          }
          /* Remove underlines for links inside post titles and posts */
          .community-post a { text-decoration: none; color: inherit; }
          .community-post a:hover { text-decoration: none; }
          .post-clamp { display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
          .post-clamp.expanded { display: block; -webkit-line-clamp: unset; }
          .post-clamp { text-overflow: ellipsis; }
        ` }} />
      </div>
    </div>
  );
}

function CommentsSection({ post, onAdd, canComment }: { post: Post; onAdd: (text: string) => any; canComment: boolean }) {
  const [text, setText] = useState("");

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {(post.comments ?? []).map((c) => (
          <div key={c.id} style={{ padding: 8, borderRadius: 6, background: "rgba(255,255,255,0.01)", marginBottom: 6 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
              {c.created_by_image ? (
                <img src={c.created_by_image} alt={c.created_by_name ?? c.created_by ?? 'avatar'} style={{ width: 20, height: 20, borderRadius: 999 }} />
              ) : (
                <div style={{ width: 20, height: 20, borderRadius: 999, background: 'rgba(255,255,255,0.03)', display: 'inline-block' }} />
              )}
              <div style={{ color: '#9ca3af', fontSize: 12, fontWeight: 700 }}>{c.created_by_name ?? c.created_by ?? "Anonymous"} · {timeAgo(c.created_at)}</div>
            </div>
            <div>
              <div style={{ color: "#cbd5e1", fontSize: 14 }}>{c.content}</div>
            </div>
          </div>
        ))}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!text.trim()) return;
            if (!canComment) {
              alert('Please sign in to comment.');
              return;
            }
            onAdd(text.trim());
            setText("");
          }}
          style={{ display: "flex", gap: 8, marginTop: 6 }}
        >
          <input disabled={!canComment} value={text} onChange={(e) => setText(e.target.value)} placeholder={canComment ? "Write a comment" : "Sign in to comment"} className="rounded-md px-3 py-2 bg-white/5 placeholder:text-gray-400 text-gray-100" />
          <button type="submit" disabled={!canComment} className="inline-flex items-center rounded-md bg-emerald-500 hover:bg-emerald-600 px-3 py-1 text-sm font-medium" style={{ opacity: canComment ? 1 : 0.5 }}>Reply</button>
        </form>
      </div>
    </div>
  );
}
