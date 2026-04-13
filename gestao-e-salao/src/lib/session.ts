import { cookies } from 'next/headers'

const SALON_COOKIE_NAME = 'salon_session'

export async function getSalonId(): Promise<string | null> {
  const cookieStore = await cookies()
  const salonCookie = cookieStore.get(SALON_COOKIE_NAME)
  const adminAuth = cookieStore.get('admin_auth')

  if (salonCookie) {
    try {
      return JSON.parse(salonCookie.value).salonId
    } catch {}
  }

  if (adminAuth?.value === 'authenticated') return 'admin'
  return null
}
