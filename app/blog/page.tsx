import React from 'react';
import BlogHeader from '../../components/BlogHeader';
import Link from 'next/link';

export const metadata = {
  title: 'Vocably — Blog',
  description: 'Updates and stories about building Vocably',
};

export default function BlogPage() {
  return (
    <div style={{ background: 'linear-gradient(180deg,#19304a,#0b1220)', minHeight: '100vh', color: '#e6eef8' }}>
      <BlogHeader />
      <style>{`
        .hero-art{ border-radius:28px }
        .hero-art img{ border-radius:inherit; display:block }
        .blog-card{ transition: transform .22s cubic-bezier(.2,.9,.2,1), box-shadow .22s cubic-bezier(.2,.9,.2,1); will-change: transform; }
        .blog-card:hover{ transform: translateY(-6px); box-shadow: 0 10px 30px rgba(11,18,32,0.12); }
        .blog-card .card-image{ transition: transform .36s ease; transform-origin: center; }
        .blog-card:hover .card-image{ transform: scale(1.03); }
        @media (prefers-reduced-motion: reduce){
          .blog-card, .blog-card .card-image{ transition: none !important; transform: none !important; }
        }
        @media (max-width: 640px){
          .hero-art{ height: 220px !important }
          .hero-art img{ border-radius:18px !important }
          .posts-grid{ grid-template-columns: 1fr !important }
          h1{ font-size: 48px !important }
        }
      `}</style>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(180deg,#19304a,#0b1220)', color: '#fff', padding: '64px 0 48px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 96, lineHeight: 0.9, margin: 0, fontWeight: 900, textAlign: 'center' }}>VOCABLY<br/>BLOG</h1>
          </div>
        </div>
      </section>

      {/* Featured + controls */}
  <main style={{ maxWidth: 1200, margin: '-36px auto 40px', padding: '0 20px' }}>
        <div style={{ position: 'relative' }}>
          <div style={{ width: '100%', height: 360, borderRadius: 28, overflow: 'hidden' }} className="hero-art">
            <img src="/smartphone-3572403.jpg" alt="smartphone hero" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
          {/* featured pill removed */}
        </div>

        {/* Posts grid */}
        <section style={{ marginTop: 56, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }} className="posts-grid">
          <CardLarge title="Top 10 Voice Chat Platforms to Meet New People" excerpt="A roundup of platforms to meet and connect — Oct 22, 2025." href="/blog/2025-10-19-first-post" imageSrc="https://logo.clearbit.com/vocably.chat" />
          <CardSmall title="10 fun topics to practice english speaking online" excerpt="Kick off conversations with these topics." href="/blog/10-fun-topics" />
          <CardSmall title="how to watch movies with friends online" excerpt="Tips for synchronized viewing and chat." href="/blog/watch-movies" />
        </section>

      </main>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: '28px 20px', marginTop: 40, background: 'transparent' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: '#cbd5e1' }}>© 2025 Vocably</div>
          <div style={{ display: 'flex', gap: 14 }}>
            <Link href="/privacy" style={{ color: '#fff', fontWeight: 700 }}>Privacy</Link>
            <Link href="/" style={{ color: '#fff', fontWeight: 700 }}>Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function CardLarge({ title, excerpt, href, imageSrc }: { title: string; excerpt: string; href?: string; imageSrc?: string }) {
  return (
    <article className="blog-card" style={{ borderRadius: 12, overflow: 'hidden', background: '#fff', border: '1px solid #eef2f6' }}>
      <div className="card-image" style={{ height: 180, background: '#fff6e8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {imageSrc ? (
          <img src={imageSrc} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : null}
      </div>
      <div style={{ padding: 16 }}>
  <h3 style={{ margin: '0 0 8px 0', textTransform: 'lowercase', color: '#0b1220', fontWeight: 700 }}>{title}</h3>
        <p style={{ margin: 0, color: '#6b7280' }}>{excerpt}</p>
        {href ? <div style={{ marginTop: 12 }}><Link href={href} style={{ color: '#10b981', fontWeight: 700 }}>Read more</Link></div> : null}
      </div>
    </article>
  );
}

function CardSmall({ title, excerpt, href }: { title: string; excerpt: string; href?: string }) {
  return (
    <article className="blog-card" style={{ borderRadius: 12, overflow: 'hidden', background: '#fff', border: '1px solid #eef2f6' }}>
      <div className="card-image" style={{ height: 180, background: '#fff7f0' }} />
      <div style={{ padding: 16 }}>
  <h4 style={{ margin: '0 0 8px 0', textTransform: 'lowercase', color: '#0b1220', fontWeight: 700 }}>{title}</h4>
        <p style={{ margin: 0, color: '#6b7280' }}>{excerpt}</p>
        {href ? <div style={{ marginTop: 12 }}><Link href={href} style={{ color: '#10b981', fontWeight: 700 }}>Read more</Link></div> : null}
      </div>
    </article>
  );
}

