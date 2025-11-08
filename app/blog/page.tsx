import React from 'react';
import BlogHeader from '../../components/BlogHeader';
import PostsCarousel from '../../components/PostsCarousel';
import Link from 'next/link';

export const metadata = {
  title: 'Vocably — Blog',
  description: 'Updates and stories about building Vocably',
};

export default function BlogPage() {
  return (
    <div style={{ background: '#fff', minHeight: '100vh', color: '#071025' }}>
      <BlogHeader />

      <style>{`
        :root{ --max-width:1200px }
    /* Hero: centered large typographic headline with subtitle centered below; responsive */
  .hero{ display:grid; grid-template-columns: 1fr; gap:18px; justify-items:center; align-items:center; max-width:var(--max-width); margin:88px auto 24px; padding: 12px 20px 0 }
    .hero-title{ margin:0; font-weight:900; line-height:0.92; letter-spacing: -4px; color:#071025; font-family:inherit; text-align:center }
    .hero-word{ display:block; font-size: clamp(72px, 12vw, 200px); margin:0; }
    .hero-line{ display:flex; align-items:center; gap:18px; margin-top:8px; justify-content:center }
    .hero-dash{ display:inline-block; width:64px; height:16px; background:#071025; border-radius:4px }
    .hero-small{ font-size: clamp(48px, 8.5vw, 120px); font-weight:900 }
  /* subtitle centered below headline */
  .hero-sub{ color:#071025; font-size: clamp(16px, 2.2vw, 20px); margin:0 0 48px 0; max-width:820px; text-align:center }

  /* Posts grid (below hero) */
  .posts-grid{ display:grid; grid-template-columns: repeat(2,1fr); gap:40px; max-width:var(--max-width); margin: 48px auto 0; padding: 0 20px }
        @media (max-width: 1100px){ .posts-grid{ grid-template-columns: 1fr } }

        /* Card styles */
        .blog-card{ background:#fff; border-radius:8px; overflow:hidden; box-shadow: 0 6px 20px rgba(2,6,23,0.06); transition: transform .28s cubic-bezier(.2,.9,.2,1), box-shadow .28s cubic-bezier(.2,.9,.2,1); }
        .blog-card:hover{ transform: translateY(-8px); box-shadow: 0 16px 48px rgba(2,6,23,0.10); }
        .card-media{ height: 320px; overflow: hidden; display:block; background-size:cover; background-position:center; background-repeat:no-repeat; }
        .card-body{ padding: 28px 24px 32px }
        .card-category{ font-size:12px; letter-spacing:1px; color:#6b7280; font-weight:700; text-transform:uppercase; margin-bottom:12px }
        .card-title{ font-size:28px; line-height:1.05; margin:0 0 12px; font-weight:900; color:#071025 }
        .card-excerpt{ margin:0 0 14px; color:#475569 }

        /* Responsive adjustments: stack hero and center on small screens */
        @media (max-width: 980px){
          .hero{ grid-template-columns: 1fr; gap:16px; margin:18px auto }
          .hero-sub{ max-width: none; text-align: center }
          .hero-word, .hero-line, .hero-small{ text-align:center; display:block; width:100% }
          .hero-dash{ margin: 8px auto; }
        }

        @media (max-width: 520px){
          .hero-word{ font-size: clamp(40px, 12vw, 96px) }
          .hero-small{ font-size: clamp(28px, 9vw, 56px) }
          .card-media{ height: 220px }
        }
      `}</style>

      {/* Stacked hero: big left headline, styled dash + second line, subtitle right */}
      <div className="hero">
        <div>
          <h1 className="hero-title">
            <span className="hero-word">VOCABLY</span>
            <span className="hero-line"><span className="hero-small">BLOG</span></span>
          </h1>
        </div>
        <p className="hero-sub">Stories and updates from the Vocably team, product tips, and stories about building better conversations.</p>
  </div>

  <PostsCarousel />

      <main style={{ maxWidth: 1200, margin: '8px auto 40px', padding: '0 20px' }}>
        <div className="posts-grid">
          
          <CardLarge category="Makers" title="Top 10 Voice Chat Platforms to Meet New People" excerpt="A roundup of platforms to meet and connect — Oct 22, 2025." href="/blog/2025-10-19-first-post" imageSrc="/top-10-voice-chat-platform.jpg" />
          <CardSmall
            category="Know"
            title="How to Meet New People Online and Actually Make Friends in 2025"
            excerpt="Written by Rahul Kukreti — Nov 6, 2025"
            href="/blog/how-to-meet-new-people-online-2025"
            imageSrc="/how-to-make-friends-online.jpg"
          />
         
        </div>
      </main>

      <footer style={{ borderTop: '1px solid rgba(0,0,0,0.04)', padding: '28px 20px', marginTop: 40, background: 'transparent' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: '#6b7280' }}>© 2025 Vocably</div>
          <div style={{ display: 'flex', gap: 14 }}>
            <Link href="/privacy" style={{ color: '#071025', fontWeight: 700 }}>Privacy</Link>
            <Link href="/" style={{ color: '#071025', fontWeight: 700 }}>Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function CardLarge({ category, title, excerpt, href, imageSrc }: { category?: string; title: string; excerpt: string; href?: string; imageSrc?: string }) {
  return (
    <article className="blog-card">
      <Link href={href ?? '#'} style={{ display: 'block', color: 'inherit', textDecoration: 'none' }}>
        {/* use background-image so the image covers the media area fully */}
        <div
          className="card-media"
          style={imageSrc ? { backgroundImage: `url(${imageSrc})` } : {}}
          role={imageSrc ? 'img' : undefined}
          aria-label={imageSrc ? title : undefined}
        >
          {!imageSrc && <div style={{ height: '100%', background: '#f1f5f9' }} />}
        </div>
        <div className="card-body">
          {category ? <div className="card-category">{category}</div> : null}
          <h3 className="card-title">{title}</h3>
          <div className="card-excerpt">{excerpt}</div>
        </div>
      </Link>
    </article>
  );
}

function CardSmall({ category, title, excerpt, href, imageSrc }: { category?: string; title: string; excerpt: string; href?: string; imageSrc?: string }) {
  return (
    <article className="blog-card">
      <Link href={href ?? '#'} style={{ display: 'block', color: 'inherit', textDecoration: 'none' }}>
        <div
          className="card-media"
          style={imageSrc ? { backgroundImage: `url(${imageSrc})` } : {}}
          role={imageSrc ? 'img' : undefined}
          aria-label={imageSrc ? title : undefined}
        >
          {!imageSrc && <div style={{ width: '100%', height: '100%', background: 'linear-gradient(180deg,#f8fafc,#eef2ff)' }} />}
        </div>
        <div className="card-body">
          {category ? <div className="card-category">{category}</div> : null}
          <h4 className="card-title" style={{ fontSize: 20 }}>{title}</h4>
          <div className="card-excerpt">{excerpt}</div>
        </div>
      </Link>
    </article>
  );
}

