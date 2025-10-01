import React, { useState, useEffect } from 'react';
import { FaUser, FaLock, FaGlobe, FaEllipsisV, FaFlag, FaShareAlt } from 'react-icons/fa';
import styles from '../styles/RoomCard.module.css';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface RoomCardProps {
  room: {
    id: string;
    name: string;
    created_at: string; // changed from number to string for compatibility
    participants: number;
    max_participants: number;
    language: string;
    language_level: 'beginner' | 'intermediate' | 'advanced';
    is_public: boolean;
    password?: string;
    created_by: string;
    created_by_name?: string; // Added for creator's display name
    created_by_image?: string | null; // Add for Google profile image
    topic?: string;
    tags?: string[];
  expires_at?: string | null;
  scheduled_at?: string | null;
  interested_count?: number;
  };
  onJoin: (room: any) => void;
  onRemoveRoom?: (roomId: string) => void;
  onParticipantUpdate?: (roomId: string, participantCount: number) => void;
  liveParticipantCount?: number; // <-- add this prop
  isJoining?: boolean;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, onJoin, onRemoveRoom, onParticipantUpdate, liveParticipantCount, isJoining = false }) => {
  // Always use liveParticipantCount for all logic and display
  const participantCount = typeof liveParticipantCount === 'number' ? liveParticipantCount : room.participants;
  const isFull = participantCount >= room.max_participants;

  const [menuOpen, setMenuOpen] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [expired, setExpired] = useState(false);
  const [startsAt, setStartsAt] = useState<number | null>(null);
  const [notStarted, setNotStarted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showCreatedFull, setShowCreatedFull] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [topicHover, setTopicHover] = useState(false);
  const [topicClicked, setTopicClicked] = useState(false);
  const [interestedCount, setInterestedCount] = useState<number>(room.interested_count ?? 0);
  // Do not persist per-user interest in localStorage anymore.
  // `isInterested` is a local/session guard to prevent duplicate clicks; not saved to storage.
  const [isInterested, setIsInterested] = useState<boolean>(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const topicRef = React.useRef<HTMLSpanElement | null>(null);
  const titleContainerRef = React.useRef<HTMLDivElement | null>(null);
  const titleInnerRef = React.useRef<HTMLDivElement | null>(null);
  const [titleOverflow, setTitleOverflow] = useState(false);

  // Removed debug console.log for production

  // Close menu when clicking outside
  React.useEffect(() => {
    let interval: any;
    if (room.expires_at) {
      interval = setInterval(() => setNow(Date.now()), 1000);
      const expiresAt = new Date(room.expires_at).getTime();
      if (Date.now() >= expiresAt) setExpired(true);
    }
    // scheduled start handling
    if (room['scheduled_at']) {
      try {
        const s = new Date(room['scheduled_at']).getTime();
        setStartsAt(s);
        if (Date.now() < s) setNotStarted(true);
        // ensure we tick every second for countdown
        if (!interval) interval = setInterval(() => setNow(Date.now()), 1000);
      } catch {}
    }
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
  if (interval) clearInterval(interval);
    };
  }, [menuOpen]);

  // Measure title overflow and enable marquee if needed
  useEffect(() => {
    function measure() {
      const container = titleContainerRef.current;
      const inner = titleInnerRef.current;
      if (!container || !inner) return setTitleOverflow(false);
      const overflowAmount = inner.scrollWidth - container.clientWidth;
      if (overflowAmount > 2) {
        // set CSS variables for animation distance and duration
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

  // Detect small screens so we can change tap behavior on mobile
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 640px)');
    const update = () => setIsMobile(!!mq.matches);
    update();
    if (mq.addEventListener) mq.addEventListener('change', update);
    else mq.addListener(update);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', update);
      else mq.removeListener(update);
    };
  }, []);

  // Close topic tooltip when clicking outside
  React.useEffect(() => {
    function handleDocClick(e: MouseEvent) {
      const target = e.target as Node;
      if (topicClicked) {
        if (topicRef.current && !topicRef.current.contains(target)) {
          setTopicClicked(false);
          setTopicHover(false);
        }
      }
    }
    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, [topicClicked]);

  // Auto-remove when expired: call onRemoveRoom if provided and mark expired
  React.useEffect(() => {
    if (!room.expires_at) return;
    const expiresAt = new Date(room.expires_at).getTime();
    if (Date.now() >= expiresAt) {
      setExpired(true);
      if (onRemoveRoom) onRemoveRoom(room.id);
      return;
    }
    const to = setTimeout(() => {
      setExpired(true);
      if (onRemoveRoom) onRemoveRoom(room.id);
    }, expiresAt - Date.now());
    return () => clearTimeout(to);
  }, [room.expires_at, onRemoveRoom, room.id]);

  // Monitor scheduled start to flip notStarted when time arrives
  useEffect(() => {
    if (!room['scheduled_at']) {
      setNotStarted(false);
      setStartsAt(null);
      return;
    }
    const s = new Date(room['scheduled_at']).getTime();
    setStartsAt(s);
    if (Date.now() < s) setNotStarted(true);
    const to = setTimeout(() => setNotStarted(false), Math.max(0, s - Date.now()));
    return () => clearTimeout(to);
  }, [room['scheduled_at']]);

  // Helper to get reporterId
  const getReporterId = () => {
    // Use session user name if available, fallback to localStorage, then 'Anonymous'
    if (typeof window !== 'undefined') {
      try {
        const session = JSON.parse(window.sessionStorage.getItem('nextauth.session') || '{}');
        if (session?.user?.name) return session.user.name;
      } catch {}
      return localStorage.getItem('userName') || 'Anonymous';
    }
    return 'Anonymous';
  };

  const handleReport = async () => {
    setReporting(true);
    setMenuOpen(false);
    try {
      const res = await fetch('/api/report-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: room.id,
          reporterId: getReporterId(),
          ownerId: room.created_by,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.shouldDelete) {
          // Remove from Supabase instead of localStorage
          // (Assume backend or admin will handle actual deletion)
          // Optionally, you can call a Supabase delete here if needed
          if (onRemoveRoom) onRemoveRoom(room.id);
        } else {
          alert(`Room reported. Current report count: ${data.count}/5`);
        }
      } else {
        alert(data.error || 'Failed to report room.');
      }
    } catch (err) {
      alert('Failed to report room.');
    } finally {
      setReporting(false);
    }
  };

  const handleShare = async () => {
    // share or copy the room link
    setSharing(true);
    setMenuOpen(false);
    try {
      if (typeof window === 'undefined') throw new Error('No window');
      const url = `${window.location.origin}/rooms/${room.id}`;
      // Try native share first
      if (navigator && (navigator as any).share) {
        try {
          await (navigator as any).share({
            title: room.name || 'Join room',
            text: `Join the room ${room.name}`,
            url,
          });
          return;
        } catch (err) {
          // If user cancels share or it fails, fall back to clipboard
          console.debug('native share failed or cancelled', err);
        }
      }

      // Fallback: copy to clipboard
      if (navigator && (navigator as any).clipboard && (navigator as any).clipboard.writeText) {
        await (navigator as any).clipboard.writeText(url);
        alert('Room link copied to clipboard');
      } else {
        // last resort: prompt with the link so user can copy manually
        window.prompt('Copy this link to share the room', url);
      }
    } catch (err) {
      console.error('Failed to share/copy room link', err);
      try {
        if (typeof window !== 'undefined') window.prompt('Copy this link to share the room', `${window.location.origin}/rooms/${room.id}`);
      } catch {}
    } finally {
      setSharing(false);
    }
  };

  const handleJoinClick = async () => {
    if (isJoining) return; // Prevent multiple clicks
    if (notStarted) {
      // optionally show an alert/toast here; keep simple alert to avoid adding dependencies
      alert('This room is scheduled to start later. You can join once it starts.');
      return;
    }
    await onJoin(room);
    // Optimistically notify parent that a participant joined so UI updates immediately
    try {
      // Use the liveParticipantCount when available (avoid using stale room.participants)
      const current = typeof liveParticipantCount === 'number' ? liveParticipantCount : (room.participants || 0);
      if (onParticipantUpdate) onParticipantUpdate(room.id, current + 1);
    } catch {}
  };

  // (interest toggle implemented later, below)

  // No localStorage handling for interest anymore.
  // isInterested remains a transient in-memory flag to avoid double-clicking.

  // Now, a click always attempts to increment the server-side count (interested: true).
  // We use a transient flag to prevent duplicate clicks in the same session.
  const toggleInterested = async () => {
    if (isInterested) return; // already clicked in this session
    setIsInterested(true);
    // optimistic increment
    setInterestedCount(c => Math.max(0, c + 1));

    try {
      const res = await fetch('/api/room-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: room.id, interested: true }),
      });
      let data: any = null;
      try { data = await res.json(); } catch (e) { console.debug('room-interest: non-json response', e); }
      console.debug('room-interest: response', { status: res.status, ok: res.ok, body: data });

      if (!res.ok) {
        console.warn('room-interest: server error, reverting optimistic update', data);
        setIsInterested(false);
        setInterestedCount(c => Math.max(0, c - 1));
        return;
      }

      if (data && typeof data.interested_count === 'number') {
        setInterestedCount(Math.max(0, data.interested_count));
      } else if (data && data.persisted === false) {
        console.info('room-interest: not persisted on server (persisted=false). Ensure SUPABASE_SERVICE_ROLE_KEY is set on server.');
        // revert optimistic since server didn't persist
        setIsInterested(false);
        setInterestedCount(c => Math.max(0, c - 1));
      }
    } catch (err) {
      console.error('room-interest: fetch failed', err);
      setIsInterested(false);
      setInterestedCount(c => Math.max(0, c - 1));
    }
  };

  return (
    <>
    <div className={styles['room-card'] + ' room-card'} tabIndex={0} aria-label={`Room card for ${room.name}`} role="region" style={{ position: 'relative' }}>
      {/* Three-dot menu in top right */}
      <div ref={menuRef} className={styles.menuWrapper}>
        <button
          aria-label="Room settings"
          className={styles.menuTrigger}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <FaEllipsisV />
        </button>
        {menuOpen && (
          <div className={styles.menu} role="menu">
            <button
              onClick={handleShare}
              disabled={sharing}
              className={styles.menuItem}
              role="menuitem"
              aria-disabled={sharing}
            >
              <FaShareAlt className={styles.menuIcon} />
              <span>Share Room</span>
            </button>
            <button
              onClick={handleReport}
              disabled={reporting}
              className={`${styles.menuItem} ${styles.report}`}
              role="menuitem"
              aria-disabled={reporting}
            >
              <FaFlag className={styles.menuIcon} />
              <span>Report Room</span>
            </button>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
        <div
          className={styles['room-card__host-avatar']}
          style={{ minWidth: 44, minHeight: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20, color: '#fff', overflow: 'hidden', background: '#23272f' }}
        >
          {room.created_by_image ? (
            <Avatar style={{ width: 44, height: 44 }}>
              <AvatarImage src={room.created_by_image} alt={room.created_by_name || room.created_by || 'User'} />
              <AvatarFallback>{(room.created_by_name && room.created_by_name.length > 0) ? room.created_by_name[0].toUpperCase() : (room.created_by && room.created_by.length > 0 ? room.created_by[0].toUpperCase() : <FaUser />)}</AvatarFallback>
            </Avatar>
          ) : (
            (room.created_by_name && room.created_by_name.length > 0) ? room.created_by_name[0].toUpperCase() : (room.created_by && room.created_by.length > 0 ? room.created_by[0].toUpperCase() : <FaUser />)
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div className={styles['room-card__title-container']} ref={titleContainerRef} style={{ marginBottom: 2 }}>
            <div
              ref={titleInnerRef}
              className={`${styles['room-card__title-inner']} ${titleOverflow ? styles['titleMarquee'] : ''}`}
              style={{ fontWeight: 700, fontSize: 20, color: '#fff' }}
              aria-label={room.name}
              title={room.name}
            >
              {room.name}
            </div>
          </div>
          <div style={{ color: '#bdbdbd', fontSize: 14, marginBottom: 8, position: 'relative' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', minWidth: 0, maxWidth: '100%' }}>
              <span
                style={{ cursor: 'pointer', flex: '0 0 auto' }}
                title={room.created_by_name || room.created_by}
                onClick={e => {
                  // On mobile, show the full created timestamp and temporarily hide expiry
                  if (isMobile) {
                    setShowCreatedFull(true);
                    setTimeout(() => setShowCreatedFull(false), 1000);
                    return;
                  }
                  const target = e.currentTarget;
                  target.innerText = room.created_by_name || room.created_by;
                  setTimeout(() => {
                    target.innerText = (room.created_by_name || room.created_by).split(' ')[0];
                  }, 2000);
                }}
              >
                {(room.created_by_name || room.created_by).split(' ')[0]}
              </span>
              <span style={{ margin: '0 1px', color: '#bdbdbd', flex: '0 0 auto' }}>&bull;</span>
              {
                (() => {
                  const fullTopic = room.topic && room.topic.trim() !== '' ? room.topic.trim() : 'General Discussion';
                  const words = fullTopic.split(/\s+/);
                  const maxWords = 6;
                  const shouldTruncate = words.length > maxWords;
                  const displayTopic = shouldTruncate ? words.slice(0, maxWords).join(' ') + '...' : fullTopic;
                  return (
                    <span ref={topicRef} style={{ position: 'relative', display: 'inline-flex', flex: '1 1 auto', minWidth: 0 }}>
                      <span
                        onMouseEnter={() => setTopicHover(true)}
                        onMouseLeave={() => setTopicHover(false)}
                        onClick={() => setTopicClicked(v => !v)}
                        style={{ cursor: shouldTruncate ? 'pointer' : 'default', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', minWidth: 0 }}
                        aria-label={shouldTruncate ? 'Show full topic' : 'Topic'}
                      >
                        {displayTopic}
                      </span>
                      {(topicHover || topicClicked) && shouldTruncate && (
                        <div
                          role="tooltip"
                          style={{
                            position: 'absolute',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            top: -44,
                            minWidth: 260,
                            maxWidth: 640,
                            background: '#ffffff',
                            color: '#0b1220',
                            padding: '8px 12px',
                            borderRadius: 8,
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 6px 20px rgba(2,6,23,0.08)',
                            zIndex: 40,
                            fontSize: 13,
                            textAlign: 'center',
                            pointerEvents: 'auto'
                          }}
                          onMouseEnter={() => setTopicHover(true)}
                          onMouseLeave={() => setTopicHover(false)}
                        >
                          {fullTopic}
                        </div>
                      )}
                    </span>
                  );
                })()
              }
            </span>
          </div>
          <div className="badge-container" style={{ display: 'flex', gap: 7, marginBottom: 6 }}>
            <span className={styles['room-card__badge']} style={{ background: '#ffd70022', color: '#ffd700', borderRadius: 7, padding: '2.5px 10px', fontSize: 13, fontWeight: 600 }}>
              {room.language_level.charAt(0).toUpperCase() + room.language_level.slice(1)}
            </span>
            <span className={styles['room-card__badge']} style={{ background: '#23272f', color: '#ffd700', borderRadius: 7, padding: '2.5px 10px', fontSize: 13, fontWeight: 600, border: '1.5px solid #ffd70044' }}>
              {room.language.toUpperCase()}
            </span>
            <span className={styles['room-card__badge']} style={{ background: room.is_public ? '#10b98122' : '#ff4d4f22', color: room.is_public ? '#10b981' : '#ff4d4f', borderRadius: 7, padding: '2.5px 10px', fontSize: 13, fontWeight: 600, border: room.is_public ? '1.5px solid #10b98144' : '1.5px solid #ff4d4f44', display: 'flex', alignItems: 'center', gap: 5 }}>
              {room.is_public ? <FaGlobe style={{ marginRight: 4 }} /> : <FaLock style={{ marginRight: 4 }} />} {room.is_public ? 'Public' : 'Private'}
            </span>
          </div>
        
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 6, color: '#bdbdbd', fontSize: 13, marginBottom: 8, flexWrap: 'nowrap' }}>
            {startsAt && notStarted ? (
              (() => {
                const diff = Math.max(0, startsAt - now);
                const hrs = Math.floor(diff / 3600000);
                const mins = Math.floor((diff % 3600000) / 60000);
                const secs = Math.floor((diff % 60000) / 1000);
                const dt = new Date(startsAt);
                const pad = (n: number) => n.toString().padStart(2, '0');
                const month = dt.getMonth() + 1;
                const day = dt.getDate();
                const year = dt.getFullYear();
                let hours = dt.getHours();
                const minutes = pad(dt.getMinutes());
                const seconds = pad(dt.getSeconds());
                const ampm = hours >= 12 ? 'PM' : 'AM';
                hours = hours % 12 || 12;
                const formatted = `${month}/${day}/${year}, ${hours}:${minutes}:${seconds} ${ampm}`;
                return (
                  <span
                    style={{
                      color: '#f59e0b',
                      fontSize: isMobile ? 12 : 13,
                      fontWeight: 700,
                      whiteSpace: isMobile ? 'normal' : 'nowrap',
                      display: 'inline-block',
                      flex: isMobile ? '1 1 auto' : '0 0 auto',
                      wordBreak: isMobile ? 'break-word' : 'normal'
                    }}
                    title={`Starts at ${new Date(startsAt).toLocaleString()}`}
                  >
                    Starts in {hrs > 0 ? `${hrs}h ` : ''}{mins}m {secs}s • Starts at {formatted}
                  </span>
                );
              })()
            ) : (
              <>
                <span
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'block',
                    // On mobile allow the span to grow; on desktop prevent it from taking remaining space so Expires stays close
                    flex: isMobile ? '1 1 auto' : '0 1 auto',
                    minWidth: 0,
                    maxWidth: isMobile ? '100%' : '70%',
                    cursor: isMobile ? 'pointer' : 'default'
                  }}
                  onClick={() => {
                    if (!isMobile) return;
                    setShowCreatedFull(true);
                    setTimeout(() => setShowCreatedFull(false), 1000);
                  }}
                >
                  {
                    (() => {
                      const createdDate = new Date(room.created_at);
                      const full = createdDate.toLocaleString();
                      const short = createdDate.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
                      return `Created ${showCreatedFull ? full : short}`;
                    })()
                  }
                </span>
                {room.expires_at && !expired && !showCreatedFull && (
                  (() => {
                    const diff = Math.max(0, new Date(room.expires_at).getTime() - now);
                    const mins = Math.floor(diff / 60000);
                    const secs = Math.floor((diff % 60000) / 1000);
                    return (
                      <span style={{ color: '#ffcc66', fontSize: 13, fontWeight: 700, flex: '0 0 auto', whiteSpace: 'nowrap' }} title={`Expires at ${new Date(room.expires_at).toLocaleString()}`}>
                        • Expires in {mins}m {secs}s
                      </span>
                    );
                  })()
                )}
                {room.expires_at && expired && (
                  <span style={{ color: '#ff6b6b', fontSize: 13, fontWeight: 700, flex: '0 0 auto', whiteSpace: 'nowrap' }}>• Expired</span>
                )}
              </>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: 70 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <div style={{ background: '#191b20', borderRadius: 8, padding: '4px 10px', color: '#10b981', fontWeight: 700, fontSize: 14, minWidth: 44, textAlign: 'center' }}>{Math.min(participantCount, room.max_participants)}/{room.max_participants}</div>
          </div>
          <div style={{ width: 54, height: 6, background: '#23272f', borderRadius: 6, overflow: 'hidden', marginBottom: 8 }}>
            <div style={{ width: `${Math.min(100, Math.round((participantCount / room.max_participants) * 100))}%`, height: '100%', background: 'linear-gradient(90deg, #10b981 0%, #ffd700 100%)', borderRadius: 6 }}></div>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
        {isFull ? (
          <span style={{ fontSize: 15, padding: '0.5rem 1.6rem', borderRadius: 8, color: '#ff4d4f', fontWeight: 700, minWidth: 100, textAlign: 'center' }}>Room Full</span>
        ) : notStarted ? (
          // For scheduled rooms, show Interested button on the left (styled same as right-side control)
          <button
            onClick={toggleInterested}
            aria-pressed={isInterested}
            style={{
              fontSize: 15,
              padding: '0.5rem 1.2rem',
              borderRadius: 8,
              color: isInterested ? '#10b981' : '#bdbdbd',
              background: isInterested ? 'rgba(16,185,129,0.12)' : 'transparent',
              border: isInterested ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(255,255,255,0.04)',
              fontWeight: 700,
              boxShadow: 'none',
              transition: 'background 0.18s, color 0.18s',
              outline: 'none',
              minWidth: 100,
              cursor: 'pointer'
            }}
          >
            Interested {interestedCount > 0 ? `(${interestedCount})` : ''}
          </button>
        ) : (
          <button
            className={styles['room-card__join-btn']}
            onClick={handleJoinClick}
            aria-label="Join Room"
            style={{ fontSize: 15, padding: '0.5rem 1.6rem', borderRadius: 8, color: '#ffd700', border: 'none', fontWeight: 700, boxShadow: 'none', transition: 'background 0.18s, color 0.18s', outline: 'none', minWidth: 100, opacity: isJoining ? 0.7 : 1, pointerEvents: isJoining ? 'none' : 'auto' }}
            disabled={isFull || isJoining}
          >
            {isJoining ? 'Joining...' : 'Join'}
          </button>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          {/* If scheduled and not started, show clock; if expired show expired; else show active */}
          {notStarted ? (
            <>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b', display: 'inline-block', marginRight: 4 }}></span>
              <span style={{ color: '#f59e0b', fontSize: 14 }}>Scheduled</span>
              {/* right-side Interested button removed; left-side control handles interest */}
            </>
          ) : expired ? (
            <>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff6b6b', display: 'inline-block', marginRight: 4 }}></span>
              <span style={{ color: '#ff6b6b', fontSize: 14 }}>Expired</span>
            </>
          ) : (
            <>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', display: 'inline-block', marginRight: 4 }}></span>
              <span style={{ color: '#bdbdbd', fontSize: 14 }}>Active</span>
            </>
          )}
        </div>
        </div>

      {/* duplicate scheduled countdown removed; inline scheduled text is shown above in Created/Expires area */}
    </div>
    </>
  );
};

export default RoomCard;
