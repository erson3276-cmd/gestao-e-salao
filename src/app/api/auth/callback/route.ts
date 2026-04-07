import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { SALON_COOKIE_NAME, type SalonSession } from '@/lib/auth'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(new URL(`/login?error=${error}`, request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', request.url))
  }

  try {
    const { data, error: authError } = await supabaseAdmin.auth.exchangeCodeForSession(code)

    if (authError || !data.user) {
      return NextResponse.redirect(new URL('/login?error=auth_failed', request.url))
    }

    const email = data.user.email
    if (!email) {
      return NextResponse.redirect(new URL('/login?error=no_email', request.url))
    }

    const { data: salon, error: salonError } = await supabaseAdmin
      .from('salons')
      .select('*')
      .eq('owner_email', email)
      .single()

    if (salonError || !salon) {
      const name = data.user.user_metadata?.full_name || email.split('@')[0]
      return NextResponse.redirect(
        new URL(`/register/google-setup?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`, request.url)
      )
    }

    if (salon.status === 'blocked') {
      return NextResponse.redirect(new URL('/login?error=blocked', request.url))
    }

    if (salon.status === 'inactive') {
      return NextResponse.redirect(new URL('/subscription-expired', request.url))
    }

    const now = new Date()
    const expiresAt = new Date(salon.subscription_ends_at)
    if (now > expiresAt) {
      await supabaseAdmin
        .from('salons')
        .update({ status: 'inactive', updated_at: new Date().toISOString() })
        .eq('id', salon.id)
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

    return NextResponse.redirect(new URL('/admin/agenda', request.url))
  } catch {
    return NextResponse.redirect(new URL('/login?error=server_error', request.url))
  }
}
