import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json({ message: 'Seed disabled in production. Use Supabase SQL Editor directly.' }, { status: 403 })
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Seed disabled in production. Use Supabase SQL Editor directly.'
  })
}
