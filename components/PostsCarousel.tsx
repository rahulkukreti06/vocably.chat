"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";

export default function PostsCarousel() {
  const placeholders = [
    {
      href: "/blog/features",
      category: "Features",
      title: "Product features",
      excerpt: "Learn about Vocably features and how they help conversations.",
      imageSrc: "/product%20feature.avif",
    },
    {
      href: "/blog/how-it-works",
      category: "How it works",
      title: "How Vocably works",
      excerpt: "An overview of how to use Vocably and connect with people.",
      imageSrc: "/how-it-works.jpg",
    },
    {
      href: "/blog/about",
      category: "About",
      title: "About Vocably",
      excerpt: "Our story and mission — why we built Vocably.",
      imageSrc: "/about-us.jpg",
    },
  ];

  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);

  const updateActiveFromScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const cards = Array.from(el.querySelectorAll<HTMLElement>(".posts-card"));
    if (!cards.length) return;
    const scrollerRect = el.getBoundingClientRect();
    const scrollerCenter = scrollerRect.left + scrollerRect.width / 2;

    let bestIndex = 0;
    let bestDist = Infinity;
    cards.forEach((c, idx) => {
      const r = c.getBoundingClientRect();
      const cardCenter = r.left + r.width / 2;
      const dist = Math.abs(cardCenter - scrollerCenter);
      if (dist < bestDist) {
        bestDist = dist;
        bestIndex = idx;
      }
    });
    setActive(bestIndex);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => updateActiveFromScroll());
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    // ensure initial state
    updateActiveFromScroll();
    const onResize = () => updateActiveFromScroll();
    window.addEventListener("resize", onResize);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [updateActiveFromScroll]);

  const scrollToIndex = (i: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const cards = Array.from(el.querySelectorAll<HTMLElement>(".posts-card"));
    const target = cards[i];
    if (!target) return;
    // account for scroller padding (16px left)
    const leftPadding = 16;
    el.scrollTo({ left: Math.max(0, target.offsetLeft - leftPadding), behavior: "smooth" });
  };

  return (
      <div>
      {/* small-screen-only horizontal swipeable placeholder carousel */}
      {/* Use dangerouslySetInnerHTML so the exact CSS string is used during hydration and avoids server/client text escaping differences */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .posts-carousel{ display:none }
        @media (max-width:640px){
          .posts-carousel{ display:block; padding: 12px 0 22px; }
          /* container holds the scroller; add horizontal padding so cards don't stick to edges */
          .posts-carousel-inner{ display:flex; gap:12px; overflow-x:auto; padding:0 16px; scroll-snap-type:x mandatory; -webkit-overflow-scrolling:touch; scroll-padding:16px; overscroll-behavior-x:contain }

          /* hide native scrollbars */
          .posts-carousel-inner{ -ms-overflow-style: none; scrollbar-width: none }
          .posts-carousel-inner::-webkit-scrollbar{ display: none }

          /* each card is effectively full width minus container padding so one shows at a time */
          .posts-card{ flex:0 0 calc(100% - 32px); max-width: calc(100% - 32px); background:#fff; border-radius:10px; box-shadow:0 6px 18px rgba(2,6,23,0.06); scroll-snap-align:start; scroll-snap-stop:always; overflow:hidden }

          .posts-card-media{ height:160px; background:linear-gradient(180deg,#f8fafc,#eef2ff); display:block }
          .posts-card-body{ padding:14px 14px 18px }
          .posts-card-category{ font-size:11px; color:#6b7280; font-weight:700; text-transform:uppercase; margin-bottom:6px }
          .posts-card-title{ font-weight:800; font-size:16px; margin:0 0 8px; color:#071025 }
          .posts-card-excerpt{ color:#475569; font-size:13px; margin:0 }

          /* pagination hint centered under the carousel */
          .posts-carousel-pager{ display:flex; justify-content:center; gap:10px; margin-top:12px }
          /* outer light ring with optional inner dot for visibility on white backgrounds */
          .pager-dot{ width:14px; height:14px; border-radius:99px; background:#eef3fb; opacity:0.95; position:relative; transition: transform .18s ease, box-shadow .18s ease }
          .pager-dot::after{ content:''; position:absolute; left:50%; top:50%; transform:translate(-50%,-50%) scale(0); width:8px; height:8px; border-radius:99px; background:transparent; transition: transform .18s ease, background .18s ease }
          .pager-dot[aria-current="true"]{ transform: scale(1.06); box-shadow: 0 4px 10px rgba(7,16,37,0.08) }
          .pager-dot[aria-current="true"]::after{ transform:translate(-50%,-50%) scale(1); background:#000 }
        }
      `,
        }}
      />

      <div className="posts-carousel" aria-hidden={false}>
        <div className="posts-carousel-inner" role="list" ref={scrollerRef}>
          {placeholders.map((item, idx) => (
            <article key={`${item.href}-${idx}`} className="posts-card" role="listitem">
              <Link href={item.href} style={{ color: "inherit", textDecoration: "none", display: "block" }} aria-label={`${item.title} — ${item.excerpt}`}>
                <div
                  className="posts-card-media"
                  aria-hidden="true"
                  style={
                    item.imageSrc
                      ? { backgroundImage: `url(${item.imageSrc})`, backgroundSize: "cover", backgroundPosition: "center" }
                      : undefined
                  }
                />
                <div className="posts-card-body">
                  {item.category ? <div className="posts-card-category">{item.category}</div> : null}
                  <h4 className="posts-card-title">{item.title}</h4>
                  <p className="posts-card-excerpt">{item.excerpt}</p>
                </div>
              </Link>
            </article>
          ))}
        </div>
        <div className="posts-carousel-pager" aria-hidden={false} role="tablist" aria-label="Carousel pagination">
          {placeholders.map((_, i) => (
            <button
              key={i}
              className="pager-dot"
              aria-label={`Go to slide ${i + 1}`}
              aria-current={active === i}
              onClick={() => scrollToIndex(i)}
              style={{ border: "none", padding: 0, background: "transparent", cursor: "pointer" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
