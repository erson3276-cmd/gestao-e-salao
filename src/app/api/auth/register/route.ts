import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { SALON_COOKIE_NAME, hashPassword, type SalonSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { salonName, ownerName, ownerEmail, ownerPassword, ownerPhone, ownerCpf } = body

    // Save registration data temporarily in session
    const tempData = {
      salonName,
      ownerName,
      ownerEmail,
      ownerPassword: hashPassword(ownerPassword),
      ownerPhone,
      ownerCpf,
      createdAt: new Date().toISOString()
    }

    // Store temp registration in cookie (will be used after payment)
    const cookieStore = await cookies()
    cookieStore.set('temp_registration', JSON.stringify(tempData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 30, // 30 minutes
      path: '/'
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Dados salvos. Complete o pagamento para ativar sua conta.',
      step: 'payment'
    })
  } catch (e: any) {
    return NextResponse.json({ 
      success: false, 
      error: 'Erro: ' + e.message 
    }, { status: 500 })
  }
}

// This endpoint is called by Asaas webhook after payment confirmation
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { paymentId, status } = body

    if (status !== 'CONFIRMED') {
      return NextResponse.json({ success: false, error: 'Pagamento não confirmado' })
    }

    // Get temp registration data
    const cookieStore = await cookies()
    const tempRegCookie = cookieStore.get('temp_registration')

    if (!tempRegCookie) {
      return NextResponse.json({ success: false, error: 'Dados de registro não encontrados. Faça o cadastro novamente.' })
    }

    const tempData = JSON.parse(tempRegCookie.value)

    // Verify email doesn't exist
    const { data: existing } = await supabaseAdmin
      .from('salons')
      .select('id')
      .eq('owner_email', tempData.ownerEmail)
      .single()

    if (existing) {
      return NextResponse.json({ success: false, error: 'Este email já está cadastrado' })
    }

    // Calculate subscription based on plan
    const now = new Date()
    let endsAt = new Date(now)
    endsAt.setMonth(endsAt.getMonth() + 1)

    // Create salon
    const { data: salon, error: insertError } = await supabaseAdmin
      .from('salons')
      .insert([{
        name: tempData.salonName,
        owner_name: tempData.ownerName,
        owner_email: tempData.ownerEmail,
        owner_password: tempData.ownerPassword,
        owner_phone: tempData.ownerPhone || null,
        owner_cpf: tempData.ownerCpf || null,
        plan: 'profissional',
        status: 'active',
        subscription_ends_at: endsAt.toISOString()
      }])
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ success: false, error: 'Erro ao criar: ' + insertError.message })
    }

    // Create session
    const session: SalonSession = {
      salonId: salon.id,
      salonName: salon.name,
      ownerEmail: salon.owner_email,
      plan: salon.plan,
      subscriptionEndsAt: salon.subscription_ends_at
    }

    cookieStore.set(SALON_COOKIE_NAME, JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    })

    // Delete temp registration
    cookieStore.delete('temp_registration')

    return NextResponse.json({ 
      success: true, 
      message: 'Conta ativada!',
      salonId: salon.id 
    })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: 'Erro: ' + e.message }, { status: 500 })
  }
}
