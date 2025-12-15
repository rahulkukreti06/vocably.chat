"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import CommunityHeader from "../../../components/CommunityHeader";
import CommunitySidePanel from "../../../components/CommunitySidePanel";
import CommunityRightPanel from "../../../components/CommunityRightPanel";
import { supabase } from "../../../lib/supabaseClient";

function timeAgo(iso?: string | null) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export default function PostDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { data: session } = useSession();
  const [post, setPost] = useState<any | null>(null);
  const [voteCount, setVoteCount] = useState<number>(0);
  const [userVote, setUserVote] = useState<number>(0);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const { data: pdata, error: perror } = await supabase.from("community_posts").select("*").eq("id", id).maybeSingle();
        if (!perror && pdata && mounted) setPost(pdata);

        const { data: cdata, error: cerror } = await supabase.from("community_comments").select("*").eq("post_id", id).order("created_at", { ascending: true });
        if (!cerror && cdata && mounted) setComments(cdata as any[]);
        // load votes for this post
        const { data: vdata } = await supabase.from('community_post_votes').select('*').eq('post_id', id);
        if (vdata && mounted) {
          const sum = vdata.reduce((s: number, v: any) => s + (v.vote || 0), 0);
          setVoteCount(sum);
          if (session?.user) {
            const my = vdata.find((v: any) => String(v.user_id) === String(session.user.id));
            setUserVote(my ? my.vote : 0);
          }
        }
      } catch (e) {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  async function submitComment(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!text.trim()) return;
    if (!session?.user) {
      alert('Please sign in to comment.');
      return;
    }

    const newComment = {
      id: Math.random().toString(36).slice(2),
      post_id: id,
      content: text.trim(),
      created_by: session.user.id as any,
      created_by_name: session.user.name || session.user.email || null,
      created_by_image: session.user.image || null,
      created_at: new Date().toISOString(),
    };

    setComments((c) => [...c, newComment]);
    setText("");

    try {
      const { error } = await supabase.from("community_comments").insert([{ post_id: id, content: newComment.content, created_by: newComment.created_by, created_by_name: newComment.created_by_name, created_by_image: newComment.created_by_image }]);
      if (error) console.warn('Supabase insert failed:', error.message);
    } catch (e) {}
  }

  async function handleVote(value: number) {
    if (!session?.user) {
      (window as any).location = '/api/auth/signin';
      return;
    }
    const prev = userVote || 0;
    const newVote = prev === value ? 0 : value;
    setUserVote(newVote);
    setVoteCount((c) => c + (newVote - prev));

    try {
      const user_id = session.user.id as any;
      // fetch existing vote row
      const { data: existing, error: selErr } = await supabase.from('community_post_votes').select('id,vote').eq('post_id', id).eq('user_id', user_id).maybeSingle();
      if (selErr) console.warn('vote select failed', selErr);

      if (!existing) {
        if (newVote !== 0) {
          const { error: insErr } = await supabase.from('community_post_votes').insert([{ post_id: id, user_id: user_id, vote: newVote }]);
          if (insErr) console.warn('vote insert failed', insErr);
        }
      } else {
        if (newVote === 0) {
          const { error: delErr } = await supabase.from('community_post_votes').delete().eq('id', existing.id);
          if (delErr) console.warn('vote delete failed', delErr);
        } else {
          const { error: updErr } = await supabase.from('community_post_votes').update({ vote: newVote }).eq('id', existing.id);
          if (updErr) console.warn('vote update failed', updErr);
        }
      }
    } catch (e) {
      console.warn('persist vote failed', e);
    }
  }

  return (
    <div className="min-h-screen w-full bg-black text-gray-100 py-14 px-5 sm:px-8">
      <div className="relative max-w-5xl mx-auto text-left">
        <div className="mb-8">
          <CommunityHeader />
        </div>

        <main style={{ display: 'flex', justifyContent: 'center' }}>
          <CommunitySidePanel />
          <div style={{ width: '100%', maxWidth: 1440 }} className="community-main-wrapper">
            <div style={{ marginBottom: 12, textAlign: 'center' }}>
              <h1 className="community-title-h1">Vocably Community</h1>
            </div>

            <div className="community-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
              <section style={{ maxWidth: 900 }}>
                <div style={{ marginBottom: 12 }}>
                  <Link href="/community" style={{ color: '#9ca3af' }}>← Back to community</Link>
                </div>

                {(!post || loading) ? (
                  <article className="animate-pulse" style={{ padding: 16, borderRadius: 8, background: 'rgba(255,255,255,0.04)' }}>
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

                    <div style={{ marginTop: 12 }}>
                      <div style={{ height: 10, width: '90%', background: 'rgba(255,255,255,0.06)', borderRadius: 6, marginBottom: 6 }} />
                      <div style={{ height: 10, width: '95%', background: 'rgba(255,255,255,0.06)', borderRadius: 6, marginBottom: 6 }} />
                      <div style={{ height: 10, width: '70%', background: 'rgba(255,255,255,0.06)', borderRadius: 6 }} />
                    </div>

                    <div style={{ marginTop: 12 }}>
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="animate-pulse" style={{ padding: 10, borderRadius: 6, background: 'rgba(255,255,255,0.03)', marginTop: 8 }}>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                            <div style={{ width: 20, height: 20, borderRadius: 999, background: 'rgba(255,255,255,0.08)' }} />
                            <div style={{ width: '40%', height: 10, background: 'rgba(255,255,255,0.12)', borderRadius: 6 }} />
                          </div>
                          <div style={{ height: 12, width: '90%', background: 'rgba(255,255,255,0.06)', borderRadius: 6 }} />
                        </div>
                      ))}
                    </div>
                  </article>
                ) : (
                  <article className="community-post" style={{ padding: 16, borderRadius: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      {post.created_by_image ? (
                        <img src={post.created_by_image} alt={post.created_by_name ?? post.created_by ?? 'avatar'} style={{ width: 28, height: 28, borderRadius: 999 }} />
                      ) : (
                        <div style={{ width: 28, height: 28, borderRadius: 999, background: 'rgba(255,255,255,0.03)' }} />
                      )}
                      <div style={{ color: '#9ca3af', fontSize: 13, fontWeight: 700 }}>{post.created_by_name ?? post.created_by ?? 'Anonymous'} · {timeAgo(post.created_at)}</div>
                    </div>

                    {post.title ? <h2 style={{ color: '#ffe066', margin: '6px 0 12px', fontSize: 17, fontWeight: 600 }}>{post.title}</h2> : null}
                    <div style={{ color: '#cbd5e1', fontSize: 15, lineHeight: 1.6 }}>{post.content}</div>

                    <div style={{ marginTop: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <button onClick={() => handleVote(1)} aria-pressed={userVote === 1} className="inline-flex items-center rounded-md px-2 py-1" style={{ background: userVote === 1 ? 'rgba(96,165,250,0.12)' : 'transparent', border: '1px solid rgba(255,255,255,0.04)', color: '#9ca3af' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'translateY(1px)' }}>
                            <path d="M12 19V5"></path>
                            <path d="M5 12l7-7 7 7"></path>
                          </svg>
                        </button>
                        <div style={{ color: '#cbd5e1', fontWeight: 700 }}>{voteCount}</div>
                        <button onClick={() => handleVote(-1)} aria-pressed={userVote === -1} className="inline-flex items-center rounded-md px-2 py-1" style={{ background: userVote === -1 ? 'rgba(248,113,113,0.08)' : 'transparent', border: '1px solid rgba(255,255,255,0.04)', color: '#9ca3af' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'translateY(-1px)' }}>
                            <path d="M12 5v14"></path>
                            <path d="M19 12l-7 7-7-7"></path>
                          </svg>
                        </button>
                      </div>

                    </div>

                    <div style={{ marginTop: 6 }}>
                      <h4 style={{ color: '#9ca3af', margin: 0 }}>Comments ({comments.length})</h4>
                      <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {comments.map((c) => (
                          <div key={c.id} style={{ padding: 8, borderRadius: 6, background: 'rgba(255,255,255,0.01)' }}>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                              {c.created_by_image ? (
                                <img src={c.created_by_image} alt={c.created_by_name ?? c.created_by ?? 'avatar'} style={{ width: 20, height: 20, borderRadius: 999 }} />
                              ) : (
                                <div style={{ width: 20, height: 20, borderRadius: 999, background: 'rgba(255,255,255,0.03)' }} />
                              )}
                              <div style={{ color: '#9ca3af', fontSize: 12, fontWeight: 700 }}>{c.created_by_name ?? c.created_by ?? 'Anonymous'} · {timeAgo(c.created_at)}</div>
                            </div>
                            <div style={{ color: '#cbd5e1', fontSize: 14 }}>{c.content}</div>
                          </div>
                        ))}

                        <form onSubmit={(e) => { e.preventDefault(); submitComment(); }} style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                          <input value={text} onChange={(e) => setText(e.target.value)} placeholder={session?.user ? 'Write a comment' : 'Sign in to comment'} className="rounded-md px-3 py-2 bg-white/5 placeholder:text-gray-400 text-gray-100" />
                          <button type="submit" disabled={!session?.user} className="inline-flex items-center rounded-md bg-emerald-500 hover:bg-emerald-600 px-3 py-1 text-sm font-medium" style={{ opacity: session?.user ? 1 : 0.5 }}>Comment</button>
                        </form>
                      </div>
                    </div>
                  </article>
                )}
              </section>

              <CommunityRightPanel />
            </div>
          </div>
        </main>

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

          @media (max-width: 1024px) {
            .community-grid { grid-template-columns: 1fr !important; }
            .left-fixed { display: none !important; }
            .community-main-wrapper { padding-left: 0 !important }
            /* hide right panel on small screens so it doesn't appear below comments */
            .right-rail { display: none !important }
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
          }
          /* Post hover color-only effect */
          .community-post { transition: background-color 120ms ease; background: #121212; }
          .community-post:hover { background: #252525; }
        ` }} />
      </div>
    </div>
  );
}
