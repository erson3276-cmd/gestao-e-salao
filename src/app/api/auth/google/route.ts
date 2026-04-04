import { NextResponse } from 'next/server'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://gestaoesalao.vercel.app'}/api/auth/callback`
  
  const googleAuthUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}&scopes=email+profile`
  
  return NextResponse.redirect(googleAuthUrl)
}
