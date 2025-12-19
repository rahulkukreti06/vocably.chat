'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaUser, FaLock, FaComments, FaFilter, FaReddit } from 'react-icons/fa';
import { Plus } from 'lucide-react';
import { Header, SearchBar } from '../components/Header';
import { RoomList } from '../components/RoomList';
import { CreateRoomModal } from '../components/CreateRoomModal';
// import { UserProfile } from '../components/UserProfile';
import RoomCard from '../components/RoomCard';
import JoinRoomModal from '../components/JoinRoomModal';
import { useRouter } from 'next/navigation';
import { useLiveParticipantCounts } from '../hooks/useLiveParticipantCounts';
import BuyMeCoffee from '../components/BuyMeCoffee';
import { supabase } from '@/lib/supabaseClient';
import { useSession, signIn, signOut } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { ChevronDown } from "lucide-react";
import dynamic from 'next/dynamic';
import { WhatsAppCommunityModal } from '../components/WhatsAppCommunityModal';

const ScrollToTopBottomButton = dynamic(() => import('../components/ScrollToTopBottomButton'), { ssr: false });

interface Room {
  id: string;
  name: string;
  created_at: string; // changed from number to string (ISO)
  participants: number;
  max_participants: number;
  language: string;
  language_level: 'beginner' | 'intermediate' | 'advanced';
  is_public: boolean;
  password?: string;
  created_by: string;
  created_by_name?: string; // Make optional for compatibility
  created_by_image?: string | null; // Add this for Google profile image
  topic?: string;
  tags?: string[];
  expires_at?: string | null;
  scheduled_at?: string | null;
  interested_count?: number;
}

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

export default function Page() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  // const [showProfileModal, setShowProfileModal] = useState(false);
  // Handler to navigate to the new profile page for the current user
  const handleProfileClick = () => {
    if (session && session.user && session.user.name) {
      // Use username or fallback to user id if available
      const username = session.user.name.replace(/\s+/g, '').toLowerCase();
      router.push(`/profile/${username}`);
    } else if (session && session.user && session.user.email) {
      // fallback: use email prefix if username missing
      const emailPrefix = session.user.email.split('@')[0];
      router.push(`/profile/${emailPrefix}`);
    } else {
      // fallback: generic profile page
      router.push('/profile/unknown');
    }
  };
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joiningRoom, setJoiningRoom] = useState<Room | null>(null);
  const [isJoiningMap, setIsJoiningMap] = useState<{ [roomId: string]: boolean }>({});
  const [joinPasswordError, setJoinPasswordError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'alphabetical'>('newest');
  const [roomType, setRoomType] = useState<'all' | 'public' | 'private'>('all');
  const [availability, setAvailability] = useState<'all' | 'available' | 'full'>('all');

  const router = useRouter();
  const participantCounts = useLiveParticipantCounts(rooms);
  const isMobile = useMediaQuery('(max-width: 640px)');
  const { data: session } = useSession();

  // Show WhatsApp modal after 30 seconds
  // Automatic WhatsApp modal display removed to avoid unexpected popups.

  // Custom error modal for sign-in required
  const [showSignInError, setShowSignInError] = useState(false);
  const [signInErrorMessage, setSignInErrorMessage] = useState('');

  const showSignInModal = (message: string) => {
    setSignInErrorMessage(message);
    setShowSignInError(true);
  };

  // Shared responsive desktop action styles
  // Adjusted heights to 40px to match Buy Me Coffee button
  const desktopActionStyle = (bg: string, color: string, borderColor: string): React.CSSProperties => ({
    background: bg,
    color,
    border: `1.5px solid ${borderColor}`,
    borderRadius: 12,
    fontWeight: 700,
    fontSize: 15,
    boxShadow: `0 2px 10px 0 ${borderColor}33`,
    padding: '0 1rem',
    cursor: 'pointer',
    outline: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flex: '1 1 200px',
    minWidth: 150,
    maxWidth: 260,
    height: 40,
    minHeight: 40,
    justifyContent: 'center',
    transition: 'background 0.18s, color 0.18s, box-shadow 0.18s'
  });
  const desktopActionBlock: React.CSSProperties = {
    flex: '1 1 200px',
    minWidth: 150,
    maxWidth: 260,
    height: 40,
    minHeight: 40,
    display: 'flex'
  };
  const desktopActionSelectBase: React.CSSProperties = {
    background: '#000',
    borderRadius: 12,
    fontWeight: 600,
    fontSize: 15,
    padding: '0 2.3rem 0 1.05rem',
    cursor: 'pointer',
    outline: 'none',
    width: '100%',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    height: '100%',
    lineHeight: '40px'
  };
  const chevronSpanStyle: React.CSSProperties = {
    position: 'absolute',
    right: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    zIndex: 2,
    color: '#ffd700'
  };

  // Fetch rooms from Supabase and subscribe to real-time changes
  useEffect(() => {
    let subscription: any;
    let pollTimer: any;
    // Firebase removed

    async function fetchRooms() {
      // Initial load (controls spinner)
      setRoomsLoading(true);
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        setRooms(data);
      }
      setRoomsLoading(false);
    }

    async function refreshRooms() {
      // Silent refresh (no spinner/flicker)
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        setRooms(prev => {
          // Avoid unnecessary re-renders if unchanged
          if (prev.length === data.length && prev.every((r, i) => r.id === data[i].id && r.participants === data[i].participants)) {
            return prev;
          }
          return data;
        });
      }
    }

    // Initial fetch
    fetchRooms();

    // Subscribe to real-time changes (silent refresh)
    subscription = supabase
      .channel('public:rooms')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => {
        refreshRooms();
      })
      .subscribe();

    // Fallback polling: keep room list in sync even if VPS WS is down
    pollTimer = setInterval(() => {
      refreshRooms();
    }, 5000);

    return () => {
      if (subscription) supabase.removeChannel(subscription);
      if (pollTimer) clearInterval(pollTimer);
    };
  }, []);

  // Listen for new room creation via WebSocket and update the room list in real-time
  useEffect(() => {
    const rawUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
    const wsUrl = rawUrl.replace(/\/+$/, '');
    const ws = new window.WebSocket(wsUrl);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'room_created' && data.room) {
          setRooms(prevRooms => {
            // Avoid duplicates
            if (prevRooms.some(r => r.id === data.room.id)) return prevRooms;
            return [data.room, ...prevRooms];
          });
        }
      } catch (e) {
        // Ignore parse errors
      }
    };
    return () => {
      ws.close();
    };
  }, []);

  const handleJoinRoom = async (room: Room) => {
    if (!session || !session.user) {
      showSignInModal('You must be signed in to join or create a room. Please sign in with your Google account to continue.');
      return;
    }
    setIsJoiningMap(prev => ({ ...prev, [room.id]: true }));
    // Use real participant count
    const realCount = participantCounts[room.id] ?? room.participants;
    if (!room.is_public) {
      // Only show join modal if password is set (not empty)
      if (room.password && room.password.length > 0) {
        setJoiningRoom(room);
        setShowJoinModal(true);
        setJoinPasswordError(null);
        setIsJoiningMap(prev => ({ ...prev, [room.id]: false }));
        return;
      } else {
        // If private but no password, allow join directly
        if (realCount >= room.max_participants) {
          alert('Room is full!');
          setIsJoiningMap(prev => ({ ...prev, [room.id]: false }));
          return;
        }
        try {
          router.push(`/rooms/${room.id}`); // Navigate directly, participant count tracked in Jitsi meeting
        } catch (err) {
          alert('Failed to join the room.');
          console.error(err);
        } finally {
          setIsJoiningMap(prev => ({ ...prev, [room.id]: false }));
        }
        return;
      }
    }
    // Public room: join instantly
    if (realCount >= room.max_participants) {
      alert('Room is full!');
      setIsJoiningMap(prev => ({ ...prev, [room.id]: false }));
      return;
    }
    // Navigate to room (participant count will be incremented when actually joining Jitsi meeting)
    try {
      router.push(`/rooms/${room.id}`);
    } catch (err) {
      alert('Failed to join the room.');
      console.error(err);
    } finally {
      setIsJoiningMap(prev => ({ ...prev, [room.id]: false }));
    }
  };

  // Update handleModalJoin to use per-room isJoiningMap
  const handleModalJoin = async (password?: string) => {
    if (!joiningRoom) return;
    setIsJoiningMap(prev => ({ ...prev, [joiningRoom.id]: true }));
    let passwordIncorrect = false;
    try {
      if (!joiningRoom.is_public && joiningRoom.password && joiningRoom.password !== password) {
        setJoinPasswordError('Incorrect password');
        setIsJoiningMap(prev => ({ ...prev, [joiningRoom.id]: false }));
        passwordIncorrect = true;
        return;
      }
      const realCount = participantCounts[joiningRoom.id] ?? joiningRoom.participants;
      if (realCount >= joiningRoom.max_participants) {
        alert('Room is full!');
      } else {
        router.push(`/rooms/${joiningRoom.id}`);
      }
    } catch (err) {
      alert('An error occurred while joining the room.');
      console.error(err);
    } finally {
      if (!passwordIncorrect) {
        setIsJoiningMap(prev => ({ ...prev, [joiningRoom.id]: false }));
        setShowJoinModal(false);
        setJoiningRoom(null);
        setJoinPasswordError(null);
      }
    }
  };

  const handleModalCancel = () => {
    setShowJoinModal(false);
    setJoiningRoom(null);
    setJoinPasswordError(null);
    if (joiningRoom) setIsJoiningMap(prev => ({ ...prev, [joiningRoom.id]: false }));
  };

  const handleCreateRoom = async (roomData: {
    name: string;
    language: string;
    language_level: 'beginner' | 'intermediate' | 'advanced';
    isPublic: boolean;
    password?: string;
    maxParticipants: number;
    topic?: string;
    tags: string[];
  expiresAfterMinutes?: number | null;
  scheduled_at?: string | null;
  }): Promise<boolean> => {
    if (!session || !session.user) {
      showSignInModal('You must be signed in to create a room. Please sign in with your Google account to continue.');
      return false;
    }
    if (!session.user.id) {
      showSignInModal('You must be signed in to create a room. Please sign in with your Google account to continue.');
      return false;
    }
    // Use only a real UUID for created_by
    let created_by = String(session.user.id).trim();
    
    const newRoom: Room = {
      id: crypto.randomUUID(),
      name: roomData.name,
      created_at: new Date().toISOString(), // Use ISO string for SQL timestamp
      participants: 0,
      max_participants: roomData.maxParticipants,
      language: roomData.language,
      language_level: roomData.language_level,
      is_public: roomData.isPublic,
      password: roomData.password ?? '', // default to empty string
      created_by: created_by, // always a UUID
      created_by_name: session.user.name || '', // store real name
      created_by_image: session.user.image || null, // store Google image
      topic: roomData.topic ?? '',       // default to empty string
      tags: roomData.tags ?? [],         // default to empty array
      // If expiresAfterMinutes was provided, compute ISO expiry timestamp
      expires_at: roomData.expiresAfterMinutes ? new Date(Date.now() + roomData.expiresAfterMinutes * 60000).toISOString() : null,
      // scheduled_at if provided (should be ISO string or null)
      scheduled_at: roomData.scheduled_at ?? null,
    };
    // Debug: log the newRoom object before inserting
    console.log('Creating new room:', newRoom);
    // Do NOT log secrets or environment keys to the client console.
    // Final fallback for created_by (should always be a UUID or a valid provider user ID)
    if (!newRoom.created_by || typeof newRoom.created_by !== 'string' || newRoom.created_by.length < 6) {
      showSignInModal('You must be signed in with a valid account to create a room. Please sign in with your Google account to continue.');
      return false;
    }
    console.log('Final newRoom object before insert:', newRoom);
    // Debug: log the newRoom object and created_by before inserting
    console.log('DEBUG: About to insert newRoom:', newRoom);
    console.log('DEBUG: newRoom.created_by value:', newRoom.created_by);

    // Minimal insert for debugging
    const minimalRoom = {
      id: newRoom.id,
      name: newRoom.name,
      created_at: newRoom.created_at, // now ISO string
      participants: newRoom.participants,
      max_participants: newRoom.max_participants,
      language: newRoom.language,
      language_level: newRoom.language_level,
      is_public: newRoom.is_public,
      password: newRoom.password, // <-- ensure password is included
      created_by: newRoom.created_by,
      created_by_name: newRoom.created_by_name,
      created_by_image: newRoom.created_by_image, // include image
      topic: newRoom.topic, // <-- ensure topic is included
  expires_at: newRoom.expires_at, // optional expiry
    } as any;
  // default interested count
  minimalRoom.interested_count = 0;

    // Only include scheduled_at in the DB payload if it's set. Some DBs/tables may not have this column yet.
    if (newRoom.scheduled_at) {
      minimalRoom.scheduled_at = newRoom.scheduled_at;
    }
    console.log('DEBUG: Minimal insert payload:', minimalRoom);

    // Stricter duplicate check: fetch existing room names and compare a normalized form
    // (trim, collapse whitespace, lowercase) to avoid accidental collisions like
    // extra spaces or different casing.
    try {
      const { data: existingRooms, error: fetchErr } = await supabase
        .from('rooms')
        .select('id, name');
      if (fetchErr) {
        console.error('Failed to fetch rooms for duplicate check:', fetchErr);
      } else if (existingRooms) {
        const normalize = (s: any) => String(s || '')
          .trim()
          .replace(/\s+/g, ' ')
          .toLowerCase();
        const target = normalize(roomData.name);
        const found = existingRooms.some((r: any) => normalize(r.name) === target);
        if (found) {
          toast.error('Room name already taken. Please choose a different name.');
          return false;
        }
      }
    } catch (err) {
      console.error('Error checking for duplicate room name:', err);
      // If the check fails for any reason, allow the insert to proceed and surface DB errors.
    }

    const { data, error } = await supabase.from('rooms').insert([minimalRoom]);
    console.log('Supabase insert result:', { data, error });
    if (error) {
      alert('Failed to create room: ' + error.message + '\n' + JSON.stringify(error, null, 2));
      return false;
    }
    setShowCreateModal(false);
    setRooms(prevRooms => [newRoom, ...prevRooms]);

    // If expires_at is set, schedule client-side removal when the time arrives
    if (newRoom.expires_at) {
      const expiresAt = new Date(newRoom.expires_at).getTime();
      const now = Date.now();
      const delay = Math.max(0, expiresAt - now);
      setTimeout(async () => {
        try {
          // attempt to delete from Supabase and then remove locally
          const { error: delErr } = await supabase.from('rooms').delete().eq('id', newRoom.id);
          if (delErr) {
            console.error('Failed to delete expired room from DB', delErr);
          }
        } catch (e) {
          console.error('Error deleting expired room:', e);
        }
        setRooms(prev => prev.filter(r => r.id !== newRoom.id));
      }, delay);
    }

    // Instantly join the newly created room unless it's scheduled
    if (!newRoom.scheduled_at) {
      router.push(`/rooms/${newRoom.id}`);
    } else {
      // For scheduled rooms, do not auto-join. Notify the creator instead.
      try {
        toast.success('Scheduled room created you can join when it starts.');
      } catch (e) {
        // fallback no-op if toast fails
      }
    }

  // Notify all clients via WebSocket (real-time update)
    try {
      const rawUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
      const wsUrl = rawUrl.replace(/\/+$/, '');
      const ws = new window.WebSocket(wsUrl);
      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'room_created', room: minimalRoom }));
        ws.close();
      };
    } catch (e) {
      console.error('Failed to notify WebSocket server about new room:', e);
    }

    return true;
  };

  // Merge real participant counts into rooms for display
  const roomsWithRealCounts = rooms.map(room => ({
    ...room,
    // Use the live count if available; otherwise keep the stored participants value
    participants: typeof participantCounts[room.id] === 'number' ? participantCounts[room.id] : room.participants,
    created_by_name: room.created_by_name || '', // always a string
    created_by_image: room.created_by_image || null, // always a string or null
  }));

  // Handle optimistic participant count updates from RoomCard
  const handleParticipantUpdate = (roomId: string, participantCount: number) => {
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, participants: participantCount } : r));
  };

  const handleRemoveRoom = async (roomId: string) => {
    try {
      // attempt to delete from DB
      const { error } = await supabase.from('rooms').delete().eq('id', roomId);
      if (error) console.error('Failed to delete room from DB', error);
    } catch (e) {
      console.error('Error deleting room:', e);
    }
    setRooms(prev => prev.filter(r => r.id !== roomId));
  };

  // Removed debug console logs for production

  // Remove theme state and logic
  // const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  // useEffect(() => { ... });

  const handleJoinRoomSync = (room: Room) => {
    // Just call the async handler, but don't await (RoomList expects sync)
    handleJoinRoom(room);
  };

  const [mobileProfileMenuOpen, setMobileProfileMenuOpen] = useState(false);

  // Close mobile dropdown on outside click
  useEffect(() => {
    if (!mobileProfileMenuOpen) return;
    function handleClick(e: MouseEvent) {
      const menu = document.getElementById('mobile-profile-dropdown');
      if (menu && !menu.contains(e.target as Node)) {
        setMobileProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [mobileProfileMenuOpen]);

  // Automatic WhatsApp modal display removed to avoid unexpected popups.

  return (
    <>
      <Header
        onCreateRoomClick={() => setShowCreateModal(true)}
        onProfileClick={handleProfileClick}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
  {/* Removed extra paddingTop here; root layout already adds top offset for fixed header */}
  <main className="vocably-landing-main" style={{ paddingTop: '4.3rem' }}>
        {/* ...existing code... */}
        {roomsLoading ? (
          <div className="loading-indicator">Loading rooms...</div>
        ) : rooms.length === 0 ? (
          <div
            style={{
              minHeight: '60vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: `'Inter', 'Segoe UI', Arial, sans-serif`,
              color: '#fff',
              textAlign: 'center',
              fontWeight: 600,
              fontSize: '2.1rem',
              letterSpacing: '0.01em',
              opacity: 0.92,
            }}
          >
            <span style={{ fontSize: '2.7rem', fontWeight: 800, marginBottom: 12, color: '#ffe066', fontFamily: 'inherit', display: 'block' }}>
              Welcome to Vocably
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 500, color: '#bdbdbd', marginBottom: 18, display: 'block' }}>
              There are no active rooms right now.<br />Be the first to create a new conversation!
            </span>
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '12px',
              margin: '18px auto 0',
              width: 'fit-content',
              maxWidth: '100%',
              padding: '0 16px',
              boxSizing: 'border-box'
            }}>
              <button
                className="btn btn--primary create-room-btn"
                style={{
                  fontSize: '14px',
                  fontWeight: 650,
                  padding: '0 1.2rem',
                  borderRadius: '12px',
                  background: 'linear-gradient(180deg, #ffe066, #ffd400)',
                  color: '#1d1d1d',
                  border: '1.4px solid #ffe066',
                  boxShadow: '0 2px 8px -2px rgba(0,0,0,0.45)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  whiteSpace: 'nowrap',
                  minWidth: '140px',
                  flexShrink: 0,
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                onClick={() => setShowCreateModal(true)}
              >
                + Create Room
              </button>
              <a
                href="https://www.buymeacoffee.com/rahulkukreti06"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none',
                  height: '40px',
                  minWidth: '140px',
                  width: 'auto',
                  flexShrink: 0,
                }}
              >
                <img 
                  src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" 
                  alt="Buy Me A Coffee" 
                  style={{ 
                    height: '100%',
                    width: '100%',
                    objectFit: 'contain',
                    borderRadius: '12px',
                    display: 'block'
                  }} 
                />
              </a>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop tagline above buttons */}
            {!isMobile && (
              <div
                style={{
                  margin: '2.4rem auto 2.6rem',
                  padding: '0px 2rem',
                  maxWidth: '820px',
                  fontSize: '1.55rem',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  lineHeight: 1.2,
                  textAlign: 'center',
                  color: 'rgb(255, 224, 102)',
                  fontFamily: 'cursive, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  textShadow: 'rgba(255, 224, 102, 0.15) 0px 0px 6px'
                }}
              >
                Talk about anything, with anyone, anywhere.
              </div>
            )}
            <div
              style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'unset',
                alignItems: isMobile ? 'stretch' : 'center',
                gap: isMobile ? '0.4rem' : '0.7rem',
                marginTop: isMobile ? '2.4rem' : '0.6rem',
                marginBottom: '1.05rem',
                flexWrap: isMobile ? 'nowrap' : 'nowrap',
                justifyContent: isMobile ? 'flex-start' : 'flex-start',
                position: 'relative',
                minHeight: 48,
                width: '100%',
              }}
            >
              {/* MOBILE: user/avatar row above tagline */}
              {isMobile && (
                <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', position: 'relative', marginTop: -22, marginBottom: 8, paddingRight: 0, marginRight: -6 }}>
                  {session ? (
                    <button
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4, background: 'none', color: '#ffe066', fontWeight: 400, fontSize: 13, cursor: 'pointer', borderRadius: 10, padding: '0.1rem 0.45rem', backdropFilter: 'blur(6px)', backgroundColor: 'rgba(16,16,20,0.35)'
                      }}
                      onClick={e => {
                        e.stopPropagation();
                        setMobileProfileMenuOpen((v) => !v);
                      }}
                      onMouseDown={e => e.stopPropagation()}
                      aria-haspopup="true"
                      aria-expanded={mobileProfileMenuOpen}
                      tabIndex={0}
                    >
                      <Avatar style={{ width: 22, height: 22 }}>
                        {session.user?.image && <AvatarImage src={session.user.image} alt={session.user.name || 'User'} />}
                        <AvatarFallback>{session.user?.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                      </Avatar>
                      {session?.user?.name || 'Profile'}
                      <ChevronDown size={12} />
                    </button>
                  ) : (
                    <button
                      className="header-btn"
                      onClick={() => signIn('google')}
                    >
                      Sign in
                    </button>
                  )}
                  {/* Mobile profile dropdown */}
                  {mobileProfileMenuOpen && (
                    <div id="mobile-profile-dropdown" style={{ position: 'absolute', top: 36, right: 0, background: '#232e4d', color: '#ffe066', borderRadius: 12, boxShadow: '0 2px 12px #0004', zIndex: 50, minWidth: 160, padding: '0.7rem 0.5rem' }}>
                      <button
                        style={{ background: 'none', border: 'none', color: 'inherit', fontWeight: 600, fontSize: 15, padding: '0.5rem 1.2rem', width: '100%', textAlign: 'left', borderRadius: 8, cursor: 'pointer' }}
                        onClick={() => { signOut(); setMobileProfileMenuOpen(false); }}
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              )}
              {/* Mobile tagline kept inline */}
              {isMobile && (
                <div
                  style={{
                    margin: '10px auto 16px 0px',
                    fontSize: '1.2rem',
                    fontWeight: 750,
                    letterSpacing: '0.01em',
                    color: 'rgb(255, 224, 102)',
                    fontFamily: `"Comic Sans MS", "Comic Sans"`,
                    lineHeight: 1.18,
                    paddingLeft: 23,
                    textAlign: 'center',
                    flex: '0 0 100%'
                  }}
                >
                  Talk about anything, with anyone, anywhere.
                </div>
              )}
              {/* (moved user/avatar above tagline on mobile) */}
              {/* DESKTOP: filter/sort/BuyMeCoffee grouped to right of title, now styled like mobile, with reduced gap */}
              {!isMobile && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 10,
                    width: '100%',
                    maxWidth: '1200px',
                    margin: '0 auto 0.75rem',
                    padding: '0 2rem',
                    boxSizing: 'border-box',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                  aria-label="Primary actions"
                >
                  {/* Filters */}
                  <button
                    className="btn btn--sm btn--secondary"
                    onClick={() => setShowFilters(!showFilters)}
                    style={{
                      ...desktopActionStyle('#000', '#10b981', '#10b981'),
                      height: 40,
                      minHeight: 40,
                      lineHeight: '40px'
                    }}
                  >
                    <FaFilter style={{ marginRight: 8 }} /> FILTERS
                  </button>
                  {/* Sort Select */}
                  <div style={{ position: 'relative', ...desktopActionBlock, height: 40, minHeight: 40, transform: 'translateY(-4px)' }}>
                    <select
                      className="input"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      style={{
                        ...desktopActionSelectBase,
                        border: '1.5px solid #ffd700',
                        color: '#ffd700',
                        boxShadow: '0 2px 10px rgba(255,215,0,0.12)',
                        height: 40,
                        minHeight: 40
                      }}
                    >
                      <option value="newest">Newest First</option>
                      <option value="popular">Most Popular</option>
                      <option value="alphabetical">Alphabetical</option>
                    </select>
                    <span style={chevronSpanStyle}>
                      <ChevronDown size={18} />
                    </span>
                  </div>

                  {/* Community Button (replaces Privacy Policy) */}
                  <Link
                    href="/community"
                    style={{
                      ...desktopActionStyle('transparent', '#ffe066', '#ffe066'),
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      minWidth: 0 // allow the button to shrink and let text resize
                    }}
                    aria-label="Vocably Community"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                      <circle cx="12" cy="8" r="3" />
                      <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
                    </svg>
                    <span style={{ whiteSpace: 'nowrap', display: 'inline-block', fontSize: 'clamp(12px, 1.2vw, 15px)' }}>Vocably Community</span>
                  </Link>
                  {/* Reddit */}
                  <a
                    href="https://www.reddit.com/r/vocablychat"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      ...desktopActionStyle('#000', '#FF4500', '#FF4500'),
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      overflow: 'hidden',
                      position: 'relative'
                    }}
                    aria-label="Reddit community for suggestions, bugs & reports"
                  >
                    <FaReddit size={18} style={{ flexShrink: 0, marginRight: 8, color: '#FF4500' }} />
                    <div style={{ position: 'relative', flex: 1, height: '100%', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                        <div style={{position:'absolute',left:0,top:0,bottom:0,width:20,background:'linear-gradient(90deg,#000,rgba(0,0,0,0))'}} />
                        <div style={{position:'absolute',right:0,top:0,bottom:0,width:20,background:'linear-gradient(270deg,#000,rgba(0,0,0,0))'}} />
                      </div>
                      <div
                        style={{
                          display: 'inline-block',
                          whiteSpace: 'nowrap',
                          fontWeight: 700,
                          animation: 'reddit-marquee-single 9s linear infinite'
                        }}
                      >
                        Reddit community for suggestions, bugs & reports
                      </div>
                      <style>{`
                        @keyframes reddit-marquee-single {
                          0% { transform: translateX(100%); }
                          100% { transform: translateX(-120%); }
                        }
                        @media (prefers-reduced-motion: reduce) {
                          a[aria-label="Reddit community for suggestions, bugs & reports"] div[style*='reddit-marquee-single'] { animation: none !important; }
                        }
                      `}</style>
                    </div>
                  </a>
                  {/* Buy Me Coffee (official button) */}
                  <a
                    href="https://www.buymeacoffee.com/rahulkukreti06"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 160 }}
                  >
                    <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style={{ height: 40, borderRadius: 8, boxShadow: '0 2px 8px -2px rgba(0,0,0,0.18)' }} />
                  </a>
                </div>
              )}
            </div>
            {/* MOBILE: Two rows of two buttons each */}
            {isMobile && (
              <div style={{ width: '100%', margin: '1.8rem 0px 1.5rem' }}>
                {/* First row */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  {/* Create Room Button */}
                  <button
                    onClick={() => setShowCreateModal(true)}
                    style={{
                      flex: 1.3,  // Slightly reduced width
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: 38,
                      minHeight: 38,
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: 12,
                      fontWeight: 700,
                      fontSize: 15,
                      cursor: 'pointer',
                      gap: 8,
                      padding: '0 16px',
                      boxShadow: '0 2px 12px 0 rgba(16,185,129,0.3)'
                    }}
                  >
                    <Plus size={18} /> Create Room
                  </button>
                  
                  {/* Buy Me Coffee Button (official image, mobile) */}
                  <div style={{ 
                    flex: 1, 
                    minWidth: 0,
                    height: 38,
                    display: 'flex'
                  }}>
                    <a
                      href="https://www.buymeacoffee.com/rahulkukreti06"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        width: '100%',
                        minWidth: '120px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        background: '#FFDD00',
                        position: 'relative'
                      }}
                    >
                      <img
                        src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
                        alt="Buy Me A Coffee"
                        style={{
                          height: '100%',
                          width: 'auto',
                          minWidth: '100%',
                          objectFit: 'cover',
                          display: 'block',
                          position: 'absolute',
                          left: '50%',
                          top: '50%',
                          transform: 'translate(-50%, -50%)',
                          minHeight: '100%'
                        }}
                      />
                    </a>
                  </div>
                </div>
                
                {/* Second row - Desktop style sort dropdown */}
                <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                  {/* Sort Select - Mobile */}
                  <div style={{ position: 'relative', flex: 1, height: 38, minHeight: 38, maxWidth: '100%', display: 'flex', alignItems: 'center' }}>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      style={{
                        ...desktopActionSelectBase,
                        border: '1.5px solid #ffd700',
                        color: '#ffd700',
                        boxShadow: '0 2px 10px rgba(255,215,0,0.12)',
                        width: '100%',
                        height: 38,
                        minHeight: 38,
                        paddingLeft: '16px',
                        paddingRight: '40px',
                        textAlign: 'center' as const,
                        textAlignLast: 'center' as const,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <option value="newest">Newest First</option>
                      <option value="popular">Most Popular</option>
                      <option value="alphabetical">Alphabetical</option>
                    </select>
                    <span style={{
                      position: 'absolute',
                      right: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      zIndex: 2,
                      color: '#ffd700'
                    }}>
                      <ChevronDown size={18} />
                    </span>
                  </div>
                  
                  {/* Reddit Button (mobile with marquee) */}
                  <a
                    href="https://www.reddit.com/r/vocablychat"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      height: 38,
                      minHeight: 38,
                      background: '#000',
                      color: '#FF4500',
                      border: '1.5px solid #FF4500',
                      borderRadius: 12,
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: 'pointer',
                      gap: 6,
                      padding: '0 10px',
                      textDecoration: 'none',
                      overflow: 'hidden',
                      position: 'relative'
                    }}
                    aria-label="Reddit community for suggestions, bugs & reports"
                  >
                    <FaReddit size={18} style={{ flexShrink: 0, marginRight: 4, color: '#FF4500' }} />
                    <div style={{ position: 'relative', flex: 1, height: '100%', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                        <div style={{position:'absolute',left:0,top:0,bottom:0,width:14,background:'linear-gradient(90deg,#000,rgba(0,0,0,0))'}} />
                        <div style={{position:'absolute',right:0,top:0,bottom:0,width:14,background:'linear-gradient(270deg,#000,rgba(0,0,0,0))'}} />
                      </div>
                      <div
                        style={{
                          display: 'inline-block',
                          whiteSpace: 'nowrap',
                          fontWeight: 700,
                          fontSize: 13,
                          animation: 'reddit-marquee-mobile 10s linear infinite'
                        }}
                      >
                        Reddit community for suggestions, bugs & reports
                      </div>
                      <style>{`
                        @keyframes reddit-marquee-mobile {
                          0% { transform: translateX(100%); }
                          100% { transform: translateX(-130%); }
                        }
                        @media (prefers-reduced-motion: reduce) {
                          a[aria-label="Reddit community for suggestions, bugs & reports"] div[style*='reddit-marquee-mobile'] { animation: none !important; }
                        }
                      `}</style>
                    </div>
                  </a>
                </div>
              </div>
            )}
            <RoomList
              rooms={roomsWithRealCounts}
              participantCounts={participantCounts}
              selectedLanguage={''}
              selectedLevel={''}
              onJoinRoom={handleJoinRoomSync}
              onParticipantUpdate={handleParticipantUpdate}
              searchTerm={searchTerm}
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              sortBy={sortBy}
              setSortBy={setSortBy}
              roomType={roomType}
              setRoomType={setRoomType}
              availability={availability}
              setAvailability={setAvailability}
              isJoiningMap={isJoiningMap}
              onRemoveRoom={handleRemoveRoom}
            />
          </>
        )}
      </main>
      <CreateRoomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateRoom={handleCreateRoom}
      />
      <JoinRoomModal
        isOpen={showJoinModal}
        onCancel={handleModalCancel}
        onJoin={handleModalJoin}
        roomName={joiningRoom?.name || ''}
        isJoining={joiningRoom ? !!isJoiningMap[joiningRoom.id] : false}
        requirePassword={!!joiningRoom && !joiningRoom.is_public && !!joiningRoom.password}
        passwordError={joinPasswordError || undefined}
        defaultUserName={session?.user?.name || ''}
      />
      {/* Profile modal removed: navigation now routes to /profile/[username] */}
      {showSignInError && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.45)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: '#181a1b',
            color: '#fff',
            borderRadius: 18,
            boxShadow: '0 8px 32px #0008',
            padding: '2.5rem 2.2rem',
            maxWidth: 380,
            width: '90vw',
            textAlign: 'center',
            fontSize: 18,
            fontWeight: 500,
            position: 'relative',
          }}>
            <div style={{ fontSize: 38, marginBottom: 16 }}>🚫</div>
            <div style={{ marginBottom: 18 }}>{signInErrorMessage}</div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 8 }}>
              <button
                onClick={() => {
                  // @ts-ignore
                  if (typeof window !== 'undefined') {
                    import('next-auth/react').then(({ signIn }) => signIn('google'));
                  }
                }}
                style={{
                  background: 'linear-gradient(90deg, #4285F4 0%, #1a73e8 100%)', // solid blue gradient
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 17,
                  padding: '0.7rem 2.2rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 12px 0 rgba(66,133,244,0.17)'
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => setShowSignInError(false)}
                style={{
                  background: 'linear-gradient(90deg, #10b981 80%, #1de9b6 100%)',
                  color: '#181a1b',
                  border: 'none',
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 17,
                  padding: '0.7rem 2.2rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 12px 0 rgba(16,185,129,0.17)'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
  {/* DeepSeek chatbot widget (fixed, appears above the scroll FAB) */}
  {/* DeepSeekChatbot intentionally omitted here to avoid build-time identifier errors when the component is missing. Re-add when available. */}
  <footer role="contentinfo" style={{ textAlign: 'center', padding: '18px 8px', color: '#bdbdbd', fontSize: 13, marginTop: 24 }}>
    <div> © 2025 Vocably — All rights reserved.</div>
  </footer>
  <ScrollToTopBottomButton />
      <WhatsAppCommunityModal 
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
      />
    </>
  );
}
