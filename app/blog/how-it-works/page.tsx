import React from 'react';
import BlogHeader from '../../../components/BlogHeader';
import Link from 'next/link';

export const metadata = {
  title: 'How It Works — Vocably',
  description: 'How Vocably works: rooms, discovery, participation, and privacy',
};

export default function HowItWorksPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#0b1220' }}>
      <BlogHeader />
      <main style={{ maxWidth: 920, margin: '48px auto', padding: '0 20px' }}>
        <h1 style={{ fontSize: 36, marginBottom: 8 }}>How It Works</h1>
        <p style={{ color: '#6b7280' }}>A short explanation of rooms, participation, and privacy.</p>

        <section style={{ marginTop: 28, display: 'grid', gap: 18 }}>
          <article style={{ padding: 18, borderRadius: 10, border: '1px solid #eef2f6' }}>
            <h3>Rooms</h3>
            <p style={{ color: '#6b7280' }}>Rooms are short-lived or scheduled spaces where people can join by topic and level.</p>
          </article>

          <article style={{ padding: 18, borderRadius: 10, border: '1px solid #eef2f6' }}>
            <h3>Discovery & Participation</h3>
            <p style={{ color: '#6b7280' }}>Rooms are discoverable by language, level, and tags. You can join as a speaker or listener, and hosts can moderate conversations.</p>
          </article>

          <article style={{ padding: 18, borderRadius: 10, border: '1px solid #eef2f6' }}>
            <h3>Audio & Controls</h3>
            <p style={{ color: '#6b7280' }}>We optimize for low-latency audio and simple controls (mute, raise hand, and host controls).</p>
          </article>

          <article style={{ padding: 18, borderRadius: 10, border: '1px solid #eef2f6' }}>
            <h3>Privacy</h3>
            <p style={{ color: '#6b7280' }}>We store minimal data and avoid default public profiles to respect users' privacy.</p>
          </article>
        </section>

        <div style={{ marginTop: 32 }}>
          <Link href="/" style={{ padding: '10px 14px', background: '#10b981', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 700 }}>Try Vocably</Link>
        </div>
      </main>
    </div>
  );
}
