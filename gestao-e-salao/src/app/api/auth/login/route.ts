import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { hashPassword, verifyPassword, SALON_COOKIE_NAME, SUPER_ADMIN_COOKIE_NAME, type SalonSession } from '../../../../lib/auth'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    const { supabaseAdmin } = await import('../../../../lib/supabaseAdmin')

    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: 'Sistema em manutenção' }, { status: 500 })
    }

    const { data: salon, error } = await supabaseAdmin
      .from('salons')
      .select('*')
      .eq('owner_email', email)
      .single()

    if (error || !salon) {
      return NextResponse.json({ success: false, error: 'E-mail ou senha incorretos' })
    }

    if (salon.status === 'blocked') {
      return NextResponse.json({ success: false, error: 'Conta bloqueada' })
    }

    if (salon.status === 'inactive') {
      return NextResponse.json({ success: false, error: 'Assinatura expirou' })
    }

    const isValid = verifyPassword(password, salon.owner_password)
    if (!isValid) {
      return NextResponse.json({ success: false, error: 'E-mail ou senha incorretos' })
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

    return NextResponse.json({ success: true, redirect: '/admin/gestao' })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ success: false, error: 'Erro de conexão' })
  }
}
