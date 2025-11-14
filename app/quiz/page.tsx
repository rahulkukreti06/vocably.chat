"use client";
import React, { useState } from 'react';
import BlogHeader from '../../components/BlogHeader';
import Image from 'next/image';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function QuizPage(): JSX.Element {
  const { data: session, status } = useSession();
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleContinue = () => {
    if (session) {
      router.push('/quiz/start');
    }
  };

  const handleGetStarted = () => {
    if (!session) {
      setMsg('You need to sign in first');
      return;
    }
    setMsg(null);
    router.push('/quiz/start');
  };
  return (
    <main style={{ background: '#fff', minHeight: '100vh', color: '#071025' }}>
      <div className="content-wrapper">
        <BlogHeader />

        <style>{`
          .content-wrapper{ position:relative; z-index:1 }
        `}</style>

        <div>
          <style>{`
            :root{ --max-width:1200px }
            .hero{ display:grid; grid-template-columns: 1fr; gap:18px; justify-items:center; align-items:center; max-width:var(--max-width); margin:88px auto 24px; padding: 12px 20px 0 }
            .hero-title{ margin:0; font-weight:900; line-height:0.92; letter-spacing: -4px; color:#071025; font-family:inherit; text-align:center }
            .hero-word{ display:block; font-size: clamp(72px, 12vw, 200px); margin:0; }
            .hero-line{ display:flex; align-items:center; gap:18px; margin-top:8px; justify-content:center }
            .hero-small{ font-size: clamp(48px, 8.5vw, 120px); font-weight:900 }
            @media (max-width: 980px){ .hero{ margin:18px auto } }
            /* Center hero and controls vertically on larger screens; allow mobile override */
            /* remove top padding on large screens by using horizontal padding only */
            .quiz-hero-container{ max-width:900px; margin:24px auto 0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:40px; padding:0 20px }
            .quiz-subtitle{ display:none; color:#334155; text-align:center; max-width:820px; margin:0 auto; font-weight:600; font-size:18px; line-height:1.25 }
            @media (max-width: 640px){
              /* add a top margin only on small screens so the container has breathing room */
              .quiz-hero-container{ min-height: calc(100vh - 56px); margin:104px auto 0; padding-top:0; justify-content:flex-start; }
              .hero{ margin: 0 auto; }
              .quiz-subtitle{ display:block; font-size:15px; padding:0 12px }
            }
          `}</style>

          <div className="quiz-hero-container" style={{ maxWidth: 900, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40 }}>
            <div className="hero">
              <div>
                <h1 className="hero-title">
                  <span className="hero-word">VOCABLY</span>
                  <span className="hero-line"><span className="hero-small">QUIZ</span></span>
                </h1>
              </div>
            </div>
            <p className="quiz-subtitle">Boost your skills with interactive topic-based quizzes.<br/>Challenge yourself with quizzes and improve every day!</p>
            {status === 'loading' ? null : session ? (
              <div role="group" aria-label="Continue or switch account" style={{ display: 'inline-flex', alignItems: 'center', gap: 0 }}>
                <button
                  type="button"
                  onClick={handleContinue}
                  aria-label={"Continue with " + (session.user?.name ?? session.user?.email?.split('@')[0])}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '14px 20px',
                    borderRadius: '12px 0 0 12px',
                    border: '1px solid rgba(2,6,23,0.08)',
                    borderRight: 'none',
                    background: '#fff',
                    color: '#071025',
                    cursor: 'pointer',
                    fontWeight: 800,
                    fontSize: 16
                  }}
                >
                  <span style={{ display: 'inline-block' }}>Continue with {session.user?.name ?? session.user?.email?.split('@')[0]}</span>
                </button>

                <div aria-hidden style={{ width: 1, height: 28, background: 'rgba(2,6,23,0.18)', alignSelf: 'center' }} />

                <button
                  type="button"
                  onClick={() => signIn('google')}
                  aria-label="Switch account"
                  title="Switch account"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 52,
                    height: 52,
                    borderRadius: '0 12px 12px 0',
                    border: '1px solid rgba(2,6,23,0.08)',
                    borderLeft: 'none',
                    background: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#071025" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => signIn('google')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 18px', borderRadius: 10, border: '1px solid rgba(2,6,23,0.06)', background: '#fff', color: '#071025', cursor: 'pointer', fontWeight: 700 }}
              >
                <Image src="/google.svg" alt="Google" width={18} height={18} />
                Sign in with Google
              </button>
            )}

            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleGetStarted();
              }}
              style={{ display: 'inline-block', padding: '10px 20px', borderRadius: 12, background: '#000', color: '#fff', textDecoration: 'none', fontWeight: 800 }}
            >
              Get started
            </a>

            {msg && <div role="alert" style={{ color: '#ef4444', fontWeight: 700 }}>{msg}</div>}
          </div>
        </div>
      </div>
    </main>
  );
}
