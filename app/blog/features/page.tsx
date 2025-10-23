import React from 'react';
import BlogHeader from '../../../components/BlogHeader';
import Link from 'next/link';

export const metadata = {
  title: 'Features — Vocably',
  description: 'Features and highlights of Vocably',
};

export default function FeaturesPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#0b1220' }}>
      <BlogHeader />
      <main style={{ maxWidth: 920, margin: '48px auto', padding: '0 20px' }}>
        <h1 style={{ fontSize: 36, marginBottom: 8 }}>Features</h1>
        <p style={{ color: '#6b7280' }}>Explore what makes Vocably great for language learners and small communities.</p>

        <section style={{ marginTop: 28, display: 'grid', gap: 18 }}>
          <article style={{ padding: 18, borderRadius: 10, border: '1px solid #eef2f6' }}>
            <h3>Low-latency voice</h3>
            <p style={{ color: '#6b7280' }}>High-quality audio with minimal delay so conversations feel natural.</p>
          </article>

          <article style={{ padding: 18, borderRadius: 10, border: '1px solid #eef2f6' }}>
            <h3>Discoverable rooms</h3>
            <p style={{ color: '#6b7280' }}>Easily find rooms by topic, language, and level.</p>
          </article>

          <article style={{ padding: 18, borderRadius: 10, border: '1px solid #eef2f6' }}>
            <h3>Privacy-focused</h3>
            <p style={{ color: '#6b7280' }}>Minimal friction sign-in and respectful defaults for community privacy.</p>
          </article>
        </section>

        <div style={{ marginTop: 32 }}>
          <Link href="/" style={{ padding: '10px 14px', background: '#10b981', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 700 }}>Try Vocably</Link>
        </div>
      </main>
    </div>
  );
}
