"use client";

import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession, signIn } from 'next-auth/react';

type ChatMessage = {
  id: number | string;
  text: string;
  userId: string;
  userName: string;
  user?: string;
  ts: string;
  image?: string | null;
};

export default function ChatClient() {
  // toggle to show local user's typing indicator for debugging/testing
  const DEBUG_SHOW_LOCAL = false; // set true to reveal local typing in UI
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  // Defensively call useSession() — in some edge cases the hook may
  // return undefined which would throw when destructuring. Use an
  // intermediate value and optional chaining to avoid crashing the UI.
  const sessionHook: any = typeof useSession === 'function' ? useSession() : undefined;
  const session = sessionHook?.data;
  const status: string = sessionHook?.status ?? 'loading';
  const [name, setName] = useState(() => session?.user?.name ?? 'User' + Math.floor(Math.random() * 900 + 100));
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<{ id: string; name: string }[]>([]);
  const [showOnlineDropdown, setShowOnlineDropdown] = useState(false);
  const onlineDropdownRef = useRef<HTMLDivElement | null>(null);
  const onlineButtonRef = useRef<HTMLDivElement | null>(null);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const onResize = () => setIsSmallScreen(typeof window !== 'undefined' ? window.innerWidth <= 900 : false);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const [ownImageFailed, setOwnImageFailed] = useState(false);
  const [socketId, setSocketId] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const typingRef = useRef(false);
  const typingTimeoutRef = useRef<number | null>(null);
  const TYPING_TIMER_LENGTH = 2000; // ms
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);
  const emojiButtonRef = useRef<HTMLButtonElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [mobileLeftOpen, setMobileLeftOpen] = useState(false);

  const emojiList = ['😀','😁','😂','🤣','😊','😍','😎','🤔','👍','👏','🙏','🔥','🎉','😅','🙌','😢','😡','🤯','😴','❤️'];

  const sendEmoji = (emoji: string) => {
    if (!session) {
      setShowSignInPrompt(true);
      return;
    }
    const payload: any = { id: (globalThis.crypto && 'randomUUID' in globalThis.crypto) ? crypto.randomUUID() : String(Date.now()) + Math.random(), text: emoji, userId: session?.user?.email ?? name, userName: session?.user?.name ?? name };
    if (session?.user?.image) payload.image = session.user.image;
    // emit to server
    socketRef.current?.emit('send-message', payload);
    socketRef.current?.emit('chat message', payload);
    // close picker and scroll
    setShowEmojiPicker(false);
    setTimeout(() => {
      try {
        const el = messagesContainerRef.current || document.querySelector('.messages-scroll') as HTMLElement | null;
        if (el) el.scrollTop = el.scrollHeight;
      } catch (e) {}
    }, 120);
  };

  // Safely parse timestamps coming from server. Some clients/servers
  // may send missing or malformed `ts` values which make
  // `new Date(ts).toLocaleTimeString()` throw (Invalid Date).
  const safeDate = (ts?: string | number | null) => {
    const d = ts ? new Date(ts as any) : new Date();
    if (isNaN(d.getTime())) return new Date();
    return d;
  };

  // deterministic color palette for initials (Gmail-like)
  const avatarColors = [
    '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50',
    '#8BC34A', '#CDDC39', '#FFC107', '#FF9800', '#FF5722', '#795548', '#607D8B'
  ];
  const getColorForName = (name: string | undefined | null) => {
    if (!name) return avatarColors[0];
    let h = 0;
    for (let i = 0; i < name.length; i++) {
      h = (h << 5) - h + name.charCodeAt(i);
      h |= 0;
    }
    const idx = Math.abs(h) % avatarColors.length;
    return avatarColors[idx];
  };

  useEffect(() => {
    // Only connect after session is available (requires sign-in)
    if (status === 'loading') return;
    // Allow connecting even when not signed in so anonymous visitors can
    // view the chat. Use a generated `name` when `session` is not present.
    
    const url = process.env.NEXT_PUBLIC_CHAT_SERVER_URL || 'https://msg.vocably.chat/';
    const socket = io(url);
    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketId((socket.id as string) || null);
      // Use session name (server maps socket.id -> username)
      const displayName = session?.user?.name ?? name;
      socket.emit('add user', displayName);
    });

    // helper: scroll messages to bottom
    const scrollToBottom = () => {
      setTimeout(() => {
        try {
          const el = messagesContainerRef.current || document.querySelector('.messages-scroll') as HTMLElement | null;
          if (el) el.scrollTop = el.scrollHeight;
        } catch (e) {}
      }, 120);
    };

    // incoming real-time message(s) from server (support both protocols)
    const handleIncoming = (msg: ChatMessage) => {
      setMessages((prev) => {
        const exists = prev.find((m) => String(m.id) === String(msg.id));
        if (exists) return prev;
        return [...prev, msg];
      });
      scrollToBottom();
    };
    socket.on('receive-message', handleIncoming);
    socket.on('chat message', handleIncoming);

    // chat-history: server sends recent messages on connect (array oldest->newest)
    socket.on('chat-history', (list: ChatMessage[]) => {
      if (!Array.isArray(list)) return;
      setMessages((prev) => {
        const map = new Map<string, ChatMessage>();
        list.forEach((m) => map.set(String(m.id), m));
        prev.forEach((m) => {
          if (!map.has(String(m.id))) map.set(String(m.id), m);
        });
        return Array.from(map.values());
      });
      scrollToBottom();
    });

    // Server-authoritative typing list: list of {id,name}
    socket.on('typing users', (list: { id: string; name: string }[]) => {
      const others = (list || [])
        .filter((item) => (DEBUG_SHOW_LOCAL ? true : item.id !== socketRef.current?.id))
        .map((item) => item.name);
      const unique = Array.from(new Set(others));
      setTypingUsers(unique);
    });

    socket.on('user list', (list: { id: string; name: string }[]) => {
      const items = (list || []).map((item) => ({ id: item.id, name: item.name }));
      setOnlineUsers(items);
    });

    socket.on('disconnect', () => {
      // clear client-side presence/typing state on disconnect
      setOnlineUsers([]);
      setTypingUsers([]);
    });

    // cleanup on unmount: ensure server clears typing state and we remove listeners
    const cleanup = () => {
      if (socket && socket.connected) {
        try {
          socket.emit('stop typing');
        } catch (e) {}
      }
      try {
        socket.disconnect();
      } catch (e) {}
      socketRef.current = null;
    };

    window.addEventListener('beforeunload', cleanup);

    return () => {
      window.removeEventListener('beforeunload', cleanup);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      cleanup();
    };
  }, [session, status]);

  // close emoji picker when clicking outside of it or the emoji button
  useEffect(() => {
    if (!showEmojiPicker) return;
    const handler = (ev: MouseEvent) => {
      const target = ev.target as Node | null;
      if (!target) return;
      if (emojiPickerRef.current && emojiPickerRef.current.contains(target)) return;
      if (emojiButtonRef.current && emojiButtonRef.current.contains(target)) return;
      setShowEmojiPicker(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showEmojiPicker]);

  // close online dropdown when clicking outside (for small screens)
  useEffect(() => {
    if (!showOnlineDropdown) return;
    const handler = (ev: MouseEvent) => {
      const target = ev.target as Node | null;
      if (!target) return;
      if (onlineDropdownRef.current && onlineDropdownRef.current.contains(target)) return;
      if (onlineButtonRef.current && onlineButtonRef.current.contains(target)) return;
      setShowOnlineDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showOnlineDropdown]);

  // If an avatar image fails to load for a message, remove the image so
  // the UI falls back to the text-based avatar (first word of name).
  const handleMsgImageError = (id: string | number) => {
    setMessages((prev) => prev.map((m) => (String(m.id) === String(id) ? { ...m, image: undefined } : m)));
  };

  // whenever session or name changes, inform server (if connected)
  useEffect(() => {
    // prefer session name when available
    if (session?.user?.name) {
      setName(session.user.name);
    }
    const socket = socketRef.current;
    if (!socket || !socket.connected) return;
    const displayName = session?.user?.name ?? name;
    socket.emit('add user', displayName);
  }, [session, name]);

  const send = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    if (!session) {
      setShowSignInPrompt(true);
      return;
    }
    const payload: any = { id: (globalThis.crypto && 'randomUUID' in globalThis.crypto) ? crypto.randomUUID() : String(Date.now()) + Math.random(), text: input.trim(), userId: session?.user?.email ?? name, userName: session?.user?.name ?? name };
    if (session?.user?.image) payload.image = session.user.image;
    // emit both names for compatibility with different server versions
    socketRef.current?.emit('send-message', payload);
    socketRef.current?.emit('chat message', payload);
    setInput('');
    // reset textarea height after sending
    try {
      if (textareaRef.current) textareaRef.current.style.height = '40px';
    } catch (e) {}
    // ensure sender sees the new message: scroll messages area to bottom
    setTimeout(() => {
      try {
        const el = messagesContainerRef.current || document.querySelector('.messages-scroll') as HTMLElement | null;
        if (el) el.scrollTop = el.scrollHeight;
      } catch (e) {}
    }, 120);
    // stop typing after sending
    if (typingRef.current) {
      socketRef.current?.emit('stop typing');
      typingRef.current = false;
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }
  };

  // handle typing notifications
  const handleInputChange = (v: string) => {
    setInput(v);
    // auto-resize textarea to fit content
    try {
      if (textareaRef.current) {
        const el = textareaRef.current;
        el.style.height = 'auto';
        const max = 160; // max height in px before scrolling
        el.style.height = Math.min(el.scrollHeight, max) + 'px';
      }
    } catch (e) {}
    const socket = socketRef.current;
    if (!socket) return;

    if (!typingRef.current) {
      typingRef.current = true;
      // emit typing without relying on name payload; server maps socket.id -> username
      socket.emit('typing');
    }
    // reset single debounce timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = window.setTimeout(() => {
      if (typingRef.current) {
        socket.emit('stop typing');
        typingRef.current = false;
      }
      typingTimeoutRef.current = null;
    }, TYPING_TIMER_LENGTH);
  };

  const isLoading = status === 'loading';
  return (
    <div className="chat-root" style={{ width: '100vw', height: '100vh', padding: 0, margin: 0, background: '#131316', color: '#e6e6e6', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div className="chat-header" style={{ background: '#131316', zIndex: 1000, position: 'sticky', top: 0 }}>
        <div className="chat-header-left" style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <img src="/vocably_icon_no_circle_white.png" alt="Vocably" style={{ width: 36, height: 36, objectFit: 'contain' }} />
          <div className="title">Vocably Chat</div>
        </div>

        <div className="chat-header-right" style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          {isSmallScreen ? (
            <>
              <div ref={onlineButtonRef} className="online-count" onClick={() => setShowOnlineDropdown((s) => !s)} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#dfe6e6', cursor: 'pointer', position: 'relative' }}>
                <span style={{ width: 10, height: 10, background: '#34c759', borderRadius: '50%', display: 'inline-block' }} />
                <span style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8 }}>Online ({onlineUsers.length})
                  <svg width="12" height="12" viewBox="0 0 24 24" style={{ transform: showOnlineDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 160ms ease' }}><path d="M6 9l6 6 6-6" stroke="#dfe6e6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
                </span>
              </div>
              {showOnlineDropdown && (
                <div ref={onlineDropdownRef} className="online-dropdown" style={{ position: 'absolute', top: '48px', right: 12, width: 220, background: '#18181b', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 8, padding: 10, zIndex: 2000 }}>
                  <div style={{ fontWeight: 700, color: '#e6e6e6', marginBottom: 8 }}>Online ({onlineUsers.length})</div>
                  <div style={{ maxHeight: 240, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {onlineUsers.length === 0 ? <div style={{ color: '#9a9a9a' }}>No one online</div> : onlineUsers.map((u) => {
                      // defensive: ensure name is a string before calling string methods
                      const raw = (u && (u as any).name) ?? 'U';
                      const displayName = typeof raw === 'string' ? raw : (raw && typeof raw === 'object' && 'name' in raw ? String((raw as any).name) : String(raw));
                      const initial = (displayName.trim().charAt(0) || 'U').toUpperCase();
                      return (
                        <div key={u.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: getColorForName(displayName), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>{initial}</div>
                          <div style={{ color: '#e6e6e6' }}>{displayName}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="online-count" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#dfe6e6' }}>
              <span style={{ width: 10, height: 10, background: '#34c759', borderRadius: '50%', display: 'inline-block' }} />
              <span style={{ fontWeight: 600 }}>Online ({onlineUsers.length})</span>
            </div>
          )}
          {!isSmallScreen && (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M16 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM8 11c1.657 0 3-1.343 3-3S9.657 5 8 5 5 6.343 5 8s1.343 3 3 3z" fill="#ffffff" />
              <path d="M2 20c0-2.761 2.686-5 6-5h8c3.314 0 6 2.239 6 5v1H2v-1z" fill="#ffffff" />
            </svg>
          )}
          <button className="hamburger" type="button" onClick={() => setMobileLeftOpen(true)} aria-label="Open menu">☰</button>
        </div>
      </div>

      {mobileLeftOpen && (
        <div className="mobile-right-backdrop" onClick={() => setMobileLeftOpen(false)}>
          <div className="mobile-right-panel" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px' }}>
              <div style={{ fontWeight: 800, color: '#e6e6e6' }}>Panel</div>
              <button onClick={() => setMobileLeftOpen(false)} style={{ background: 'transparent', border: 'none', color: '#e6e6e6', fontSize: 18 }}>✕</button>
            </div>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 12px 12px 12px' }}>
              <a className="left-nav-item" href="/">🔊 <span>Voice Rooms</span></a>
              <a className="left-nav-item" href="/community/explore">🔍 <span>Explore Topics</span></a>
              <a className="left-nav-item" href="/community">👥 <span>Community</span></a>
              <a className="left-nav-item" href="/community/create">➕ <span>New Post</span></a>

              <div style={{ height: 1, background: 'rgba(255,255,255,0.03)', margin: '10px 0' }} />

              <div style={{ color: '#9ca3af', fontSize: 12, fontWeight: 700, marginTop: 6 }}>Explore</div>
              <a className="left-nav-item" href="/blog">📰 <span>Blog</span></a>
              <a className="left-nav-item" href="/blog/features">⚙️ <span>Features</span></a>
              <a className="left-nav-item" href="/blog/how-it-works">🔎 <span>How It Works</span></a>
              <a className="left-nav-item" href="/blog/about">ℹ️ <span>About</span></a>
              <a className="left-nav-item" href="/">🚀 <span>Try Vocably</span></a>
              <a className="left-nav-item" href="/privacy">🔒 <span>Privacy Policy</span></a>
            </nav>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <div className="chat-left-panel" style={{ flex: '0 0 240px', minWidth: 120, maxWidth: 280, height: '100%', overflow: 'auto', padding: 12, boxSizing: 'border-box', borderRight: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ color: '#e6e6e6', fontWeight: 800, marginBottom: 8 }}>Panel</div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <a className="left-nav-item" href="/">🔊 <span>Voice Rooms</span></a>
            
            <a className="left-nav-item" href="/community/explore">🔍 <span>Explore Topics</span></a>
            <a className="left-nav-item" href="/community">👥 <span>Community</span></a>
            <a className="left-nav-item" href="/community/create">➕ <span>New Post</span></a>

            <div style={{ height: 1, background: 'rgba(255,255,255,0.03)', margin: '10px 0' }} />

            <div style={{ color: '#9ca3af', fontSize: 12, fontWeight: 700, marginTop: 6 }}>Explore</div>
            <a className="left-nav-item" href="/blog">📰 <span>Blog</span></a>
            <a className="left-nav-item" href="/blog/features">⚙️ <span>Features</span></a>
            <a className="left-nav-item" href="/blog/how-it-works">🔎 <span>How It Works</span></a>
            <a className="left-nav-item" href="/blog/about">ℹ️ <span>About</span></a>
            <a className="left-nav-item" href="/">🚀 <span>Try Vocably</span></a>
            <a className="left-nav-item" href="/privacy">🔒 <span>Privacy Policy</span></a>
          </nav>
        </div>

        <div className="chat-center" style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: 0, minHeight: 0, overflow: 'hidden', boxSizing: 'border-box' }}>
          {isLoading && (
            <div style={{ padding: 20, textAlign: 'center', color: '#9a9a9a' }}>Loading session... please wait</div>
          )}
        

        <div ref={messagesContainerRef} className="messages-scroll" style={{ display: 'flex', flexDirection: 'column', borderRadius: 0, flex: 1, overflow: 'auto', padding: 0, marginBottom: 0, background: '#1A1A1E', minHeight: 0 }}>
          {messages.map((m, idx) => {
            const prev = messages[idx - 1];
            const showDate = !prev || safeDate(prev.ts).toDateString() !== safeDate(m.ts).toDateString();
            const isMine = session?.user?.email && m.userId === session.user.email;
            const time = safeDate(m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const avatar = m.image || '/vocably_icon_no_circle_white.png';
            const displayName = (m.userName && String(m.userName).trim()) || (m.user && String(m.user).trim()) || (m.userId && String(m.userId).split('@')[0]) || 'User';
            const initials = String(displayName).split(' ').map(s => (s || '').trim().charAt(0)).join('').slice(0,2).toUpperCase();
            return (
              <React.Fragment key={m.id}>
                {showDate && (
                  <div style={{ textAlign: 'center', margin: '18px 0', color: '#9a9a9a' }}>
                    <span style={{ display: 'inline-block', padding: '6px 14px', borderRadius: 20, background: 'rgba(255,255,255,0.02)', fontSize: 12 }}>{safeDate(m.ts).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', justifyContent: isMine ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
                  {!isMine && (
                    <div style={{ width: 36, flex: '0 0 36px', alignSelf: 'flex-start', marginLeft: 8 }}>
                      {m.image ? (
                        <img src={avatar} alt={""} aria-label={displayName} onError={() => handleMsgImageError(m.id)} style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: getColorForName(displayName), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{initials}</div>
                      )}
                    </div>
                  )}

                  <div style={{ maxWidth: '78%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {!isMine && <div style={{ fontWeight: 700, color: '#e6e6e6', fontSize: 13 }}>{displayName}</div>}
                      <div style={{ fontSize: 12, color: '#8f98a0' }}>{time}</div>
                    </div>
                    <div style={{ marginTop: 6 }}>
                      <div
                        style={{
                          padding: '10px 12px',
                          borderRadius: 12,
                          background: isMine ? '#0b9d5b' : '#232428',
                          color: isMine ? '#fff' : '#e6e6e6',
                          lineHeight: 1.45,
                          boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.2)',
                          // Ensure long unbroken text wraps instead of overflowing
                          whiteSpace: 'pre-wrap',
                          overflowWrap: 'anywhere',
                          wordBreak: 'break-word'
                        }}
                      >
                        {m.text}
                      </div>
                    </div>
                  </div>

                  {isMine && (
                    <div style={{ width: 36, flex: '0 0 36px' }}>
                      {session.user?.image && !ownImageFailed ? (
                        <img src={session.user.image as string} alt={""} aria-label={session.user?.name ?? 'me'} onError={() => setOwnImageFailed(true)} style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: getColorForName(session.user?.name || 'Me'), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{((session.user?.name || 'Me').trim().charAt(0) || 'M').toUpperCase()}</div>
                      )}
                    </div>
                  )}
                </div>
              </React.Fragment>
            );
          })}

          {/* spacer pushes the typing-pill to the bottom when there are few/no messages */}
          <div style={{ flex: 1 }} />

          {typingUsers.length > 0 && (
            <div className="typing-pill">
              {typingUsers.length === 1 ? `${typingUsers[0]} is typing...` : 'Multiple people are typing...'}
            </div>
          )}
        </div>

        <form onSubmit={send} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '10px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, background: '#1A1A1E', borderRadius: 10, padding: '6px 10px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
              <button ref={emojiButtonRef} type="button" onClick={() => setShowEmojiPicker((v) => !v)} title="Emoji" style={{ background: 'transparent', border: 'none', color: '#e6e6e6', fontSize: 18, cursor: 'pointer', paddingLeft: 10, paddingRight: 10, borderRight: '1px solid rgba(255,255,255,0.08)', marginRight: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch', borderTopRightRadius: 0, borderBottomRightRadius: 0 }} aria-label="Emoji picker">😊</button>
              <textarea
              value={input}
              ref={textareaRef}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={session ? "Type a message" : "Sign in to send messages"}
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                color: '#e6e6e6',
                outline: 'none',
                resize: 'none',
                minHeight: 40,
                maxHeight: 160,
                overflow: 'auto',
                boxSizing: 'border-box',
                paddingTop: 12,
                paddingBottom: 12,
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                fontSize: 13,
                paddingLeft: 8,
                textAlign: 'left'
              }}
            />
            </div>
          </div>
          {input.trim().length > 0 && (
            <button type="submit" title="Send message" aria-label="Send message" style={{ background: 'transparent', border: 'none', color: '#e6e6e6', width: 36, height: 36, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'scale(1.9)', transformOrigin: 'center' }}>
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor" />
              </svg>
            </button>
          )}
          {showEmojiPicker && (
            <div ref={emojiPickerRef} style={{ position: 'absolute', bottom: 72, left: 12, right: 'auto', background: '#18181b', border: '1px solid rgba(255,255,255,0.04)', padding: 8, borderRadius: 8, display: 'grid', gridTemplateColumns: 'repeat(8, 28px)', gap: 6, zIndex: 2000 }}>
              {emojiList.map((e) => (
                <button key={e} type="button" onClick={() => sendEmoji(e)} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, background: 'transparent', border: 'none', cursor: 'pointer' }}>{e}</button>
              ))}
            </div>
          )}
        </form>
        </div>

      {/* Sign-in prompt modal for guests attempting to send */}
      {showSignInPrompt && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 6000 }}
          onClick={() => setShowSignInPrompt(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(560px, 92%)',
              background: '#0b0b0c',
              borderRadius: 16,
              padding: '28px 28px 20px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
              color: '#e6e6e6',
              textAlign: 'center'
            }}
          >
            <h2 style={{ margin: 0, marginBottom: 8, fontSize: 32, fontWeight: 800, color: '#fff', fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto' }}>Sign Up</h2>
            <p style={{ marginTop: 6, marginBottom: 20, color: '#9aa4b2' }}>Sign in to interact with Vocably Chat</p>

            <button
              onClick={() => signIn('google')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                margin: '6px auto',
                background: '#fff',
                color: '#0b1220',
                border: 'none',
                padding: '16px 22px',
                borderRadius: 40,
                width: '100%',
                maxWidth: 520,
                minHeight: 56,
                fontWeight: 700,
                fontSize: 16,
                cursor: 'pointer',
                boxShadow: '0 6px 22px rgba(0,0,0,0.36)',
                position: 'relative',
                paddingLeft: 72
              }}
            >
              <svg style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)' }} width="20" height="20" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M533.5 278.4c0-18.5-1.5-37.1-4.6-54.8H272v103.7h147.7c-6.3 34-25.5 62.8-54.4 82l88 68.5c51.4-47.4 81.2-117.2 81.2-199.4z" fill="#4285F4"/>
                <path d="M272 544.3c73.6 0 135.4-24.4 180.5-66.1l-88-68.5c-24.6 16.6-56 26.5-92.5 26.5-71 0-131.2-47.9-152.7-112.2l-90.3 69.6C69.9 483.6 164.8 544.3 272 544.3z" fill="#34A853"/>
                <path d="M119.3 328.9c-10.8-32.3-10.8-66.4 0-98.7L29 160.6C10 198.1 0 239.4 0 272c0 32.6 10 73.9 29 111.4l90.3-54.5z" fill="#FBBC05"/>
                <path d="M272 107.7c39.9-.6 78.1 14 107.1 40.1l80.6-80.6C407.4 24.2 345.6 0 272 0 164.8 0 69.9 60.7 29 160.6l90.3 69.6C140.8 155.6 201 107.7 272 107.7z" fill="#EA4335"/>
              </svg>
              <span style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }}>Continue with Google</span>
            </button>

            <div style={{ marginTop: 16 }}>
              <button onClick={() => setShowSignInPrompt(false)} style={{ background: 'transparent', border: 'none', color: '#cbd5e1', fontWeight: 600, cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}

        <div className="chat-right-panel" style={{ flex: '0 0 240px', minWidth: 120, maxWidth: 300, height: '100%', overflow: 'auto', padding: 12, boxSizing: 'border-box', borderLeft: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ color: '#e6e6e6', fontWeight: 800, marginBottom: 8 }}>Participants ({onlineUsers.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {onlineUsers.length === 0 && <div style={{ color: '#9a9a9a' }}>No one online</div>}
               {onlineUsers.map((u) => {
                 const raw = (u && (u as any).name) ?? 'U';
                 const displayName = typeof raw === 'string' ? raw : (raw && typeof raw === 'object' && 'name' in raw ? String((raw as any).name) : String(raw));
                 const initial = (displayName.trim().charAt(0) || 'U').toUpperCase();
                 return (
                   <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                     <div style={{ position: 'relative', width: 36, height: 36 }}>
                       <div style={{ width: 36, height: 36, borderRadius: 8, background: getColorForName(displayName), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>{initial}</div>
                       <span style={{ position: 'absolute', width: 10, height: 10, borderRadius: 999, background: '#34c759', right: -2, bottom: -2, border: '2px solid #131316' }} />
                     </div>
                     <div style={{ color: '#e6e6e6' }}>{displayName}</div>
                   </div>
                 );
               })}
          </div>
        </div>

      </div>

      {/* typing indicator moved inside messages area */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        .chat-root { font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif; font-size: 15px; }
        .chat-root textarea, .chat-root input, .chat-root button { font-family: inherit; }

        .messages-scroll {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
        .messages-scroll::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
          width: 0;
          height: 0;
        }

        .chat-left-panel { display: block; }
        .chat-right-panel { display: block; }

        .typing-pill { display: inline-block; margin: 12px 16px; padding: 8px 12px; border-radius: 16px; background: rgba(255,255,255,0.02); color: #cfcfcf; font-size: 13px; }

        @media (max-width: 900px) {
          .chat-left-panel { display: none; }
        }
        @media (max-width: 768px) {
          .chat-right-panel { display: none; }
          .chat-center { padding-left: 12px; padding-right: 12px; }
        }
        /* Left nav item styles */
        .left-nav-item { display: flex; gap: 12px; align-items: center; padding: 10px 12px; color: #cbd5e1; text-decoration: none; border-radius: 8px; transition: background 160ms ease, color 160ms ease; font-size: 13px; line-height: 1.2; }
        .left-nav-item span { display: inline-block; font-size: 16px; line-height: 1.2; }
        /* On hover only change background/color; do NOT change size, transform, or layout */
        .left-nav-item:hover { background: rgba(255,255,255,0.03); color: #ffffff; cursor: pointer; }
        .left-nav-item:active { opacity: 0.95; }
        .chat-header { padding: 14px 24px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.04); box-sizing: border-box; gap: 8px; flex-wrap: wrap; }
        .chat-header .title { font-weight: 800; font-size: 22px; color: #ffffff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 240px; }
        .chat-header-left { min-width: 0; display: flex; align-items: center; gap: 12px; }
        .chat-header-right { min-width: 0; display: flex; align-items: center; gap: 10px; }
        .chat-header .online-count { display: flex; align-items: center; gap: 8px; color: #dfe6e6; }

        @media (max-width: 900px) {
          .chat-header { padding: 12px 14px; }
          .chat-header .title { font-size: 18px; max-width: 160px; }
          .chat-header-left img { display: none; }
        }
        /* Hide visible scrollbars on small screens for this chat UI only */
        @media (max-width: 900px) {
          .chat-root, .chat-root * {
            -ms-overflow-style: none !important; /* IE and Edge */
            scrollbar-width: none !important; /* Firefox */
          }
          .chat-root *::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
        }
        @media (max-width: 600px) {
          .chat-header { padding: 10px 12px; }
          .chat-header img { width: 28px; height: 28px; }
          .chat-header .title { font-size: 16px; max-width: 120px; }
          .chat-header .online-count { display: none; }
        }
        .hamburger { display: none; background: transparent; border: none; color: #e6e6e6; font-size: 20px; cursor: pointer; }
        .mobile-right-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 3000; display: flex; justify-content: flex-end; }
        .mobile-right-panel { width: 260px; max-width: 80%; background: #131316; box-shadow: 0 6px 20px rgba(0,0,0,0.6); height: 100%; overflow: auto; }

        @media (max-width: 900px) {
          .hamburger { display: inline-block; margin-right: 6px; }
        }
      `}</style>
    </div>
  );  
}
