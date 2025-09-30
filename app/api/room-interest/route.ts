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
    const { roomId, interested } = body as { roomId: string; interested: boolean };
    if (!roomId || typeof interested !== 'boolean') {
      return NextResponse.json({ ok: false, error: 'invalid payload' }, { status: 400 });
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

    const delta = interested ? 1 : -1;

    // Try using an RPC for atomic update first (requires creating the function in Postgres).
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('increment_interested', { room_id: roomId, delta });
      if (!rpcError && rpcData) {
        // rpcData may be the returned interested_count (array or number depending on function)
        const count = Array.isArray(rpcData) ? rpcData[0]?.interested_count ?? rpcData[0] : rpcData as any;
        return NextResponse.json({ ok: true, persisted: true, interested_count: Number(count) });
      }
      // If rpcError exists, fallthrough to read-then-update
    } catch (e) {
      // ignore and fallback
    }

    // Fallback: safe read-then-update (not fully atomic, but clamped to >=0)
    const { data: current, error: selectError } = await supabase
      .from('rooms')
      .select('interested_count')
      .eq('id', roomId)
      .maybeSingle();

    if (selectError) {
      return NextResponse.json({ ok: false, error: String(selectError) }, { status: 500 });
    }

    const oldCount = (current && typeof current.interested_count === 'number') ? current.interested_count : 0;
    const newCount = Math.max(0, oldCount + delta);

    const { data: updated, error: updateError } = await supabase
      .from('rooms')
      .update({ interested_count: newCount })
      .eq('id', roomId)
      .select('interested_count')
      .maybeSingle();

    if (updateError) {
      return NextResponse.json({ ok: false, error: String(updateError) }, { status: 500 });
    }

    return NextResponse.json({ ok: true, persisted: true, interested_count: updated?.interested_count ?? newCount });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

