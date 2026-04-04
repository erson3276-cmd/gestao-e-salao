import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { SALON_COOKIE_NAME, type SalonSession } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json()

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email não disponível' }, { status: 400 })
    }

    const { data: salon, error: salonError } = await supabaseAdmin
      .from('salons')
      .select('*')
      .eq('owner_email', email)
      .single()

    if (salonError || !salon) {
      return NextResponse.json({ 
        success: false, 
        error: 'Conta não encontrada. Cadastre seu salão primeiro.',
        needsRegister: true 
      }, { status: 404 })
    }

    if (salon.status === 'blocked') {
      return NextResponse.json({ success: false, error: 'Sua conta está bloqueada. Entre em contato com o suporte.' }, { status: 403 })
    }

    if (salon.status === 'inactive') {
      return NextResponse.json({ success: false, error: 'Sua assinatura expirou. Renove para continuar usando.' }, { status: 403 })
    }

    const now = new Date()
    const expiresAt = new Date(salon.subscription_ends_at)
    if (now > expiresAt) {
      await supabaseAdmin
        .from('salons')
        .update({ status: 'inactive', updated_at: new Date().toISOString() })
        .eq('id', salon.id)
      return NextResponse.json({ success: false, error: 'Sua assinatura expirou. Renove para continuar usando.' }, { status: 403 })
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

    return NextResponse.json({ success: true, redirect: '/admin/agenda' })
  } catch {
    return NextResponse.json({ success: false, error: 'Erro ao conectar ao servidor' }, { status: 500 })
  }
}
