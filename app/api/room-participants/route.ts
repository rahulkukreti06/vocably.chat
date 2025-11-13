import { NextResponse } from 'next/server';
import { supabase as anonSupabase } from '@/lib/supabaseClient'; // client-side/edge-safe client (anon key)
import { createClient } from '@supabase/supabase-js';

// Ensure this route runs in the Node.js runtime (not Edge). Vercel/Next may default to Edge.
export const runtime = 'nodejs';

// Optional server-side Supabase client using the SERVICE_ROLE key.
// This is required if you have RLS on the rooms table and need server-side updates.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY;
const serverSupabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)
  : null;

// Add type declaration for optional global broadcast hook (keeps broadcast optional)
declare global {
  // eslint-disable-next-line no-var
  var broadcastParticipantCounts: (() => void) | undefined;
}

// Broadcast helper: if a custom broadcaster is installed on the server (e.g., a separate WS process)
// call it; otherwise do nothing here — rely on Supabase Realtime for client sync.
function broadcastParticipantCounts() {
  if (typeof globalThis.broadcastParticipantCounts === 'function') {
    try {
      globalThis.broadcastParticipantCounts();
    } catch (err) {
      // ignore
    }
  }
}

export async function GET() {
  // Return the current participants for all rooms (source of truth: DB)
  try {
    const db = serverSupabase ?? anonSupabase;
    const { data, error } = await db.from('rooms').select('id,participants');
    if (error) {
      console.error('Failed to fetch room participants for GET:', error);
      return NextResponse.json({ rooms: {} });
    }
    const rooms: { [k: string]: number } = {};
    (data || []).forEach((r: any) => {
      const v = Number(r.participants);
      rooms[r.id] = Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0;
    });
    return NextResponse.json({ rooms });
  } catch (err) {
    console.error('GET /api/room-participants error:', err);
    return NextResponse.json({ rooms: {} });
  }
}

export async function POST(request: Request) {
  const payload = await request.json();
  const { roomId, action, count } = payload || {};
  console.log('JOIN API called with:', { roomId, action });
  
  if (!roomId || !action) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  try {
    // Allow a direct 'set' action where caller provides an authoritative count
    if (action === 'set' && typeof count !== 'undefined') {
      // For security, only allow authoritative 'set' when a server-side service role key is available.
      if (!serverSupabase) {
        console.warn('Rejecting set action because serverSupabase (service role) is not configured');
        return NextResponse.json({ error: 'Server not configured for authoritative set' }, { status: 403 });
      }
      const safeProvided = Number.isFinite(Number(count)) && Number(count) >= 0 ? Math.floor(Number(count)) : 0;
      // Persist the provided count to DB using server client
      const db = serverSupabase;
      const { data: updateData, error: updateError } = await db
        .from('rooms')
        .update({ participants: safeProvided })
        .eq('id', roomId)
        .select('participants');

      if (updateError) {
        console.error('Supabase update error (set):', updateError);
      }

      // Broadcast authoritative value
      broadcastParticipantCounts();
      const returned = updateData && updateData.length > 0 ? Number(updateData[0].participants) : safeProvided;
      return NextResponse.json({ success: true, participants: returned });
    }

    // Read the latest participants value from the DB to avoid relying solely on in-memory counters
    const db = serverSupabase ?? anonSupabase;
    const { data: currentData, error: selectError } = await db
      .from('rooms')
      .select('participants')
      .eq('id', roomId)
      .single();

    if (selectError) {
      console.error('Supabase select error:', selectError);
    }

    const currentDbValue = currentData && typeof currentData.participants !== 'undefined' && currentData.participants !== null
      ? Number(currentData.participants)
      : 0;
    const safeCurrent = Number.isFinite(currentDbValue) && currentDbValue >= 0 ? Math.floor(currentDbValue) : 0;

    // Compute the new count based on the authoritative DB value
    let newCount = safeCurrent;
    if (action === 'join') {
      newCount = safeCurrent + 1;
      console.log(`Join request for ${roomId}: ${safeCurrent} -> ${newCount}`);
    } else if (action === 'leave') {
      newCount = Math.max(0, safeCurrent - 1);
      console.log(`Leave request for ${roomId}: ${safeCurrent} -> ${newCount}`);
    }

    // Persist the new count back to Supabase using an atomic RPC if available.
    // This avoids read-modify-write races across concurrent requests.
    let finalCount = newCount;
    if (serverSupabase) {
      try {
        // The RPC should be created in Postgres as:
        // CREATE FUNCTION change_participants(p_room_id uuid, p_delta int) RETURNS int AS $$
        // DECLARE new_count int;
        // BEGIN
        //   UPDATE rooms SET participants = GREATEST(COALESCE(participants,0) + p_delta, 0)
        //   WHERE id = p_room_id
        //   RETURNING participants INTO new_count;
        //   RETURN new_count;
        // END;
        // $$ LANGUAGE plpgsql SECURITY DEFINER;
        const delta = action === 'join' ? 1 : (action === 'leave' ? -1 : 0);
        if (delta !== 0) {
          const { data: rpcData, error: rpcError } = await serverSupabase.rpc('change_participants', { p_room_id: roomId, p_delta: delta });
          if (rpcError) {
            console.error('RPC change_participants error:', rpcError);
            // Fallback: perform an atomic-like update using SQL to avoid leaving counts inconsistent
            try {
              const { data: updateData, error: updateError } = await db
                .from('rooms')
                .update({ participants: newCount })
                .eq('id', roomId)
                .select('participants');
              if (!updateError && updateData && updateData.length > 0) {
                finalCount = Number(updateData[0].participants);
              } else if (updateError) {
                console.error('Supabase update error (fallback):', updateError);
              }
            } catch (err) {
              console.error('Fallback update error after RPC failure:', err);
            }
          } else if (rpcData) {
            // rpcData may be an array or scalar depending on Postgres function signature
            // Try to normalize to a number
            const maybe = Array.isArray(rpcData) ? rpcData[0] : rpcData;
            const val = typeof maybe === 'object' && maybe !== null ? (maybe.change_participants ?? Object.values(maybe)[0]) : maybe;
            const parsed = Number(val);
            if (Number.isFinite(parsed)) finalCount = Math.max(0, Math.floor(parsed));
            else {
              // If RPC returned unexpected value, attempt fallback update
              try {
                const { data: updateData, error: updateError } = await db
                  .from('rooms')
                  .update({ participants: newCount })
                  .eq('id', roomId)
                  .select('participants');
                if (!updateError && updateData && updateData.length > 0) {
                  finalCount = Number(updateData[0].participants);
                } else if (updateError) {
                  console.error('Supabase update error (fallback after rpc unexpected):', updateError);
                }
              } catch (err) {
                console.error('Fallback update error after RPC unexpected response:', err);
              }
            }
          }
        } else {
          // For non-delta actions fallback to direct update
          const { data: updateData, error: updateError } = await db
            .from('rooms')
            .update({ participants: newCount })
            .eq('id', roomId)
            .select('participants');
          if (updateError) console.error('Supabase update error:', updateError);
          else if (updateData && updateData.length > 0) finalCount = Number(updateData[0].participants);
        }
      } catch (err) {
        console.error('Error calling RPC change_participants:', err);
      }
    } else {
      const { data: updateData, error: updateError } = await db
        .from('rooms')
        .update({ participants: newCount })
        .eq('id', roomId)
        .select('participants');
      if (updateError) {
        console.error('Supabase update error:', updateError);
      } else if (updateData && updateData.length > 0) {
        finalCount = Number(updateData[0].participants);
      }
    }

  // Broadcast the update to any custom broadcaster (optional). Clients should be receiving
    // realtime updates via Supabase Realtime/Postgres changes which the frontend already subscribes to.
    broadcastParticipantCounts();

  return NextResponse.json({ success: true, participants: finalCount });
  } catch (error) {
    console.error('Error updating participant count:', error);
    return NextResponse.json({ error: 'Failed to update participant count' }, { status: 500 });
  }
}
