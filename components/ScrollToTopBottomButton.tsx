"use client";
import { useEffect, useState } from "react";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";

export default function ScrollToTopBottomButton() {
  const [atBottom, setAtBottom] = useState(false);
  const [show, setShow] = useState(true);

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

  function handleClick() {
    if (atBottom) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
    }
  }

  if (!show) return null;

  return (
    <button
      className="scroll-fab fancy-fab"
      onClick={handleClick}
      aria-label={atBottom ? "Scroll to top" : "Scroll to bottom"}
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
  );
}
