"use client";
import React, { useState, useEffect } from "react";
import { usePathname } from 'next/navigation';
// Height used for the spacer when header is fixed
const headerHeight = 64; // px - matches header visual height
import Link from "next/link";

export default function BlogHeader() {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === '/') return pathname === '/';
    return pathname === href || pathname === href + '/' || pathname.startsWith(href + '/');
  };

  const activeNavStyle: React.CSSProperties = { background: 'rgba(16,185,129,0.06)', color: '#064e3b' };

  useEffect(() => {
    const check = () => setIsMobile(typeof window !== 'undefined' && window.innerWidth <= 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (typeof window === 'undefined') return;
      setScrolled(window.scrollY > 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
  <>
    <header style={{ ...headerWrap, background: scrolled ? 'transparent' : headerWrap.background, borderBottom: scrolled ? 'none' : headerWrap.borderBottom, transition: 'background .18s ease, border-bottom .18s ease' }}>
      <div style={container} className="blog-header-container">
        <div style={left}>
          <Link href="/" style={brandLink}>
            <span style={brand}>Vocably</span>
          </Link>
        </div>

        {!isMobile && !scrolled && (
          <nav style={nav} aria-label="Main navigation" className="blog-nav">
            <Link href="/blog" style={{ ...navLink, ...(isActive('/blog') ? activeNavStyle : {}) }} aria-current={isActive('/blog') ? 'page' : undefined}>Blog</Link>
            <Link href="/blog/features" style={{ ...navLink, ...(isActive('/blog/features') ? activeNavStyle : {}) }} aria-current={isActive('/blog/features') ? 'page' : undefined}>Features</Link>
            <Link href="/blog/how-it-works" style={{ ...navLink, ...(isActive('/blog/how-it-works') ? activeNavStyle : {}) }} aria-current={isActive('/blog/how-it-works') ? 'page' : undefined}>How It Works</Link>
            <Link href="/blog/about" style={{ ...navLink, ...(isActive('/blog/about') ? activeNavStyle : {}) }} aria-current={isActive('/blog/about') ? 'page' : undefined}>About</Link>
          </nav>
        )}

        {(!isMobile || scrolled) && (
          <div style={right} className="blog-header-right">
            <Link href="/" style={{ ...ctaBtn, ...(scrolled ? ctaScrolled : {}) }}>Try Vocably</Link>
          </div>
        )}

        {isMobile && !scrolled && (
          <button className="hamburger" aria-label="Open menu" onClick={() => setOpen((v) => !v)}>
            {open ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18M6 6l12 12" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6h18M3 12h18M3 18h18" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            )}
          </button>
        )}
      </div>

      {open && (
        <div className="mobile-menu" role="dialog" aria-modal="true">
          <div className="mobile-menu-inner">
            <Link href="/blog" className="mobile-link" style={{ ...(isActive('/blog') ? activeNavStyle : {}) }} aria-current={isActive('/blog') ? 'page' : undefined} onClick={() => setOpen(false)}>Blog</Link>
            <Link href="/blog/features" className="mobile-link" style={{ ...(isActive('/blog/features') ? activeNavStyle : {}) }} aria-current={isActive('/blog/features') ? 'page' : undefined} onClick={() => setOpen(false)}>Features</Link>
            <Link href="/blog/how-it-works" className="mobile-link" style={{ ...(isActive('/blog/how-it-works') ? activeNavStyle : {}) }} aria-current={isActive('/blog/how-it-works') ? 'page' : undefined} onClick={() => setOpen(false)}>How It Works</Link>
            <Link href="/blog/about" className="mobile-link" style={{ ...(isActive('/blog/about') ? activeNavStyle : {}) }} aria-current={isActive('/blog/about') ? 'page' : undefined} onClick={() => setOpen(false)}>About</Link>
            <Link href="/" className="mobile-cta" onClick={() => setOpen(false)}>Try Vocably</Link>
          </div>
        </div>
      )}

      <style>{`
    .hamburger{ display:none; background:transparent; border:none; padding:6px; transition: transform .12s ease; }
        /* hover / focus for header links */
        .blog-nav a, .blog-header-right a, .mobile-link, .mobile-cta { transition: color .14s ease, background .14s ease, transform .12s ease, box-shadow .12s ease; }
        .blog-nav a:hover, .blog-nav a:focus { color: #064e3b; background: rgba(16,185,129,0.06); border-radius:6px; }
        .blog-header-right a:hover, .blog-header-right a:focus { transform: translateY(-2px); box-shadow: 0 8px 26px rgba(16,185,129,0.10); }
        .mobile-link:hover { background:#f1f5f9; border-radius:6px; }
        .mobile-cta:hover, .mobile-cta:focus { transform: translateY(-2px); box-shadow: 0 8px 26px rgba(16,185,129,0.12); }
        .blog-nav a:focus, .mobile-link:focus, .mobile-cta:focus { outline: 3px solid rgba(16,185,129,0.14); outline-offset: 3px; }
        .hamburger:hover{ transform: scale(1.04); }
        
        .mobile-menu{ position:fixed; top:${headerHeight}px; left:0; right:0; background:#fff; border-top:1px solid #eee; box-shadow:0 8px 24px rgba(2,6,23,0.08); z-index:80 }
        .mobile-menu-inner{ display:flex; flex-direction:column; gap:8px; padding:16px }
        .mobile-link{ padding:10px 12px; color:#0f172a; text-decoration:none; font-weight:700 }
        .mobile-cta{ margin-top:6px; padding:10px 12px; background:#10b981; color:#fff; border-radius:8px; text-decoration:none; font-weight:800 }

        /* Responsive rules */
        @media (max-width: 640px){
          .blog-nav{ display:none }
          .blog-header-right{ display:none }
          .hamburger{ display:inline-flex; margin-left: auto }
        }
      `}</style>
    </header>
  <div style={{ height: headerHeight }} aria-hidden="true" />
  </>
  );
}

const headerWrap: React.CSSProperties = {
  background: '#ffffff',
  borderBottom: '1px solid #eee',
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  zIndex: 999,
};

const container: React.CSSProperties = {
  maxWidth: 1200,
  margin: '0 auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '14px 20px'
};

// (headerHeight is declared at top)

const left: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 12 };
const brand: React.CSSProperties = { fontWeight: 900, fontSize: 40, background: 'linear-gradient(90deg,#ffe066,#10b981)', WebkitBackgroundClip: 'text' as any, color: 'transparent' };
const brandLink: React.CSSProperties = { textDecoration: 'none' };

const nav: React.CSSProperties = { display: 'flex', gap: 24, alignItems: 'center' };
const navLink: React.CSSProperties = { color: '#0f172a', textDecoration: 'none', fontWeight: 700, padding: '6px 8px', borderRadius: 8 };

const right: React.CSSProperties = { display: 'flex', gap: 14, alignItems: 'center' };
const ghostBtn: React.CSSProperties = { padding: '8px 12px', borderRadius: 8, border: '1px solid #e6eef8', background: 'transparent', color: '#0f172a', textDecoration: 'none', fontWeight: 700 };
const ctaBtn: React.CSSProperties = { padding: '9px 16px', borderRadius: 12, background: '#10b981', color: '#fff', fontWeight: 800, textDecoration: 'none' };
const ctaScrolled: React.CSSProperties = { background: '#fff', color: '#0b1220', boxShadow: '0 8px 26px rgba(2,6,23,0.08)' };
const brandScrolled: React.CSSProperties = { background: '#fff', color: '#0b1220', padding: '6px 10px', borderRadius: 8, display: 'inline-block', boxShadow: '0 8px 26px rgba(2,6,23,0.06)', fontSize: 28 };
