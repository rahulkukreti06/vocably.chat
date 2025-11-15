import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { score } = body ?? {}

    // getServerSession's return type can be narrow in some builds; cast to `any`
    const session = (await getServerSession()) as any

    const userEmail = session?.user?.email
    const userName = session?.user?.name ?? null
    const userId = session?.user?.id ?? null

    if (!userEmail) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
    }

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Prevent duplicate submissions by email
    const { data: existing, error: selectError } = await supabase
      .from('quiz_results')
      .select('id')
      .eq('user_email', userEmail)
      .limit(1)
      .maybeSingle()

    if (selectError) {
      console.error('Error checking existing quiz result:', selectError)
    }

    if (existing) {
      return NextResponse.json({ error: 'Already submitted' }, { status: 409 })
    }

    const { error: insertError } = await supabase.from('quiz_results').insert([
      {
        user_id: userId,
        user_email: userEmail,
        user_name: userName,
        score: Number(score || 0),
      },
    ])

    if (insertError) {
      console.error('Error inserting quiz result:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('Quiz submit error:', err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
