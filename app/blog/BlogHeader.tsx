"use client";
import React, { useState } from "react";
import Link from "next/link";

export default function BlogHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header style={{borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'linear-gradient(180deg, rgba(11,18,32,0.6), rgba(11,18,32,0.75))', position: 'sticky', top: 0, zIndex: 40}}>
      <div style={{maxWidth: 1100, margin: '0 auto', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
          <Link href="/" style={{textDecoration: 'none'}}>
            <div style={{fontWeight: 900, fontSize: 20, background: 'linear-gradient(90deg,#ffe066 0%,#10b981 100%)', WebkitBackgroundClip: 'text', color: 'transparent'}}>Vocably</div>
          </Link>

          <nav style={{display: 'flex', gap: 12, alignItems: 'center'}}>
            <Link href="/blog" style={{color: '#e6eef8', textDecoration: 'none', fontWeight: 700}}>Blog</Link>
            <a href="#mission" style={{color: '#9aa6b2', textDecoration: 'none'}}>Mission</a>
            <a href="#content-types" style={{color: '#9aa6b2', textDecoration: 'none'}}>Content types</a>
            <a href="#structure" style={{color: '#9aa6b2', textDecoration: 'none'}}>Structure</a>
            <a href="#consistency" style={{color: '#9aa6b2', textDecoration: 'none'}}>Consistency</a>
          </nav>
        </div>

        <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
          <Link href="/" style={{padding: '8px 12px', borderRadius: 8, background: 'transparent', border: '1px solid rgba(255,255,255,0.04)', color: '#10b981', textDecoration: 'none', fontWeight: 700}}>Try Vocably</Link>

          <button onClick={() => setOpen((o) => !o)} aria-label="Toggle nav" style={{background: 'transparent', border: 'none', color: '#e6eef8', display: 'none'}}>
            ☰
          </button>
        </div>
      </div>
      {/* Secondary nav (category bar) */}
      <div style={{background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.01)'}}>
        <div style={{maxWidth: 1100, margin: '0 auto', padding: '8px 20px', display: 'flex', gap: 12, alignItems: 'center', overflowX: 'auto'}}>
          <a href="#language" style={{color: '#e6eef8', whiteSpace: 'nowrap', textDecoration: 'none'}}>Language Learning</a>
          <a href="#community" style={{color: '#e6eef8', whiteSpace: 'nowrap', textDecoration: 'none'}}>Community</a>
          <a href="#entertainment" style={{color: '#e6eef8', whiteSpace: 'nowrap', textDecoration: 'none'}}>Entertainment</a>
          <a href="#use-cases" style={{color: '#e6eef8', whiteSpace: 'nowrap', textDecoration: 'none'}}>Use Cases</a>
          <a href="#founder" style={{color: '#e6eef8', whiteSpace: 'nowrap', textDecoration: 'none'}}>Founder Notes</a>
        </div>
      </div>
    </header>
  );
}

