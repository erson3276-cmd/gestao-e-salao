import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: 'Use supabase.auth.signInWithOAuth on the frontend' })
}
