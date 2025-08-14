"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Plus, Sun, Moon, ChevronDown } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import "../styles/header.css";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

// Custom hook for media query
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);
  return matches;
}

export function SearchBar({ searchTerm, onSearchChange }: { searchTerm?: string, onSearchChange?: (term: string) => void }) {
  const [isFocused, setIsFocused] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [marqueeStart, setMarqueeStart] = useState('100%');
  const [marqueeEnd, setMarqueeEnd] = useState('-100%');
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 641) {
      } else {
      }
    }
  }, []);
  const [marqueeLeft, setMarqueeLeft] = useState('0%');
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 1024) {
        setMarqueeStart('100%');
        setMarqueeEnd('-100%');
        setMarqueeLeft('25%');
      } else {
        setMarqueeStart('100%');
        setMarqueeEnd('-100%');
        setMarqueeLeft('0%');
      }
    }
  }, []);
  const [marqueeWidth, setMarqueeWidth] = useState('79%');
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 641) {
        setMarqueeWidth('100%');
      } else {
        setMarqueeWidth('79%');
      }
    }
  }, []);
  return (
    <div className="search-input" style={{ position: 'relative' }}>
    <input
        type="text"
        value={searchTerm || ''}
        onChange={e => onSearchChange && onSearchChange(e.target.value)}
        aria-label="Search rooms"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={isFocused || searchTerm ? 'Search by room, language, level, or username...' : ''}
        style={{
          width: '100%',
          background: '#hsla(0, 0%, 100%, .05)',
          color: !isFocused && !searchTerm ? 'transparent' : '#fff',
          fontSize: 16,
          border: isFocused ? '1.5px solid #ffd700' : '1.5px solid #23272f',
          outline: 'none',
          // Ensure SSR and first client render match to avoid hydration warnings
          padding: (mounted && typeof window !== 'undefined' && window.innerWidth <= 600)
            ? '19px 12px'
            : '21px 12px',
          borderRadius: 8,
          boxShadow: '0 2px 8px #0002',
          minHeight: 40,
          position: 'relative',
          zIndex: 1,
          caretColor: '#ffd700',
        }}
      />
      {mounted && !isFocused && !searchTerm && (
        <span
          className="marquee-wrapper"
          style={{
            position: 'absolute',
            left: '0%',
            top: '5px',
            width: marqueeWidth,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            color: '#888',
            fontSize: 16,
            lineHeight: '40px',
            padding: 0,
            whiteSpace: 'nowrap',
            background: 'transparent',
            zIndex: 10,
            overflow: 'hidden',
            textShadow: '0 0 6px #000, 0 0 2px #ffd700',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              whiteSpace: 'nowrap',
              animation: 'marquee-center 7s linear infinite',
              minWidth: '100%',
              color: '#888',
              textShadow: 'none',
              fontWeight: 700,
            }}
          >
            Search by room, language, level or username...
          </span>
          <style>{`
            @keyframes marquee-center {
              0% { transform: translateX(${marqueeStart}); }
              100% { transform: translateX(${marqueeEnd}); }
            }
          `}</style>
        </span>
      )}
    </div>
  );
}

interface HeaderProps {
  onCreateRoomClick?: () => void;
  onProfileClick?: () => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onCreateRoomClick, onProfileClick, searchTerm, onSearchChange }) => {
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = React.useRef<HTMLDivElement>(null);
  const [showLightThemeMsg, setShowLightThemeMsg] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 641px)');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const { data: session, status } = useSession();
  // Session effect without debug logging

  useEffect(() => {
    setMounted(true);
    // Always use dark theme by default
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored === 'dark') {
        setTheme('dark');
      } else {
        setTheme('dark');
      }
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    }

    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileMenuOpen]);

  useEffect(() => {
    if (!mounted) return;
    // Apply the same layout and behavior for both themes
    document.documentElement.classList.add(theme);
    document.documentElement.classList.remove(theme === 'dark' ? 'light' : 'dark');
    document.body.classList.add(theme);
    document.body.classList.remove(theme === 'dark' ? 'light' : 'dark');
    localStorage.setItem('theme', theme);
  }, [theme, mounted]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const handleThemeClick = () => {
    if (theme === 'dark') {
      setShowLightThemeMsg(true);
      setTimeout(() => setShowLightThemeMsg(false), 2200);
    } else {
      setTheme('dark');
    }
  };

  // Add responsive styles for the Header component
  return (
    <div className="header-root">
      {showLightThemeMsg && (
        <div
          style={{
            position: 'fixed',
            top: 32,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(90deg, #fffbe6 60%, #ffe066 100%)',
            color: '#232e4d',
            border: '2.5px solid #ffe066',
            borderRadius: 18,
            boxShadow: '0 8px 32px #ffe06655, 0 2px 12px #10b98133',
            padding: '1.1rem 2.7rem',
            fontWeight: 800,
            fontSize: 20,
            zIndex: 9999,
            textAlign: 'center',
            letterSpacing: '0.01em',
            textShadow: '0 2px 12px #ffe06688, 0 1px 0 #fffbe6cc',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            animation: 'fade-in-popup 0.25s cubic-bezier(.4,2,.3,1)',
          }}
        >
          <span style={{ fontSize: 26, marginRight: 14, filter: 'drop-shadow(0 2px 8px #ffe06688)' }}>✨</span>
          <span>Light theme <span style={{ color: '#bfa100', fontWeight: 900 }}>coming soon</span>!</span>
          <style>{`
            @keyframes fade-in-popup {
              from {
                opacity: 0;
                transform: scale(0.9);
              }
              to {
                opacity: 1;
                transform: scale(1);
              }
            }
          `}</style>
        </div>
      )}
      {/* Mobile Layout */}
      {!isDesktop ? (
        <div className="header-container">
          {/* Brand Title */}
          <div className="header-logo">
            <Link href="/" className="header-brand-text">
              <span style={{ fontWeight: 900, fontSize: '1.6rem', letterSpacing: '0.04em', background: 'linear-gradient(90deg, #ffe066 0%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Vocably</span>
            </Link>
          </div>
          {/* Search Bar */}
          <div className="search-bar-container">
            <SearchBar searchTerm={searchTerm} onSearchChange={onSearchChange} />
          </div>
          {/* Mobile Menu Button */}
          <div className="header-actions">
            <button
              className="header-menu-btn"
              aria-label="Open menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
          {/* Mobile Dropdown Menu */}
          {menuOpen && (
            <div className="header-mobile-menu">
              <Link 
                href="/privacy" 
                className="header-btn"
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  color: '#10b981',
                  border: '1px solid #10b98140',
                  marginBottom: '0.5rem',
                  textDecoration: 'none',
                  width: '100%',
                  textAlign: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                Privacy Policy
              </Link>
              <button
                className="theme-btn"
                onClick={handleThemeClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  color: '#10b981',
                  border: '1px solid #10b98140',
                  marginBottom: '0.5rem',
                  textDecoration: 'none',
                  width: '100%',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </button>
              {status === "loading" ? null : !session ? (
                <button
                  className="header-btn"
                  onClick={() => {
                    signIn("google");
                    setMenuOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    color: '#10b981',
                    border: '1px solid #10b98140',
                    marginBottom: '0.5rem',
                    textDecoration: 'none',
                    width: '100%',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  <Image src="/google.svg" alt="Google" width={20} height={20} />
                  Sign in with Google
                </button>
              ) : (
                <button
                  className="header-btn"
                  onClick={() => {
                    signOut();
                    setMenuOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    color: '#ef4444',
                    border: '1px solid #ef444440',
                    marginBottom: '0.5rem',
                    textDecoration: 'none',
                    width: '100%',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  Sign out
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Desktop Layout */
        <div className="header-container">
          <div className="header-logo">
            <Link href="/" className="header-brand-text">
              <span style={{ fontWeight: 900, fontSize: '2.2rem', letterSpacing: '0.04em', background: 'linear-gradient(90deg, #ffe066 0%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Vocably</span>
            </Link>
          </div>
          <SearchBar searchTerm={searchTerm} onSearchChange={onSearchChange} />
          <nav className="header-actions">
            <button className="header-btn create-room-btn" tabIndex={0} onClick={onCreateRoomClick}>
              <Plus size={18} /> Create Room
            </button>
{status === "loading" ? null : !session ? (
              <button
                className="header-btn"
                onClick={() => signIn("google")}
                tabIndex={0}
              >
                Sign in
              </button>
            ) : (
              <div ref={profileMenuRef}>
                <button
                  className="header-btn"
                  onClick={() => setProfileMenuOpen((v) => !v)}
                  aria-haspopup="true"
                  aria-expanded={profileMenuOpen}
                  tabIndex={0}
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <Avatar style={{ width: 32, height: 32 }}>
                    {session.user?.image && <AvatarImage src={session.user.image} alt={session.user.name || 'User'} />}
                    <AvatarFallback>{session.user?.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                  {session?.user?.name || 'Profile'}
                  <ChevronDown size={18} />
                </button>
                {profileMenuOpen && (
                  <div className="header-profile-dropdown" style={{
                    padding: '0.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    minWidth: '200px',
                    backgroundColor: '#000',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                  }}>
                    {/* Removed Contact Us from desktop dropdown */}

                    <button
                      className="header-btn"
                      onClick={handleThemeClick}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        color: '#10b981',
                        border: '1px solid #10b98140',
                        textDecoration: 'none',
                        width: '100%',
                        textAlign: 'left',
                        transition: 'all 0.2s ease',
                        background: 'transparent',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        justifyContent: 'flex-start'
                      }}
                    >
                      {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                      {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                    </button>
                    <button
                      className="header-btn"
                      onClick={() => { signOut(); setProfileMenuOpen(false); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        color: '#ef4444',
                        border: '1px solid #ef444440',
                        textDecoration: 'none',
                        width: '100%',
                        textAlign: 'left',
                        transition: 'all 0.2s ease',
                        background: 'transparent',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        justifyContent: 'flex-start'
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                      </svg>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
