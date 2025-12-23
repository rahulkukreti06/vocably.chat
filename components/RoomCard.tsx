import React, { useState, useEffect } from 'react';
import { FaUser, FaLock, FaGlobe, FaEllipsisV, FaFlag, FaShareAlt } from 'react-icons/fa';
import { ChevronDown } from 'lucide-react';
import { useSession } from 'next-auth/react';
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
  const { data: session, status } = useSession();
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
  const [isInterested, setIsInterested] = useState<boolean>(false);
  const [interestedUsers, setInterestedUsers] = useState<any[]>([]);
  const [showInterestedDropdown, setShowInterestedDropdown] = useState<boolean>(false);
  const [loadingInterests, setLoadingInterests] = useState<boolean>(false);
  const [joiningLocal, setJoiningLocal] = useState<boolean>(false);
  const joiningTimerRef = React.useRef<number | null>(null);
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
      // Close interested dropdown when clicking outside
      setShowInterestedDropdown(false);
    }

    if (menuOpen || showInterestedDropdown) {
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

  // Load interested users on mount for scheduled rooms
  useEffect(() => {
    if (notStarted && interestedCount > 0) {
      fetchInterestedUsers();
    }
  }, [room.id, notStarted]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (!target.closest('.interested-dropdown-container')) {
        setShowInterestedDropdown(false);
      }
    }

    if (showInterestedDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showInterestedDropdown]);

  // Load user's interest state when session becomes available
  useEffect(() => {
    if (status === 'authenticated' && session?.user && notStarted) {
      // Load interested users and check if current user is interested
      fetchInterestedUsers();
    }
  }, [status, session?.user, notStarted, room.id]);

  // Poll for interest updates for scheduled rooms (only when page is visible)
  useEffect(() => {
    if (!notStarted) return; // Only poll for scheduled rooms
    
    let pollInterval: NodeJS.Timeout;
    
    const startPolling = () => {
      pollInterval = setInterval(() => {
        if (status === 'authenticated' && !loadingInterests && !document.hidden) {
          fetchInterestedUsers();
        }
      }, 15000); // Poll every 15 seconds when page is visible
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (pollInterval) clearInterval(pollInterval);
      } else {
        // Page became visible, start polling and do immediate refresh
        if (status === 'authenticated' && !loadingInterests) {
          fetchInterestedUsers();
        }
        startPolling();
      }
    };

    // Start polling immediately
    startPolling();
    
    // Listen for page visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (pollInterval) clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [notStarted, status, loadingInterests]);

  // Listen for interest updates from other tabs/windows
  useEffect(() => {
    if (!notStarted) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `room-interest-update-${room.id}` && e.newValue) {
        // Another tab updated interest for this room, refresh our data
        setTimeout(() => fetchInterestedUsers(), 500); // Small delay to ensure server is updated
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [notStarted, room.id]);

  // Helper to get reporterId
  const getReporterId = () => {
    // Use NextAuth session first, then localStorage fallback
    if (session?.user?.name) {
      return session.user.name;
    }
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('userName') || 'Anonymous';
      } catch {}
    }
    return 'Anonymous';
  };

  // Helper to get current user identity (id, name, email, image) from NextAuth session or localStorage fallbacks
  const getCurrentUserIdentity = (): { id?: string | null; name?: string | null; email?: string | null; image?: string | null } => {
    const result: { id?: string | null; name?: string | null; email?: string | null; image?: string | null } = { id: null, name: null, email: null, image: null };
    
    // Don't proceed if session is still loading
    if (status === 'loading') {
      return result;
    }
    
    // First try NextAuth session
    if (session?.user) {
      result.id = session.user.id ? String(session.user.id) : result.id;
      result.name = session.user.name ? String(session.user.name) : result.name;
      result.email = session.user.email ? String(session.user.email) : result.email;
      result.image = session.user.image ? String(session.user.image) : result.image;
    }
    
    // Fallback to localStorage if no session data
    if (typeof window !== 'undefined') {
      try {
        if (!result.id) result.id = localStorage.getItem('userId') || localStorage.getItem('user_id') || result.id;
        if (!result.name) result.name = localStorage.getItem('userName') || localStorage.getItem('user_name') || result.name;
        if (!result.email) result.email = localStorage.getItem('userEmail') || localStorage.getItem('email') || result.email;
      } catch (e) {
        // ignore localStorage errors
      }
    }
    
    return result;
  };  // Helper to fetch interested users for this room
  const fetchInterestedUsers = async () => {
    if (loadingInterests) return;
    setLoadingInterests(true);
    try {
      const res = await fetch(`/api/room-interested-users?roomId=${encodeURIComponent(room.id)}`);
      if (res.ok) {
        const data = await res.json();
        setInterestedUsers(data.interests || []);
        setInterestedCount(data.count || 0);
        
        // Check if current user is in the list
        const currentUser = getCurrentUserIdentity();
        if (currentUser.id) {
          const userInterested = data.interests?.some((interest: any) => interest.user_id === currentUser.id);
          setIsInterested(!!userInterested);
        }
      }
    } catch (error) {
      console.error('Failed to fetch interested users:', error);
    } finally {
      setLoadingInterests(false);
    }
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
    if (isJoining || joiningLocal) return; // Prevent multiple clicks
    if (notStarted) {
      // optionally show an alert/toast here; keep simple alert to avoid adding dependencies
      alert('This room is scheduled to start later. You can join once it starts.');
      return;
    }
    // show immediate local joining state for 2s so UI reads 'Joining...'
    setJoiningLocal(true);
    // clear any existing timer
    if (joiningTimerRef.current) {
      window.clearTimeout(joiningTimerRef.current as any);
      joiningTimerRef.current = null;
    }
    joiningTimerRef.current = window.setTimeout(() => {
      setJoiningLocal(false);
      joiningTimerRef.current = null;
    }, 2000) as any;
      
    await onJoin(room);
    // Optimistically notify parent that a participant joined so UI updates immediately
    try {
      // Use the liveParticipantCount when available (avoid using stale room.participants)
      const current = typeof liveParticipantCount === 'number' ? liveParticipantCount : (room.participants || 0);
      if (onParticipantUpdate) onParticipantUpdate(room.id, current + 1);
    } catch {}
  };
    // cleanup join timer on unmount
  React.useEffect(() => {
    return () => {
      if (joiningTimerRef.current) {
        window.clearTimeout(joiningTimerRef.current as any);
        joiningTimerRef.current = null;
      }
    };
  }, []);

  // (interest toggle implemented later, below)

  // No localStorage handling for interest anymore.
  // isInterested remains a transient in-memory flag to avoid double-clicking.

  // Now, a click always attempts to increment the server-side count (interested: true).
  // We use a transient flag to prevent duplicate clicks in the same session.
  const toggleInterested = async () => {
    // Wait for session to load
    if (status === 'loading') {
      return; // Don't do anything while session is loading
    }
    
    if (status === 'unauthenticated') {
      alert('Please sign in to show interest in this room.');
      return;
    }

    const currentUser = getCurrentUserIdentity();
    if (!currentUser.id) {
      alert('Please sign in to show interest in this room.');
      return;
    }

    const newInterestState = !isInterested;
    
    // Optimistic update
    setIsInterested(newInterestState);
    if (newInterestState) {
      setInterestedCount(c => c + 1);
    } else {
      setInterestedCount(c => Math.max(0, c - 1));
    }

    try {
      const res = await fetch('/api/room-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          roomId: room.id, 
          interested: newInterestState,
          userId: currentUser.id,
          userName: currentUser.name,
          userEmail: currentUser.email,
          userImage: currentUser.image
        }),
      });
      
      const data = await res.json();
      console.debug('room-interest: response', { status: res.status, ok: res.ok, body: data });

      if (!res.ok) {
        console.warn('room-interest: server error, reverting optimistic update', data);
        setIsInterested(!newInterestState);
        if (newInterestState) {
          setInterestedCount(c => Math.max(0, c - 1));
        } else {
          setInterestedCount(c => c + 1);
        }
        alert(data.error || 'Failed to update interest');
        return;
      }

      // Update with server response
      if (typeof data.interested_count === 'number') {
        setInterestedCount(data.interested_count);
      }
      if (typeof data.user_interested === 'boolean') {
        setIsInterested(data.user_interested);
      }

      // Always refresh the interested users list after successful toggle
      // This ensures the dropdown shows the most up-to-date list
      fetchInterestedUsers();

      // Notify other tabs/windows that this room's interest data has changed
      if (typeof window !== 'undefined') {
        localStorage.setItem(`room-interest-update-${room.id}`, Date.now().toString());
        // Remove the item immediately to allow future updates
        setTimeout(() => localStorage.removeItem(`room-interest-update-${room.id}`), 100);
      }
    } catch (err) {
      console.error('room-interest: fetch failed', err);
      // Revert optimistic update
      setIsInterested(!newInterestState);
      if (newInterestState) {
        setInterestedCount(c => Math.max(0, c - 1));
      } else {
        setInterestedCount(c => c + 1);
      }
      alert('Failed to update interest');
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
                const days = Math.floor(diff / 86400000);
                const hrs = Math.floor((diff % 86400000) / 3600000);
                const mins = Math.floor((diff % 3600000) / 60000);
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
                let timeRemaining: string;
                if (days > 0) {
                  timeRemaining = `${days}d ${hrs}h`;
                } else if (hrs > 0) {
                  timeRemaining = `${hrs}h ${mins}m`;
                } else {
                  // less than an hour: show minutes+seconds, and switch to seconds-only for the final minute
                  const secs = Math.max(0, Math.floor((diff % 60000) / 1000));
                  if (mins > 0) {
                    timeRemaining = `${mins}m ${secs}s`;
                  } else {
                    timeRemaining = `${secs}s`;
                  }
                }
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
                    Starts in {timeRemaining} • Starts at {formatted}
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
          // For scheduled rooms, show Interested button with integrated ChevronDown arrow
          <div style={{ position: 'relative' }}>
            <button
              onClick={toggleInterested}
              aria-pressed={isInterested}
              disabled={status === 'loading' || status === 'unauthenticated'}
              style={{
                fontSize: 15,
                padding: interestedCount > 0 && status === 'authenticated' ? '0.5rem 2.5rem 0.5rem 1.2rem' : '0.5rem 1.2rem',
                borderRadius: 8,
                color: isInterested ? '#10b981' : '#bdbdbd',
                background: isInterested ? 'rgba(16,185,129,0.12)' : 'transparent',
                border: isInterested ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(255,255,255,0.04)',
                fontWeight: 700,
                boxShadow: 'none',
                transition: 'background 0.18s, color 0.18s',
                outline: 'none',
                minWidth: 100,
                cursor: (status === 'loading' || status === 'unauthenticated') ? 'not-allowed' : 'pointer',
                opacity: (status === 'loading' || status === 'unauthenticated') ? 0.6 : 1
              }}
            >
              {status === 'loading' ? 'Loading...' : 
               status === 'unauthenticated' ? 'Sign in to show interest' :
               `Interested ${interestedCount > 0 ? `(${interestedCount})` : ''}`}
            </button>
            {interestedCount > 0 && status === 'authenticated' && (
              <>
                {/* Separator line */}
                <div style={{
                  position: 'absolute',
                  right: 40,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '1px',
                  height: '60%',
                  background: isInterested ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)',
                  zIndex: 1
                }} />
                <span 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowInterestedDropdown(!showInterestedDropdown);
                  }}
                  style={{
                    position: 'absolute',
                    right: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    zIndex: 2,
                    color: isInterested ? '#10b981' : '#bdbdbd',
                    cursor: 'pointer'
                  }}
                >
                  <ChevronDown size={16} />
                </span>
              </>
            )}
            {showInterestedDropdown && (interestedUsers.length > 0 || loadingInterests) && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                zIndex: 1000,
                background: '#1a1a1a',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                padding: 8,
                minWidth: 200,
                maxHeight: 200,
                overflowY: 'auto',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}>
                <div style={{ fontSize: 12, color: '#bdbdbd', marginBottom: 8, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  Interested Users ({interestedUsers.length})
                  {loadingInterests && (
                    <div className={styles.spinner} style={{
                      width: 10,
                      height: 10,
                      border: '1px solid #bdbdbd',
                      borderTop: '1px solid transparent',
                      borderRadius: '50%'
                    }} />
                  )}
                </div>
                {interestedUsers.map(user => (
                  <div key={user.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '4px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    {user.image ? (
                      <img 
                        src={user.image} 
                        alt={user.name || 'User'} 
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <div style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        background: '#666',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 10,
                        color: 'white'
                      }}>
                        {(user.name || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span style={{ fontSize: 13, color: '#ffffff' }}>
                      {user.name || 'Anonymous User'}
                    </span>
                  </div>
                ))}
                {!loadingInterests && interestedUsers.length === 0 && (
                  <div style={{ 
                    fontSize: 12, 
                    color: '#888', 
                    textAlign: 'center', 
                    padding: '8px 0',
                    fontStyle: 'italic'
                  }}>
                    No interested users yet
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <button
            className={styles['room-card__join-btn']}
            onClick={handleJoinClick}
            aria-label="Join Room"
            style={{ fontSize: 15, padding: '0.5rem 1.6rem', borderRadius: 8, color: '#ffd700', border: 'none', fontWeight: 700, boxShadow: 'none', transition: 'background 0.18s, color 0.18s', outline: 'none', minWidth: 100, opacity: (joiningLocal || isJoining) ? 0.7 : 1, pointerEvents: (joiningLocal || isJoining) ? 'none' : 'auto' }}
            disabled={isFull || joiningLocal || isJoining}
          >
            {(joiningLocal || isJoining) ? 'Joining...' : 'Join'}
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
