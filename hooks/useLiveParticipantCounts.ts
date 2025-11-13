import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useLiveParticipantCounts(rooms: { id: string }[]) {
  const [counts, setCounts] = useState<{ [roomId: string]: number }>({});
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);

  // Derive a stable list of room IDs to avoid re-running effect when callers pass new array instances
  const roomIds = rooms ? rooms.map(r => r.id).sort() : [];

  useEffect(() => {
    // Listen for immediate participant count updates from other components
    function handleImmediateUpdate(e: Event) {
      try {
        const ev = e as CustomEvent;
        const roomsData = ev.detail as { [k: string]: number } | undefined;
        if (roomsData && typeof roomsData === 'object') {
          setCounts(prev => ({ ...prev, ...roomsData }));
        }
      } catch (err) {
        // ignore
      }
    }
    window.addEventListener('vocably:participantCounts', handleImmediateUpdate as any);

    if (!roomIds || roomIds.length === 0) return;
    let subscription: any;
    let ws: WebSocket | null = null;
    let pollInterval: NodeJS.Timeout | null = null;
    let heartbeatTimeout: NodeJS.Timeout | null = null;

    // Heartbeat/ping logic
    function startHeartbeat() {
      if (heartbeatInterval.current) clearInterval(heartbeatInterval.current);
      heartbeatInterval.current = setInterval(() => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000); // send ping every 30s
    }

    function stopHeartbeat() {
      if (heartbeatInterval.current) clearInterval(heartbeatInterval.current);
    }

    // WebSocket real-time updates with exponential backoff
    function setupWebSocket() {
      const rawUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
      // Trim trailing slashes to avoid proxy path mismatches like /ws/ vs /ws
      const wsUrl = rawUrl.replace(/\/+$/, '');
      ws = new window.WebSocket(wsUrl);
      wsRef.current = ws;
      ws.onopen = () => {
        reconnectAttempts.current = 0;
        startHeartbeat();
        // Removed console.log for production
      };
      ws.onmessage = (event) => {
        // Reset heartbeat timeout on any message
        if (heartbeatTimeout) clearTimeout(heartbeatTimeout);
        heartbeatTimeout = setTimeout(() => {
          // Removed console.warn for production
          wsRef.current?.close();
        }, 60000); // 60s timeout
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'counts' && data.rooms) {
            // Sanitize incoming counts: only accept finite non-negative integers
            const sanitized: { [k: string]: number } = {};
            Object.keys(data.rooms).forEach(k => {
              const v = Number(data.rooms[k]);
              if (Number.isFinite(v) && v >= 0) sanitized[k] = Math.floor(v);
            });
            if (Object.keys(sanitized).length > 0) {
              setCounts((prev) => ({ ...prev, ...sanitized }));
            }
          }
        } catch (err) {
          // Ignore parse errors
        }
      };
      ws.onclose = () => {
        stopHeartbeat();
        if (heartbeatTimeout) clearTimeout(heartbeatTimeout);
        reconnectAttempts.current += 1;
        const delay = Math.min(30000, 2000 * Math.pow(2, reconnectAttempts.current)); // exponential backoff up to 30s
        // Removed console.log for production
        setTimeout(setupWebSocket, delay);
      };
      ws.onerror = () => {
        // Removed console.error for production
      };
    }
    setupWebSocket();

    // Fallback: also subscribe to Supabase for DB sync
    async function fetchCounts() {
      const { data, error } = await supabase
        .from('rooms')
        .select('id,participants');
      if (!error && data) {
        const countsObj: { [roomId: string]: number } = {};
        data.forEach((room: any) => {
          const v = Number(room.participants);
          if (Number.isFinite(v) && v >= 0) countsObj[room.id] = Math.floor(v);
        });
        // Only replace counts for rooms we care about; keep existing keys for others
        setCounts(prev => ({ ...prev, ...countsObj }));
      }
    }
    fetchCounts();
    subscription = supabase
      .channel('public:rooms')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => {
        fetchCounts();
      })
      .subscribe();

    // Poll every 5 seconds
    pollInterval = setInterval(fetchCounts, 5000);

    return () => {
      if (subscription) supabase.removeChannel(subscription);
      if (wsRef.current) wsRef.current.close();
      if (pollInterval) clearInterval(pollInterval);
      stopHeartbeat();
      if (heartbeatTimeout) clearTimeout(heartbeatTimeout);
      window.removeEventListener('vocably:participantCounts', handleImmediateUpdate as any);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomIds.join(',')]);

  return counts;
}
