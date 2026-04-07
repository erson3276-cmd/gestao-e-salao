import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { SALON_COOKIE_NAME, hashPassword, type SalonSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: 'Sistema em manutencao. Tente novamente mais tarde.' }, { status: 503 })
    }

    const { salonName, ownerName, ownerEmail, ownerPassword, ownerPhone, ownerCpf } = await request.json()

    if (!salonName || !ownerName || !ownerEmail || !ownerPassword) {
      return NextResponse.json({ success: false, error: 'Preencha todos os campos obrigatorios.' }, { status: 400 })
    }

    const { data: existing } = await supabaseAdmin
      .from('salons')
      .select('id')
      .eq('owner_email', ownerEmail)
      .single()

    if (existing) {
      return NextResponse.json({ success: false, error: 'Este email ja esta cadastrado' }, { status: 409 })
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
        owner_cpf: ownerCpf || null,
        plan: 'pending',
        status: 'pending',
        subscription_ends_at: null
      }])
      .select()
      .single()

    if (error) {
      console.error('Register error:', error)
      return NextResponse.json({ success: false, error: 'Erro ao criar conta. Tente novamente.' }, { status: 500 })
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
  } catch (e: any) {
    console.error('Register catch error:', e)
    return NextResponse.json({ success: false, error: 'Erro ao conectar ao servidor' }, { status: 500 })
  }
}
