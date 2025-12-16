import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

let serverSupabase: ReturnType<typeof createClient> | null = null;
if (SUPABASE_URL && SUPABASE_SERVICE_ROLE) {
	serverSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);
} else {
	console.warn('community-members route: missing SUPABASE URL or SERVICE_ROLE key');
}

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const { action, userId, userName, userEmail, userImage } = body || {};
		if (!action || !userId) return NextResponse.json({ error: 'missing fields' }, { status: 400 });

		if (!serverSupabase) return NextResponse.json({ error: 'server not configured' }, { status: 500 });

		// Prefer calling the provided RPC `manage_community_members` if available
		try {
			const rpcRes = await serverSupabase.rpc('manage_community_members', {
				p_user_id: String(userId),
				p_user_name: userName ?? null,
				p_user_email: userEmail ?? null,
				p_user_image: userImage ?? null,
				p_join: action === 'join'
			});
			if (rpcRes.error) {
				console.warn('manage_community_members RPC error, falling back to manual operations:', rpcRes.error);
				throw rpcRes.error;
			}
			const data = Array.isArray(rpcRes.data) ? rpcRes.data[0] : rpcRes.data;
			if (data && (data.members !== undefined || data.members !== null)) {
				return NextResponse.json({ members: data.members ?? 0, joined: !!data.joined });
			}
		} catch (e) {
			// fallback below
		}

		// Fallback: manual insert/delete
		if (action === 'join') {
			const { error: insertErr } = await serverSupabase.from('community_members').insert({ user_id: String(userId), user_name: userName ?? null, user_email: userEmail ?? null, user_image: userImage ?? null });
			// ignore duplicate key (unique user_id) errors — treat as already-joined
			if (insertErr && insertErr.code !== '23505') console.error('community-members insert error:', insertErr);
		} else if (action === 'leave') {
			const { error: delErr } = await serverSupabase.from('community_members').delete().eq('user_id', String(userId));
			if (delErr) console.error('community-members delete error:', delErr);
		}

		// Return current count and whether this user is now joined
		const countRes = await serverSupabase.from('community_members').select('*', { count: 'exact', head: true });
		const members = countRes.count ?? 0;
		const { data: existsData } = await serverSupabase.from('community_members').select('user_id').eq('user_id', String(userId)).limit(1).maybeSingle();
		const joinedNow = !!existsData;
		return NextResponse.json({ members, joined: joinedNow });
	} catch (err: any) {
		console.error('community-members POST exception:', err);
		return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
	}
}

export async function GET(req: Request) {
	try {
		if (!serverSupabase) return NextResponse.json({ error: 'server not configured' }, { status: 500 });

		const url = new URL(req.url);
		const userId = url.searchParams.get('userId');

		const res = await serverSupabase.from('community_members').select('*', { count: 'exact', head: true });
		const members = res.count ?? 0;
		let joined = false;
		if (userId) {
			try {
				const { data: exists } = await serverSupabase.from('community_members').select('user_id').eq('user_id', String(userId)).limit(1).maybeSingle();
				joined = !!exists;
			} catch (e) {
				console.error('Error checking joined status for userId:', userId, e);
			}
		}
		return NextResponse.json({ members, joined });
	} catch (err: any) {
		console.error('community-members GET exception:', err);
		return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
	}
}

