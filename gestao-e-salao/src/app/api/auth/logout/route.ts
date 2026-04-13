import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { SALON_COOKIE_NAME, SUPER_ADMIN_COOKIE_NAME } from '../../../lib/auth'

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete(SALON_COOKIE_NAME)
  cookieStore.delete(SUPER_ADMIN_COOKIE_NAME)
  cookieStore.delete('admin_auth')
  return NextResponse.json({ success: true })
}
