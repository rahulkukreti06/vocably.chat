"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import CommunityHeader from "../../../components/CommunityHeader";
import CommunitySidePanel from "../../../components/CommunitySidePanel";
import CommunityRightPanel from "../../../components/CommunityRightPanel";
import { supabase } from "../../../lib/supabaseClient";

export default function CreatePostPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // redirect to community if already posted? no-op
  }, []);

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!content.trim()) return;
    if (!session?.user) {
      alert('Please sign in to post.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = { community_id: null, title: title.trim() || null, content: content.trim(), created_by: session.user.id, created_by_name: session.user.name || session.user.email || null, created_by_image: session.user.image || null };
      const { error } = await supabase.from('community_posts').insert([payload]);
      if (error) {
        console.warn('Failed to save post:', error.message);
        alert('Failed to save post. It will appear locally.');
      }

      // on success or failure, navigate back to community page where posts are read
      router.push('/community');
    } catch (err) {
      console.error(err);
      router.push('/community');
    } finally {
      setSubmitting(false);
    }
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen w-full bg-black text-gray-100 py-14 px-5 sm:px-8">
        <div className="relative max-w-5xl mx-auto text-left">
          <div className="mb-8">
            <CommunityHeader />
          </div>

          <main style={{ display: 'flex', justifyContent: 'center' }}>
            <CommunitySidePanel />

            <div style={{ width: '100%', maxWidth: 900 }}>
              <div style={{ color: '#fff', marginBottom: 12, fontSize: 22, fontWeight: 700 }}>Sign in to create a post</div>
              <p style={{ color: '#9ca3af', marginBottom: 12 }}>You need to sign in to post to the community.</p>
              <button onClick={() => signIn('google')} className="inline-flex items-center rounded-md bg-blue-600 hover:bg-blue-700 px-3 py-1 text-sm font-medium">Sign in with Google</button>
            </div>
          </main>
        </div>
      </div>
    );
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
            <div className="community-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
              <section style={{ maxWidth: 900 }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 12, padding: 20 }}>
                  <h2 style={{ color: '#fff', margin: 0, fontSize: 22, fontWeight: 700 }}>Create post</h2>
                  <div style={{ color: '#9ca3af', marginTop: 8, marginBottom: 16 }}>Posting as {session.user.name || session.user.email}</div>

                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <input aria-label="Title (optional)" placeholder="Title (optional)" value={title} maxLength={300} onChange={(e) => setTitle(e.target.value)} className="rounded-2xl px-4 py-3 bg-white/5 placeholder:text-gray-400 text-gray-100" style={{ fontSize: 16 }} />
                    <div style={{ color: '#9ca3af', fontSize: 12, textAlign: 'right' }}>{title.length}/300</div>

                    <div style={{ display: 'flex', gap: 12 }}>
                      <textarea aria-label="Write a post" placeholder="Body text (optional)" value={content} onChange={(e) => setContent(e.target.value)} rows={10} className="rounded-2xl px-4 py-4 bg-white/5 placeholder:text-gray-400 text-gray-100" style={{ flex: 1, minHeight: 240 }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                      <div style={{ color: '#9ca3af' }}></div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button type="button" onClick={() => router.push('/community')} className="inline-flex items-center rounded-md bg-gray-700 px-3 py-1 text-sm font-medium">Cancel</button>
                        <button type="submit" disabled={submitting} className="inline-flex items-center rounded-md bg-emerald-500 hover:bg-emerald-600 px-4 py-2 text-sm font-medium">{submitting ? 'Posting…' : 'Post'}</button>
                      </div>
                    </div>
                  </form>
                </div>
              </section>

              <CommunityRightPanel />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// replicate left-rail styles used on community page for consistent appearance
// (kept inline to avoid touching global CSS)
const leftRailStyles = `
.left-fixed { font-family: Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial }
.left-fixed .nav-list{ display:flex; flex-direction:column; gap:8px }
.left-fixed .nav-item{ display:flex; align-items:center; gap:12px; padding:8px 10px; color:#cbd5e1; text-decoration:none; border-radius:8px }
.left-fixed .nav-item .nav-icon{ width:28px; height:28px; display:inline-flex; align-items:center; justify-content:center; background:transparent; border-radius:6px }
.left-fixed .nav-item:hover{ background: rgba(255,255,255,0.02); color:#fff }
.games-title{ color:#9ca3af; font-size:12px; margin:8px 2px; font-weight:700 }
.game-card{ display:flex; align-items:center; gap:10px; padding:12px; border-radius:12px; background: linear-gradient(180deg,#9b51e0 0%, #7c3aed 100%); color:#fff; border:none; width:100%; text-align:left }
.game-avatar{ width:44px; height:44px; border-radius:10px; display:inline-flex; align-items:center; justify-content:center; font-size:20px; background: rgba(255,255,255,0.08) }
.game-name{ font-weight:800 }
.game-sub{ font-size:12px; opacity:0.9 }
.new-badge{ background:#ff7b3a; color:#fff; padding:4px 6px; border-radius:999px; font-size:11px; font-weight:800 }
.games-list{ display:flex; flex-direction:column; gap:8px; margin-top:10px }
.games-item{ color:#cbd5e1; text-decoration:none; padding:6px 8px; border-radius:8px }
.games-item:hover{ color:#fff; background: rgba(255,255,255,0.02) }

@media (max-width: 1024px) {
  .community-grid { grid-template-columns: 1fr !important; }
  .left-fixed { display: none !important; }
  .community-main-wrapper { padding-left: 0 !important }
  /* hide right panel on small screens for create page */
  .right-rail { display: none !important }
}

@media (min-width: 1025px) {
  .community-main-wrapper { padding-left: 260px; }
}
`;


// inject styles
if (typeof document !== 'undefined') {
  const s = document.createElement('style');
  s.innerHTML = leftRailStyles;
  document.head.appendChild(s);
}
