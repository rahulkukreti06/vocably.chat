import React, { useEffect, useRef, useState } from 'react';

interface RoomMini {
  id: string;
  name: string;
  topic?: string | null;
  created_by_name?: string | null;
  created_by_image?: string | null;
  participants?: number;
  max_participants?: number;
}

export default function ExploreRoomCard({ room, onJoin }: { room: RoomMini; onJoin: (r: RoomMini) => void }) {
  const visitorsLabel = (n?: number) => {
    if (!n) return '0 visitors';
    if (n >= 1000000) return `${Math.round(n / 1000000)}M weekly visitors`;
    if (n >= 1000) return `${Math.round(n / 1000)}K weekly visitors`;
    return `${n} visitors`;
  };

  const titleContainerRef = useRef<HTMLDivElement | null>(null);
  const titleInnerRef = useRef<HTMLDivElement | null>(null);
  const [titleOverflow, setTitleOverflow] = useState(false);

  useEffect(() => {
    function measure() {
      const container = titleContainerRef.current;
      const inner = titleInnerRef.current;
      if (!container || !inner) return setTitleOverflow(false);
      const overflowAmount = inner.scrollWidth - container.clientWidth;
      if (overflowAmount > 2) {
        inner.style.setProperty('--marquee-offset', `${overflowAmount}px`);
        const duration = Math.max(6, Math.min(25, overflowAmount / 30));
        inner.style.setProperty('--marquee-duration', `${duration}s`);
        setTitleOverflow(true);
      } else {
        setTitleOverflow(false);
        inner.style.removeProperty('--marquee-offset');
        inner.style.removeProperty('--marquee-duration');
      }
    }
    measure();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
  }, [room.name]);

  return (
    <div style={{ background: '#0b1220', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 12, padding: 10, display: 'flex', gap: 12, alignItems: 'flex-start', minHeight: 76 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, overflow: 'hidden', background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff' }}>
          {room.created_by_image ? <img src={room.created_by_image} alt={room.created_by_name || 'host'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (room.created_by_name ? room.created_by_name[0].toUpperCase() : 'U')}
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: '#9ca3af', fontSize: 13, marginBottom: 6 }}>{room.topic || 'General'}</div>
            <div ref={titleContainerRef} style={{ overflow: 'hidden', marginBottom: 4 }} title={room.name}>
              <div
                ref={titleInnerRef}
                style={{
                  color: '#fff',
                  fontSize: 18,
                  fontWeight: 700,
                  display: 'inline-block',
                  whiteSpace: 'nowrap',
                  willChange: 'transform',
                  ...(titleOverflow ? { animation: 'exploreMarquee var(--marquee-duration) linear infinite' } : {})
                }}
              >
                {room.name}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '0 0 auto', minWidth: 72, justifyContent: 'flex-end' }}>
            <button onClick={() => onJoin(room)} style={{ background: '#0f1724', color: '#e6eef8', border: '1px solid rgba(255,255,255,0.06)', padding: '6px 10px', borderRadius: 18, fontWeight: 700, cursor: 'pointer' }}>Join</button>
          </div>
        </div>

        <div style={{ color: '#9ca3af', fontSize: 13, marginTop: 6, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {room.created_by_name ? `Started by ${room.created_by_name}` : 'Started by unknown'} • {visitorsLabel(room.participants)}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes exploreMarquee { from { transform: translateX(0); } to { transform: translateX(calc(-1 * var(--marquee-offset))); } }
        .titleMarquee { animation: exploreMarquee var(--marquee-duration) linear infinite; }
      ` }} />
    </div>
  );
}
