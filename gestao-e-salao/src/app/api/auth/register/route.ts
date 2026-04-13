import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { hashPassword, SALON_COOKIE_NAME, type SalonSession } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { salonName, ownerName, ownerEmail, ownerPassword, ownerPhone } = await request.json()
    const { supabaseAdmin } = await import('@/lib/supabaseAdmin')

    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: 'Sistema em manutenção' }, { status: 500 })
    }

    const { data: existing } = await supabaseAdmin
      .from('salons')
      .select('id')
      .eq('owner_email', ownerEmail)
      .single()

    if (existing) {
      return NextResponse.json({ success: false, error: 'E-mail já cadastrado' })
    }

    const hashedPassword = hashPassword(ownerPassword)

    const { data: salon, error } = await supabaseAdmin
      .from('salons')
      .insert([{
        name: salonName,
        owner_name: ownerName,
        owner_email: ownerEmail,
        owner_password: hashedPassword,
        owner_phone: ownerPhone || null,
        plan: 'profissional',
        status: 'active',
        subscription_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: 'Erro ao criar conta' })
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
    console.error('Register error:', error)
    return NextResponse.json({ success: false, error: 'Erro de conexão' })
  }
}
