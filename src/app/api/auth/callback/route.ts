import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseClient } from '@/lib/supabaseClient'
import { SALON_COOKIE_NAME, SUPER_ADMIN_COOKIE_NAME, type SalonSession } from '@/lib/auth'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/admin/agenda'

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', request.url))
  }

  try {
    const { data, error } = await supabaseClient.auth.exchangeCodeForSession(code)

    if (error || !data.user) {
      return NextResponse.redirect(new URL('/login?error=auth_failed', request.url))
    }

    const email = data.user.email
    if (!email) {
      return NextResponse.redirect(new URL('/login?error=no_email', request.url))
    }

    const { supabaseAdmin } = await import('@/lib/supabaseAdmin')
    const { data: salon, error: salonError } = await supabaseAdmin
      .from('salons')
      .select('*')
      .eq('owner_email', email)
      .single()

    if (salonError || !salon) {
      return NextResponse.redirect(new URL('/register?from_google=true&email=' + encodeURIComponent(email), request.url))
    }

    if (salon.status === 'blocked') {
      return NextResponse.redirect(new URL('/login?error=blocked', request.url))
    }

    if (salon.status === 'inactive') {
      return NextResponse.redirect(new URL('/subscription-expired', request.url))
    }

    const session: SalonSession = {
      salonId: salon.id,
      salonName: salon.name,
      ownerEmail: salon.owner_email,
      plan: salon.plan,
      subscriptionEndsAt: salon.subscription_ends_at || ''
    }

    const cookieStore = await cookies()
    cookieStore.set(SALON_COOKIE_NAME, JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    })

    return NextResponse.redirect(new URL(next, request.url))
  } catch {
    return NextResponse.redirect(new URL('/login?error=server_error', request.url))
  }
}
