import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { SALON_COOKIE_NAME, hashPassword, type SalonSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { salonName, ownerName, ownerEmail, ownerPassword, ownerPhone, ownerCpf } = body

    // Test Supabase connection
    const { data: test, error: testError } = await supabaseAdmin
      .from('salons')
      .select('id')
      .limit(1)

    if (testError) {
      return NextResponse.json({ 
        success: false, 
        error: 'Erro de conexão: ' + testError.message 
      }, { status: 500 })
    }

    // Check if email exists
    const { data: existing } = await supabaseAdmin
      .from('salons')
      .select('id')
      .eq('owner_email', ownerEmail)
      .single()

    if (existing) {
      return NextResponse.json({ 
        success: false, 
        error: 'Este email já está cadastrado' 
      }, { status: 409 })
    }

    // Hash password
    const hashedPassword = hashPassword(ownerPassword)

    // Create salon
    const { data: salon, error: insertError } = await supabaseAdmin
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

    if (insertError) {
      return NextResponse.json({ 
        success: false, 
        error: 'Erro ao criar: ' + insertError.message 
      }, { status: 500 })
    }

    // Create session cookie
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

    return NextResponse.json({ 
      success: true, 
      message: 'Conta criada!',
      salonId: salon?.id 
    })
  } catch (e: any) {
    return NextResponse.json({ 
      success: false, 
      error: 'Erro: ' + e.message 
    }, { status: 500 })
  }
}
