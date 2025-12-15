"use client";

import React, { useEffect, useState } from 'react';
import ExploreRoomCard from '../../../components/ExploreRoomCard';
import CommunitySidePanel from '../../../components/CommunitySidePanel';
import CommunityHeader from '../../../components/CommunityHeader';
import { useLiveParticipantCounts } from '../../../hooks/useLiveParticipantCounts';
import { supabase } from '../../../lib/supabaseClient';
import { useSession } from 'next-auth/react';

interface Room {
  id: string;
  name: string;
  created_at: string;
  participants: number;
  max_participants: number;
  language: string;
  language_level: 'beginner' | 'intermediate' | 'advanced';
  is_public: boolean;
  password?: string;
  created_by: string;
  created_by_name?: string;
  created_by_image?: string | null;
  topic?: string;
  tags?: string[];
  expires_at?: string | null;
  scheduled_at?: string | null;
  interested_count?: number;
}

export default function ExplorePage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const participantCounts = useLiveParticipantCounts(rooms);
  const { data: session } = useSession();

  useEffect(() => {
    let subscription: any;
    let pollTimer: any;

    async function fetchRooms() {
      setLoading(true);
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) setRooms(data as Room[]);
      setLoading(false);
    }

    async function refreshRooms() {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) setRooms(data as Room[]);
    }

    fetchRooms();

    subscription = supabase
      .channel('public:rooms:explore')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => {
        refreshRooms();
      })
      .subscribe();

    pollTimer = setInterval(() => refreshRooms(), 8000);

    return () => {
      if (subscription) supabase.removeChannel(subscription);
      if (pollTimer) clearInterval(pollTimer);
    };
  }, []);

  const handleJoinRoom = async (room: Room) => {
    if (!session) {
      alert('Please sign in to join rooms.');
      return;
    }
    // navigate to room page (join handled on room page)
    if (typeof window !== 'undefined') {
      window.location.href = `/rooms/${room.id}`;
    }
  };

  return (
    <>
      <CommunityHeader />
      <div className="community-main-wrapper" style={{ paddingTop: 28, paddingRight: 20, paddingBottom: 28, maxWidth: 1400, margin: '0 auto' }}>
        <CommunitySidePanel />
      <h1 style={{ color: '#fff', fontSize: 28, marginBottom: 12 }}>Explore</h1>
      <p style={{ color: '#9ca3af', marginBottom: 18 }}>Discover active rooms and conversations across Vocably.</p>

      {loading ? (
        <div style={{ color: '#9ca3af' }}>Loading rooms…</div>
      ) : (
        <>
          <div className="explore-grid">
            {rooms.map(r => (
              <ExploreRoomCard key={r.id} room={r as any} onJoin={() => handleJoinRoom(r as any)} />
            ))}
          </div>
          <style dangerouslySetInnerHTML={{ __html: `
            .explore-grid{ display:grid; gap:18px; grid-template-columns: repeat(3, minmax(280px, 1fr)); justify-content:start }
            @media (max-width: 1024px){ .explore-grid{ grid-template-columns: repeat(2, minmax(260px,1fr)); gap:16px } }
            @media (max-width: 640px){ .explore-grid{ grid-template-columns: 1fr; gap:12px } .community-main-wrapper{ padding-left:12px; padding-right:12px } }
          ` }} />
        </>
      )}
      </div>
    </>
  );
}
