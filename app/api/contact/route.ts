// Minimal stub to satisfy Next.js type generation.
// Contact API is currently disabled; this endpoint returns 404.
import { NextResponse } from 'next/server'

export async function GET() {
	return NextResponse.json(
		{ error: 'Contact API disabled' },
		{ status: 404 }
	)
}

export async function POST() {
	return NextResponse.json(
		{ error: 'Contact API disabled' },
		{ status: 404 }
	)
}
