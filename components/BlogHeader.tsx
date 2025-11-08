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

  // active nav style: only use black or white text depending on header background
  // Do not introduce any other colors — active link text will be white on dark header, black on light header.
  const activeNavStyle: React.CSSProperties = scrolled
    ? { background: 'transparent', color: '#fff' }
    : { background: 'transparent', color: '#000' };


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
    {/* change header background and link/button colors when scrolled */}
    <header style={{ ...headerWrap, background: scrolled ? '#000' : headerWrap.background, borderBottom: scrolled ? 'none' : headerWrap.borderBottom, transition: 'background .18s ease, border-bottom .18s ease' }}>
      <div style={container} className="blog-header-container">
        <div style={left}>
          <Link href="/" style={{ ...brandLink, position: 'relative', alignItems: 'center' }}>
            {/* Crossfade logos so header transition is smooth */}
            <span style={{ display: 'inline-block', position: 'relative', width: 48, height: 48, marginRight: 10 }}>
              <img
                src={'/vocably_icon_no_circle_black.png'}
                alt="Vocably dark"
                className="brand-image brand-image-dark"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', opacity: scrolled ? 0 : 1, transition: 'opacity .25s ease' }}
              />
              <img
                src={'/vocably_icon_no_circle_white.png'}
                alt="Vocably light"
                className="brand-image brand-image-light"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', opacity: scrolled ? 1 : 0, transition: 'opacity .25s ease' }}
              />
            </span>
            <span className="brand-text" style={scrolled ? brandScrolled : brand}>Vocably</span>
          </Link>
        </div>

        {!isMobile && (
          <nav style={{ ...nav, position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} aria-label="Main navigation" className="blog-nav">
            {/* nav links switch to white when header is scrolled */}
            <Link href="/blog" style={{ ...(scrolled ? { ...navLink, color: '#fff' } : navLink), ...(isActive('/blog') ? activeNavStyle : {}) }} aria-current={isActive('/blog') ? 'page' : undefined}>Blog</Link>
            <Link href="/blog/features" style={{ ...(scrolled ? { ...navLink, color: '#fff' } : navLink), ...(isActive('/blog/features') ? activeNavStyle : {}) }} aria-current={isActive('/blog/features') ? 'page' : undefined}>Features</Link>
            <Link href="/blog/how-it-works" style={{ ...(scrolled ? { ...navLink, color: '#fff' } : navLink), ...(isActive('/blog/how-it-works') ? activeNavStyle : {}) }} aria-current={isActive('/blog/how-it-works') ? 'page' : undefined}>How It Works</Link>
            <Link href="/blog/about" style={{ ...(scrolled ? { ...navLink, color: '#fff' } : navLink), ...(isActive('/blog/about') ? activeNavStyle : {}) }} aria-current={isActive('/blog/about') ? 'page' : undefined}>About</Link>
          </nav>
  )}

        {(!isMobile || scrolled) && (
          <div style={right} className="blog-header-right">
            {/* CTA inverts to white background on scroll so it stands out on the dark header */}
            <Link href="/" style={{ ...ctaBtn, ...(scrolled ? { background: '#fff', color: '#000' } : {}) }}>Try Vocably</Link>
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

  <style
  dangerouslySetInnerHTML={{
    __html: `
      .hamburger{ display:none; background:transparent; border:none; padding:6px; transition: transform .12s ease; }
      .brand-text{ font-size: 30px; font-weight:900; display:inline-block; line-height:1.12; transform: translateY(2px); padding-bottom:2px; transition: color .22s ease, transform .12s ease }
      .brand-image{ width:48px; height:48px; object-fit:contain; margin-right:10px; vertical-align:middle; display:inline-block; flex-shrink:0; transition: opacity .25s ease }
      .blog-header-right a { white-space: nowrap }
      .blog-nav a, .blog-header-right a, .mobile-link, .mobile-cta { transition: color .22s ease, background .22s ease, transform .12s ease, box-shadow .12s ease; }
      /* keep hover/focus neutral: do not change text color or introduce other colors */
      .blog-nav a:hover, .blog-nav a:focus { color: inherit; background: transparent; border-radius:6px; }
      .blog-header-right a:hover, .blog-header-right a:focus { transform: translateY(-2px); box-shadow: 0 8px 26px rgba(0,0,0,0.08); }
      .mobile-link:hover { background:#f1f5f9; border-radius:6px; }
      .mobile-cta:hover, .mobile-cta:focus { transform: translateY(-2px); box-shadow: 0 8px 26px rgba(0,0,0,0.08); }
      .blog-nav a:focus, .mobile-link:focus, .mobile-cta:focus { outline: 3px solid rgba(0,0,0,0.08); outline-offset: 3px; }
      .hamburger:hover{ transform: scale(1.04); }

      .mobile-menu{ position:fixed; top:${headerHeight}px; left:0; right:0; background:#fff; border-top:1px solid #eee; box-shadow:0 8px 24px rgba(2,6,23,0.08); z-index:80 }
      .mobile-menu-inner{ display:flex; flex-direction:column; gap:8px; padding:16px }
      .mobile-link{ padding:10px 12px; color:#0f172a; text-decoration:none; font-weight:700 }
      .mobile-cta{ margin-top:6px; padding:10px 12px; background:#000; color:#fff; border-radius:8px; text-decoration:none; font-weight:800 }

      @media (max-width: 640px){
        .blog-nav{ display:none }
        .blog-header-right{ display:none }
        .hamburger{ display:inline-flex; margin-left: auto }
        .brand-text{ font-size: 22px !important; line-height:1.08; transform: translateY(1px); padding-bottom:1px }
        .brand-image{ width:32px; height:32px }
        .blog-header-right a { white-space: nowrap; padding: 6px 10px !important; font-size: 14px !important }
      }
    `,
  }}
/>

    </header>
  <div style={{ height: headerHeight }} aria-hidden="true" />
  </>
  );
}

const headerWrap: React.CSSProperties = {
  background: '#ffffffff',
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
// Use solid black text on light (unscrolled) header so the logo reads clearly.
const brand: React.CSSProperties = { fontWeight: 900, color: '#000' };
// ensure the brand link lays out the image and text horizontally
const brandLink: React.CSSProperties = { textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 };

const nav: React.CSSProperties = { display: 'flex', gap: 24, alignItems: 'center' };
const navLink: React.CSSProperties = { color: '#0f172a', textDecoration: 'none', fontWeight: 700, padding: '6px 8px', borderRadius: 8 };

const right: React.CSSProperties = { display: 'flex', gap: 14, alignItems: 'center' };
const ghostBtn: React.CSSProperties = { padding: '8px 12px', borderRadius: 8, border: '1px solid #e6eef8', background: 'transparent', color: '#0f172a', textDecoration: 'none', fontWeight: 700 };
const ctaBtn: React.CSSProperties = { padding: '9px 16px', borderRadius: 12, background: '#000', color: '#fff', fontWeight: 800, textDecoration: 'none' };
const ctaScrolled: React.CSSProperties = { background: '#000', color: '#fff', boxShadow: '0 8px 26px rgba(2,6,23,0.08)' };
// Keep the brand the same size when scrolled; only change color for visibility on dark header
const brandScrolled: React.CSSProperties = { color: '#ffffff', fontWeight: 900 };
