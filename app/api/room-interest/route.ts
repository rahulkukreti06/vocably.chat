import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Persist interest toggles to rooms.interested_count using the service-role key.
// We attempt an atomic update via a Postgres RPC (preferred) falling back to
// a safe read-then-update. The RPC SQL (recommended) is:
// CREATE FUNCTION increment_interested(room_id uuid, delta int) RETURNS integer AS $$
//   UPDATE public.rooms SET interested_count = GREATEST(0, interested_count + delta) WHERE id = room_id RETURNING interested_count;
// $$ LANGUAGE sql;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { roomId, interested, userId, userName, userEmail, userImage } = body as { 
      roomId: string; 
      interested: boolean;
      userId?: string;
      userName?: string;
      userEmail?: string;
      userImage?: string;
    };
    if (!roomId || typeof interested !== 'boolean') {
      return NextResponse.json({ ok: false, error: 'invalid payload' }, { status: 400 });
    }
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'userId is required' }, { status: 400 });
    }

    const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!SUPABASE_URL) {
      return NextResponse.json({ ok: false, error: 'SUPABASE_URL not configured' }, { status: 500 });
    }

    // Prefer service role for writes; fall back to anon key for local/dev if necessary.
    let clientKey = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
    const usedKeyType = SUPABASE_SERVICE_ROLE_KEY ? 'service' : (SUPABASE_ANON_KEY ? 'anon' : 'none');

    if (usedKeyType === 'none') {
      // No keys available to attempt persistence
      console.warn('room-interest: no supabase key available (service or anon)');
      return NextResponse.json({ ok: true, persisted: false });
    }

    if (usedKeyType === 'anon') {
      // warn in server logs — anon key may be unable to write if RLS is enabled.
      console.warn('room-interest: using anon key to attempt write. This is only for local/dev fallback. Ensure SUPABASE_SERVICE_ROLE_KEY is set for production.');
    }

  const supabase = createClient(SUPABASE_URL, clientKey!);

    // Use the new manage_room_interest function
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('manage_room_interest', {
        p_room_id: roomId,
        p_user_id: userId,
        p_user_name: userName || null,
        p_user_email: userEmail || null,
        p_user_image: userImage || null,
        p_interested: interested
      });

      if (rpcError) {
        console.error('manage_room_interest RPC error:', rpcError);
        return NextResponse.json({ ok: false, error: String(rpcError.message) }, { status: 500 });
      }

      return NextResponse.json({ 
        ok: true, 
        persisted: true, 
        interested_count: rpcData.interested_count,
        user_interested: rpcData.user_interested
      });
    } catch (e) {
      console.error('manage_room_interest error:', e);
      return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
    }
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
