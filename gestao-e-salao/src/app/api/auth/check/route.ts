import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { SALON_COOKIE_NAME, SUPER_ADMIN_COOKIE_NAME } from '../../../lib/auth'

export async function GET() {
  const cookieStore = await cookies()
  const session = cookieStore.get(SALON_COOKIE_NAME)
  const admin = cookieStore.get('admin_auth')
  const superAdmin = cookieStore.get(SUPER_ADMIN_COOKIE_NAME)

  if (superAdmin?.value === 'authenticated') {
    return NextResponse.json({ authenticated: true, isSuperAdmin: true })
  }

  if (admin?.value === 'authenticated') {
    return NextResponse.json({ authenticated: true, isAdmin: true })
  }

  if (session?.value) {
    try {
      const data = JSON.parse(session.value)
      return NextResponse.json({ 
        authenticated: true, 
        salonId: data.salonId,
        salonName: data.salonName
      })
    } catch {
      return NextResponse.json({ authenticated: false })
    }
  }

  return NextResponse.json({ authenticated: false })
}
