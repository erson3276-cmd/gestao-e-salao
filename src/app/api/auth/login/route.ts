import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { SALON_COOKIE_NAME, SUPER_ADMIN_COOKIE_NAME, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD, hashPassword, verifyPassword, type SalonSession } from '@/lib/auth'

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
    const { email, password } = await request.json()

    // Super Admin login
    if (email === SUPER_ADMIN_EMAIL && password === SUPER_ADMIN_PASSWORD) {
      const cookieStore = await cookies()
      // Clear any existing salon session
      cookieStore.delete(SALON_COOKIE_NAME)
      cookieStore.set(SUPER_ADMIN_COOKIE_NAME, 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
      })
      return NextResponse.json({ success: true, redirect: '/super-admin' })
    }

    // Salon login
    const tableExists = await salonsTableExists()
    if (!tableExists) {
      return NextResponse.json({ success: false, error: 'Sistema em manutencao. Tente novamente mais tarde.' }, { status: 503 })
    }

    const { supabaseAdmin } = await import('@/lib/supabaseAdmin')
    const { data: salon, error } = await supabaseAdmin
      .from('salons')
      .select('*')
      .eq('owner_email', email)
      .single()

    if (error || !salon) {
      return NextResponse.json({ success: false, error: 'Email ou senha incorretos' }, { status: 401 })
    }

    if (salon.status === 'blocked') {
      return NextResponse.json({ success: false, error: 'Sua conta esta bloqueada. Entre em contato com o suporte.' }, { status: 403 })
    }

    if (salon.status === 'inactive') {
      return NextResponse.json({ success: false, error: 'Sua conta esta inativa. Renove sua assinatura.' }, { status: 403 })
    }

    const isValid = verifyPassword(password, salon.owner_password)
    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Email ou senha incorretos' }, { status: 401 })
    }

    const session: SalonSession = {
      salonId: salon.id,
      salonName: salon.name,
      ownerEmail: salon.owner_email,
      plan: salon.plan
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
  } catch (e: any) {
    return NextResponse.json({ success: false, error: 'Erro ao conectar ao servidor' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: 'POST with {email, password} to login' })
}
