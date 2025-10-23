import React from 'react';
import BlogHeader from '../../../components/BlogHeader';
import Link from 'next/link';

export const metadata = {
  title: 'About — Vocably',
  description: 'About Vocably — mission and team',
};

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#0b1220' }}>
      <BlogHeader />
      <main style={{ maxWidth: 920, margin: '48px auto', padding: '0 20px' }}>
        <h1 style={{ fontSize: 36 }}>About Vocably</h1>
        <p style={{ color: '#6b7280' }}>Vocably helps language learners find short, friendly speaking practice rooms with focused topics and supportive hosts.</p>

        <section style={{ marginTop: 24 }}>
          <h3>Mission</h3>
          <p style={{ color: '#6b7280' }}>To make language speaking practice accessible, social, and low-pressure.</p>
          <h3>Team</h3>
          <p style={{ color: '#6b7280' }}>Small, distributed team building lightweight audio-first experiences.</p>
        </section>

        <div style={{ marginTop: 28 }}>
          <Link href="/" style={{ padding: '10px 14px', background: '#10b981', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 700 }}>Get started</Link>
        </div>
      </main>
    </div>
  );
}
