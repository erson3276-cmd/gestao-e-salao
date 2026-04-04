import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD, SUPER_ADMIN_COOKIE_NAME } from '@/lib/auth'

export async function POST(request: Request) {
  const { email, password } = await request.json()
  
  if (email === SUPER_ADMIN_EMAIL && password === SUPER_ADMIN_PASSWORD) {
    const cookieStore = await cookies()
    cookieStore.set(SUPER_ADMIN_COOKIE_NAME, 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    })
    return NextResponse.json({ success: true, redirect: '/super-admin' })
  }
  
  return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
}

export async function GET() {
  return NextResponse.json({ message: 'POST with {email, password} to test login' })
}
