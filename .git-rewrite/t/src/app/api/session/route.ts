import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { SALON_COOKIE_NAME, SUPER_ADMIN_COOKIE_NAME } from '@/lib/auth'

export async function GET() {
  const cookieStore = await cookies()
  
  const salonCookie = cookieStore.get(SALON_COOKIE_NAME)
  const superAdminCookie = cookieStore.get(SUPER_ADMIN_COOKIE_NAME)
  
  if (superAdminCookie?.value === 'authenticated') {
    return NextResponse.json({ role: 'super-admin' })
  }
  
  if (salonCookie) {
    try {
      const session = JSON.parse(salonCookie.value)
      return NextResponse.json({ role: 'salon', ...session })
    } catch {
      return NextResponse.json({ role: null }, { status: 401 })
    }
  }
  
  return NextResponse.json({ role: null }, { status: 401 })
}
