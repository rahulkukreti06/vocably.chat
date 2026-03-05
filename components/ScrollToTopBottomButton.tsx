"use client";
import { useEffect, useState } from "react";
import { FaArrowDown, FaArrowUp, FaComments } from "react-icons/fa";
import Link from "next/link";

export default function ScrollToTopBottomButton() {
  const [atBottom, setAtBottom] = useState(false);
  const [show, setShow] = useState(true);
  const [showChatFab, setShowChatFab] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [navVisible, setNavVisible] = useState(true);

  useEffect(() => {
    function recalc() {
      const scrollY = window.scrollY || window.pageYOffset;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      const isScrollable = docHeight - windowHeight > 4; // avoid treating non-scrollable pages as bottom
      const nearBottom = scrollY + windowHeight >= docHeight - 2;
      setAtBottom(isScrollable && nearBottom);
    }
    const onScroll = () => recalc();
    const onResize = () => recalc();
    window.addEventListener("scroll", onScroll);
    window.addEventListener("resize", onResize);
    // Defer initial calculation until layout/content is ready
    if (document.readyState === 'complete') {
      requestAnimationFrame(recalc);
    } else {
      window.addEventListener('load', recalc, { once: true });
      requestAnimationFrame(recalc);
    }
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    // Hide button if Jitsi container is present (meeting view)
    const checkJitsi = () => {
      const jitsiDiv = document.querySelector('div[data-jitsi-meeting], .jitsi-container, .jitsi-meet') || document.querySelector('iframe[src*="jitsi"]');
      setShow(!jitsiDiv);
    };
    checkJitsi();
    const observer = new MutationObserver(checkJitsi);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 640px)');
    const apply = () => setShowChatFab(!mq.matches);
    // initial
    apply();
    // listen for changes
    if (mq.addEventListener) {
      mq.addEventListener('change', apply);
      return () => mq.removeEventListener('change', apply);
    } else {
      // fallback
      mq.addListener(apply);
      return () => mq.removeListener(apply);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 640px)');
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    if (mq.addEventListener) {
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    } else {
      mq.addListener(onChange);
      return () => mq.removeListener(onChange);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      setNavVisible(Boolean(detail?.visible));
    };
    window.addEventListener('mobile-nav-visibility', handler as EventListener);
    // cleanup
    return () => window.removeEventListener('mobile-nav-visibility', handler as EventListener);
  }, []);

  function handleClick() {
    if (atBottom) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
    }
  }

  if (!show) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      {showChatFab && (
        <Link
          href="/chat"
          aria-label="Open chat"
          className="scroll-fab fancy-fab"
          style={{ transform: 'translateY(-76px)', zIndex: 10 }}
        >
          <span className="fab-bg-glow" />
          <span className="fab-icon">
            <span className="fab-arrow">
              <FaComments size={32} style={{ color: '#fff', filter: 'none' }} />
            </span>
          </span>
        </Link>
      )}

        <button
        className="scroll-fab fancy-fab"
        onClick={handleClick}
        aria-label={atBottom ? "Scroll to top" : "Scroll to bottom"}
        style={{ transform: isMobile ? (navVisible ? 'translateY(-44px)' : 'translateY(0px)') : undefined, zIndex: 1000, transition: 'transform 260ms cubic-bezier(.16,.84,.24,1)' }}
      >
        <span className="fab-bg-glow" />
        <span className="fab-icon">
          <span className="fab-arrow">
            {atBottom ? (
              <FaArrowUp size={32} style={{ color: '#fff', filter: 'none' }} />
            ) : (
              <FaArrowDown size={32} style={{ color: '#fff', filter: 'none' }} />
            )}
          </span>
        </span>
      </button>
    </div>
  );
}
