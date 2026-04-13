import { cookies } from 'next/headers'

export async function getSalonId(): Promise<string | null> {
  const cookieStore = await cookies()
  const salonCookie = cookieStore.get('salon_session')
  const adminAuth = cookieStore.get('admin_auth')

  if (salonCookie) {
    try {
      return JSON.parse(salonCookie.value).salonId
    } catch {}
  }

  if (adminAuth?.value === 'authenticated') return 'admin'
  return null
}
