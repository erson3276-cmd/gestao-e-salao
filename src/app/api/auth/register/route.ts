import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { SALON_COOKIE_NAME, SUPER_ADMIN_COOKIE_NAME, hashPassword, type SalonSession } from '@/lib/auth'

async function salonsTableExists(): Promise<boolean> {
  try {
    const { supabaseAdmin } = await import('@/lib/supabaseAdmin')
    const { error } = await supabaseAdmin.from('salons').select('id', { count: 'exact', head: true })
    return !error
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  try {
    const { salonName, ownerName, ownerEmail, ownerPassword, ownerPhone, ownerCpf } = await request.json()

    const tableExists = await salonsTableExists()
    if (!tableExists) {
      return NextResponse.json({ success: false, error: 'Sistema em manutencao. Tente novamente mais tarde.' }, { status: 503 })
    }

    const { supabaseAdmin } = await import('@/lib/supabaseAdmin')
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
    return NextResponse.json({ success: false, error: 'Erro ao conectar ao servidor' }, { status: 500 })
  }
}
