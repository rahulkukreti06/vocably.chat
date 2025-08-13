import React, { useState, useEffect } from 'react';
import { FaGlobe, FaLock, FaTag, FaUsers, FaFont, FaLanguage, FaComments, FaPlus, FaMinus, FaHashtag, FaArrowUp, FaArrowDown, FaChartLine, FaPencilAlt, FaTags, FaTimes } from 'react-icons/fa';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Select from 'react-select';
import '../styles/vocably-modal.css';

// Custom styles for react-select
const customStyles = {
  control: (base: any) => ({
    ...base,
    backgroundColor: 'rgba(30, 32, 40, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '0.5rem',
    minHeight: '44px',
    boxShadow: 'none',
    '&:hover': {
      borderColor: 'rgba(16, 185, 129, 0.5)'
    }
  }),
  menu: (base: any) => ({
    ...base,
    backgroundColor: 'rgba(30, 32, 40, 0.98)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(12px)',
    borderRadius: '0.5rem',
    overflow: 'hidden',
    zIndex: 1000
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isFocused ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
    color: state.isFocused ? '#fff' : 'rgba(255, 255, 255, 0.8)',
    cursor: 'pointer',
    padding: '10px 16px',
    '&:active': {
      backgroundColor: 'rgba(16, 185, 129, 0.3)'
    }
  }),
  singleValue: (base: any) => ({
    ...base,
    color: '#fff'
  }),
  input: (base: any) => ({
    ...base,
    color: '#fff'
  }),
  placeholder: (base: any) => ({
    ...base,
    color: 'rgba(255, 255, 255, 0.5)'
  }),
  dropdownIndicator: (base: any) => ({
    ...base,
    color: 'rgba(255, 255, 255, 0.5)',
    '&:hover': {
      color: '#10b981'
    }
  }),
  indicatorSeparator: () => ({
    display: 'none'
  })
};

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRoom: (roomData: {
    name: string;
    language: string;
    language_level: 'beginner' | 'intermediate' | 'advanced';
    isPublic: boolean;
    password?: string;
    maxParticipants: number;
    topic?: string;
    tags: string[];
  }) => void;
}

const languages = [
'English', 'Spanish', 'French', 'German', 'Japanese',
'Chinese', 'Korean', 'Russian', 'Portuguese', 'Italian',
'Arabic', 'Hindi', 'Turkish', 'Dutch', 'Swedish',
'Bengali', 'Urdu', 'Vietnamese', 'Polish', 'Persian',
'Thai', 'Ukrainian', 'Hebrew', 'Indonesian', 'Malay',
'Romanian', 'Greek', 'Czech', 'Hungarian', 'Finnish',
'Tamil', 'Telugu', 'Marathi', 'Punjabi', 'Malayalam'

];

const levels = ['Beginner', 'Intermediate', 'Advanced'];

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  onCreateRoom,
}) => {
  const [name, setName] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const [selectedLevel, setSelectedLevel] = useState(levels[0]);
  const [isPublic, setIsPublic] = useState(true);
  const [password, setPassword] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [topic, setTopic] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => setIsMounted(false), 300);
      document.body.style.overflow = '';
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen && !isMounted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter a room name');
      return;
    }

    onCreateRoom({
      name,
      language: selectedLanguage,
      language_level: selectedLevel.toLowerCase() as 'beginner' | 'intermediate' | 'advanced',
      isPublic,
      password: isPublic ? undefined : password,
      maxParticipants,
      topic,
      tags,
    });
    // Reset all fields after creating a room
    setName('');
    setSelectedLanguage(languages[0]);
    setSelectedLevel(levels[0]);
    setIsPublic(true);
    setPassword('');
    setMaxParticipants(10);
    setTopic('');
    setTags([]);
    setNewTag('');
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div 
      className={`modal-overlay ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        transition: 'opacity 0.3s ease',
        padding: '1rem',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        className={`modal-content ${isOpen ? 'scale-100' : 'scale-95'} transform transition-transform duration-300`}
        style={{
          background: 'rgba(30, 32, 40, 0.95)',
          borderRadius: '1rem',
          boxShadow: '0 10px 50px rgba(0,0,0,0.5)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          width: '100%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          padding: '2rem',
          color: '#fff',
        }}
      >
        <button 
          onClick={onClose} 
          title="Close"
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            background: 'rgba(30, 32, 40, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'rgba(255, 255, 255, 0.9)',
            cursor: 'pointer',
            fontSize: '1.2rem',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'all 0.2s ease',
            zIndex: 1001,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
            outline: 'none',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.background = '#ef4444';
            e.currentTarget.style.borderColor = 'transparent';
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.6)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
            e.currentTarget.style.background = 'rgba(30, 32, 40, 0.9)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.5)';
          }}
        >
          <X 
            size={20}
            color="white"
            style={{
              display: 'block',
              margin: 'auto',
              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
              flexShrink: 0
            }}
          />
        </button>
        <h2 style={{
          margin: '0 0 2rem 0',
          fontWeight: 700,
          fontSize: '1.75rem',
          background: 'linear-gradient(90deg, #10b981, #3b82f6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textAlign: 'center'
        }}>
          Create New Room
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <FaFont style={{ color: '#10b981', fontSize: '0.9rem' }} />
              <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'rgba(255, 255, 255, 0.9)' }}>Room Name</label>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter a creative name for your room"
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: 'rgba(30, 32, 40, 0.8)',
                color: '#fff',
                fontSize: '0.95rem',
                transition: 'all 0.2s ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#10b981';
                e.target.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaLanguage style={{ color: '#3b82f6', fontSize: '0.9rem' }} />
                <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'rgba(255, 255, 255, 0.9)' }}>Language</label>
              </div>
              <Select
                options={languages.map(lang => ({ value: lang, label: lang }))}
                value={{ value: selectedLanguage, label: selectedLanguage }}
                onChange={(option) => setSelectedLanguage(option?.value || languages[0])}
                isSearchable
                placeholder="Select language"
                styles={{
                  control: (base) => ({
                    ...base,
                    backgroundColor: '#181a20',
                    borderColor: '#333',
                    color: '#fff',
                    minHeight: 44,
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                    fontSize: 16
                  }),
                  menu: (base) => ({
                    ...base,
                    backgroundColor: '#181a20',
                    color: '#fff',
                    borderRadius: 8
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isFocused ? '#23272f' : '#181a20',
                    color: '#fff',
                    cursor: 'pointer',
                  }),
                  singleValue: (base) => ({
                    ...base,
                    color: '#fff',
                  }),
                  input: (base) => ({
                    ...base,
                    color: '#fff',
                  }),
                  dropdownIndicator: (base) => ({
                    ...base,
                    color: '#ccc',
                  }),
                  indicatorSeparator: (base) => ({
                    ...base,
                    backgroundColor: '#333',
                  })
                }}
                classNamePrefix="select"
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaChartLine style={{ color: '#8b5cf6', fontSize: '0.9rem' }} />
                <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'rgba(255, 255, 255, 0.9)' }}>Level</label>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {levels.map((level) => (
                  <label
                    key={level}
                    style={{
                      flex: 1,
                      minWidth: '100px',
                      padding: '0.5rem',
                      borderRadius: '0.5rem',
                      border: selectedLevel === level 
                        ? '1px solid #10b981' 
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      backgroundColor: selectedLevel === level 
                        ? 'rgba(16, 185, 129, 0.1)' 
                        : 'rgba(30, 32, 40, 0.8)',
                      color: selectedLevel === level ? '#10b981' : 'rgba(255, 255, 255, 0.8)',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                    }}
                    onMouseOver={(e) => {
                      if (selectedLevel !== level) {
                        e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.5)';
                        e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.05)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (selectedLevel !== level) {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.backgroundColor = 'rgba(30, 32, 40, 0.8)';
                      }
                    }}
                  >
                    <input
                      type="radio"
                      checked={selectedLevel === level}
                      onChange={() => setSelectedLevel(level)}
                      style={{ display: 'none' }}
                    />
                    {level}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaLock style={{ color: '#f59e0b', fontSize: '0.9rem' }} />
                <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'rgba(255, 255, 255, 0.9)' }}>Room Privacy</label>
              </div>
              <div style={{ 
                display: 'flex', 
                borderRadius: '0.5rem',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: 'rgba(30, 32, 40, 0.8)',
              }}>
                <label
                  style={{
                    flex: 1,
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    backgroundColor: isPublic ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                    color: isPublic ? '#10b981' : 'rgba(255, 255, 255, 0.7)',
                    borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseOver={(e) => !isPublic && (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)')}
                  onMouseOut={(e) => !isPublic && (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <input
                    type="radio"
                    checked={isPublic}
                    onChange={() => setIsPublic(true)}
                    style={{ display: 'none' }}
                  />
                  <FaGlobe style={{ fontSize: '1rem' }} />
                  <span>Public</span>
                </label>
                <label
                  style={{
                    flex: 1,
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    backgroundColor: !isPublic ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                    color: !isPublic ? '#10b981' : 'rgba(255, 255, 255, 0.7)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseOver={(e) => isPublic && (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)')}
                  onMouseOut={(e) => isPublic && (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <input
                    type="radio"
                    checked={!isPublic}
                    onChange={() => setIsPublic(false)}
                    style={{ display: 'none' }}
                  />
                  <FaLock style={{ fontSize: '1rem' }} />
                  <span>Private</span>
                </label>
              </div>
            </div>
          </div>

          {!isPublic && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <FaLock style={{ color: '#f59e0b', fontSize: '0.9rem' }} />
                <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'rgba(255, 255, 255, 0.9)' }}>Password</label>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a password for your room"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backgroundColor: 'rgba(30, 32, 40, 0.8)',
                  color: '#fff',
                  fontSize: '0.95rem',
                  transition: 'all 0.2s ease',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#10b981';
                  e.target.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <FaUsers style={{ color: '#f59e0b', fontSize: '0.9rem' }} />
              <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'rgba(255, 255, 255, 0.9)' }}>Max Participants</label>
            </div>
            <input
              type="number"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(parseInt(e.target.value))}
              min="2"
              max="50"
              placeholder="Enter the maximum number of participants"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: 'rgba(30, 32, 40, 0.8)',
                color: '#fff',
                fontSize: '0.95rem',
                transition: 'all 0.2s ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#10b981';
                e.target.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <FaPencilAlt style={{ color: '#f59e0b', fontSize: '0.9rem' }} />
              <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'rgba(255, 255, 255, 0.9)' }}>Topic (Optional)</label>
            </div>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a topic for your room"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: 'rgba(30, 32, 40, 0.8)',
                color: '#fff',
                fontSize: '0.95rem',
                transition: 'all 0.2s ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#10b981';
                e.target.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <FaTags style={{ color: '#8b5cf6', fontSize: '0.9rem' }} />
              <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'rgba(255, 255, 255, 0.9)' }}>Tags</label>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', marginLeft: 'auto' }}>
                {tags.length}/5
              </span>
            </div>
            
            {tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                {tags.map((tag) => (
                  <div
                    key={tag}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      backgroundColor: 'rgba(139, 92, 246, 0.15)',
                      color: '#a78bfa',
                      borderRadius: '9999px',
                      padding: '0.25rem 0.75rem',
                      fontSize: '0.8rem',
                      fontWeight: 500,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTag(tag);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginLeft: '0.5rem',
                        color: 'rgba(255, 255, 255, 0.7)',
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        padding: 0,
                        flexShrink: 0,
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.color = '#ffffff';
                        e.currentTarget.style.backgroundColor = 'rgba(255, 0, 0, 0.4)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                      }}
                      title="Remove tag"
                      aria-label="Remove tag"
                    >
                      <FaTimes style={{ fontSize: '0.6rem', display: 'block' }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div style={{ display: 'flex', borderRadius: '0.5rem', overflow: 'hidden' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <FaHashtag style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: '0.9rem'
                }} />
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add a tag (press Enter)"
                  disabled={tags.length >= 5}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRight: 'none',
                    borderTopLeftRadius: '0.5rem',
                    borderBottomLeftRadius: '0.5rem',
                    backgroundColor: 'rgba(30, 32, 40, 0.8)',
                    color: '#fff',
                    fontSize: '0.95rem',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#10b981';
                    e.target.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              <button
                type="button"
                onClick={addTag}
                disabled={!newTag.trim() || tags.length >= 5}
                style={{
                  padding: '0 1.25rem',
                  backgroundColor: newTag.trim() && tags.length < 5 ? '#8b5cf6' : 'rgba(139, 92, 246, 0.5)',
                  color: 'white',
                  border: 'none',
                  borderTopRightRadius: '0.5rem',
                  borderBottomRightRadius: '0.5rem',
                  cursor: newTag.trim() && tags.length < 5 ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                  opacity: newTag.trim() && tags.length < 5 ? 1 : 0.7,
                }}
                onMouseOver={(e) => {
                  if (newTag.trim() && tags.length < 5) {
                    e.currentTarget.style.backgroundColor = '#7c3aed';
                  }
                }}
                onMouseOut={(e) => {
                  if (newTag.trim() && tags.length < 5) {
                    e.currentTarget.style.backgroundColor = '#8b5cf6';
                  }
                }}
              >
                <FaPlus style={{ fontSize: '0.8rem' }} />
                Add
              </button>
            </div>
            {tags.length >= 5 && (
              <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '0.25rem' }}>
                Maximum 5 tags reached
              </p>
            )}
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '0.875rem 1.5rem',
                background: 'linear-gradient(90deg, #10b981, #3b82f6)',
                color: 'white',
                fontSize: 17,
                border: 'none',
                outline: 'none',
                transition: 'background 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
              }}
            >
              Create Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};