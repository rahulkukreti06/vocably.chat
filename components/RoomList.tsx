import React from 'react';
import RoomCard from './RoomCard';
import styles from '../styles/RoomList.module.css';

interface Room {
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
  created_by_name?: string; // Make optional for compatibility
  created_by_image?: string | null; // Add for Google profile image
  topic?: string;
  tags?: string[];
  expires_at?: string | null;
  scheduled_at?: string | null;
  interested_count?: number;
}

interface RoomListProps {
  rooms: Room[];
  participantCounts: { [roomId: string]: number };
  selectedLanguage: string;
  selectedLevel: string;
  onJoinRoom: (room: Room) => void;
  onParticipantUpdate: (roomId: string, participantCount: number) => void;
  onRemoveRoom?: (roomId: string) => void;
  searchTerm?: string;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  sortBy: 'newest' | 'popular' | 'alphabetical';
  setSortBy: (sort: 'newest' | 'popular' | 'alphabetical') => void;
  roomType: 'all' | 'public' | 'private';
  setRoomType: (type: 'all' | 'public' | 'private') => void;
  availability: 'all' | 'available' | 'full';
  setAvailability: (avail: 'all' | 'available' | 'full') => void;
  isJoiningMap?: { [roomId: string]: boolean };
}

export const RoomList: React.FC<RoomListProps> = ({
  rooms,
  participantCounts = {},
  selectedLanguage,
  selectedLevel,
  onJoinRoom,
  onParticipantUpdate,
  searchTerm,
  showFilters,
  setShowFilters,
  sortBy,
  setSortBy,
  roomType,
  setRoomType,
  availability,
  setAvailability,
  isJoiningMap = {},
  onRemoveRoom,
}) => {
  // Filter rooms based on search term and filters
  const filteredRooms = rooms.filter(room => {
    const term = (searchTerm || '').toLowerCase();
    let matches = (
      term === '' ||
      (room.name && room.name.toLowerCase().includes(term)) ||
      (room.topic && room.topic.toLowerCase().includes(term)) ||
      (room.created_by && room.created_by.toLowerCase().includes(term)) ||
      (room.language && room.language.toLowerCase().includes(term)) ||
      (room.language_level && room.language_level.toLowerCase().includes(term))
    );
    if (roomType !== 'all') {
      matches = matches && (roomType === 'public' ? room.is_public : !room.is_public);
    }
    if (availability !== 'all') {
      const liveCount = participantCounts[room.id] ?? room.participants;
      matches = matches && (availability === 'available'
        ? liveCount < room.max_participants
        : liveCount >= room.max_participants);
    }
    return matches;
  });

  // Sort rooms
  // Fix sort to handle string created_at (ISO) as date
  const sortedRooms = [...filteredRooms].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else if (sortBy === 'popular') {
      const aCount = participantCounts[a.id] ?? a.participants;
      const bCount = participantCounts[b.id] ?? b.participants;
      return bCount - aCount;
    } else {
      return a.name.localeCompare(b.name);
    }
  });

  return (
    <div className="room-list-container" style={{ maxWidth: '1100px', width: '100%', margin: '0 auto', padding: 0, background: 'none', boxShadow: 'none', border: 'none' }}>
      {/* Advanced Filters (shown when showFilters is true) */}
      {showFilters && (
        <div className="advanced-filters slide-up">
          <div className="filter-group">
            <span className="filter-label">Room Type:</span>
            <button
              className={`btn btn--sm btn--secondary filter-chip ${roomType === 'all' ? 'is-active' : ''}`}
              onClick={() => setRoomType('all')}
            >All</button>
            <button
              className={`btn btn--sm btn--secondary filter-chip ${roomType === 'public' ? 'is-active' : ''}`}
              onClick={() => setRoomType('public')}
            >Public</button>
            <button
              className={`btn btn--sm btn--secondary filter-chip ${roomType === 'private' ? 'is-active' : ''}`}
              onClick={() => setRoomType('private')}
            >Private</button>
          </div>
          <div className="filter-group">
            <span className="filter-label">Availability:</span>
            <button
              className={`btn btn--sm btn--secondary filter-chip ${availability === 'all' ? 'is-active' : ''}`}
              onClick={() => setAvailability('all')}
            >All</button>
            <button
              className={`btn btn--sm btn--secondary filter-chip ${availability === 'available' ? 'is-active' : ''}`}
              onClick={() => setAvailability('available')}
            >Available</button>
            <button
              className={`btn btn--sm btn--secondary filter-chip ${availability === 'full' ? 'is-active' : ''}`}
              onClick={() => setAvailability('full')}
            >Full</button>
          </div>
        </div>
      )}
      {sortedRooms.length === 0 ? (
        <div className="no-rooms">No rooms found.</div>
      ) : (
        <div className={styles['room-list-grid']}>
          {sortedRooms.map(room => (
            <RoomCard
              key={room.id}
              room={room}
              liveParticipantCount={participantCounts[room.id] ?? room.participants}
              onJoin={onJoinRoom}
              onRemoveRoom={onRemoveRoom}
              onParticipantUpdate={onParticipantUpdate}
              isJoining={!!isJoiningMap[room.id]}
            />
          ))}
        </div>
      )}
    </div>
  );
};
