import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { SALON_COOKIE_NAME, hashPassword, type SalonSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { generateVerificationCode, sendVerificationEmail } from '@/lib/email'

const TRIAL_DAYS = 14

function getTrialEndDate() {
  const now = new Date()
  now.setDate(now.getDate() + TRIAL_DAYS)
  return now
}

function getOnboardingMessages() {
  return {
    day1: { sent: false, date: null },
    day3: { sent: false, date: null },
    day5: { sent: false, date: null },
    day10: { sent: false, date: null },
    day12: { sent: false, date: null }
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { salonName, ownerName, ownerEmail, ownerPassword, ownerPhone } = body

    if (!salonName || !ownerName || !ownerEmail || !ownerPassword || !ownerPhone) {
      return NextResponse.json({ success: false, error: 'Preencha todos os campos obrigatórios' })
    }

    const { data: existingByEmail } = await supabaseAdmin
      .from('salons')
      .select('id')
      .eq('owner_email', ownerEmail)
      .single()

    if (existingByEmail) {
      return NextResponse.json({ success: false, error: 'Este email já está cadastrado' })
    }

    const { data: existingByPhone } = await supabaseAdmin
      .from('salons')
      .select('id')
      .eq('owner_phone', ownerPhone)
      .single()

    if (existingByPhone) {
      return NextResponse.json({ success: false, error: 'Este número de WhatsApp já está cadastrado' })
    }

    const verificationCode = generateVerificationCode()
    const trialEnd = getTrialEndDate()
    const now = new Date()

    const { data: salon, error: insertError } = await supabaseAdmin
      .from('salons')
      .insert([{
        name: salonName,
        owner_name: ownerName,
        owner_email: ownerEmail,
        owner_password: hashPassword(ownerPassword),
        owner_phone: ownerPhone || null,
        plan: 'profissional',
        status: 'pending_verification',
        verification_code: verificationCode,
        subscription_ends_at: trialEnd.toISOString(),
        trial_start_at: now.toISOString(),
        trial_end_at: trialEnd.toISOString(),
        onboarding_sent: getOnboardingMessages()
      }])
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ success: false, error: 'Erro ao criar: ' + insertError.message })
    }

    await sendVerificationEmail(ownerEmail, verificationCode, salonName)

    return NextResponse.json({ 
      success: true, 
      step: 'verification',
      message: 'Enviamos um código de verificação para seu email.',
      salonId: salon.id
    })
  } catch (e: any) {
    return NextResponse.json({ 
      success: false, 
      error: 'Erro: ' + e.message 
    }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { salonId, code } = body

    if (!salonId || !code) {
      return NextResponse.json({ success: false, error: 'Código de verificação obrigatório' })
    }

    const { data: salon, error: fetchError } = await supabaseAdmin
      .from('salons')
      .select('*')
      .eq('id', salonId)
      .single()

    if (fetchError || !salon) {
      return NextResponse.json({ success: false, error: 'Cadastro não encontrado' })
    }

    if (salon.status === 'trial' || salon.status === 'active') {
      return NextResponse.json({ success: true, message: 'Email já verificado', step: 'complete' })
    }

    if (salon.verification_code !== code.toUpperCase()) {
      return NextResponse.json({ success: false, error: 'Código incorreto' })
    }

    const { error: updateError } = await supabaseAdmin
      .from('salons')
      .update({ status: 'trial', verification_code: null })
      .eq('id', salonId)

    if (updateError) {
      return NextResponse.json({ success: false, error: 'Erro ao verificar: ' + updateError.message })
    }

    const session: SalonSession = {
      salonId: salon.id,
      salonName: salon.name,
      ownerEmail: salon.owner_email,
      plan: salon.plan,
      subscriptionEndsAt: salon.subscription_ends_at,
      status: 'trial'
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
      step: 'complete',
      message: 'Email confirmado! Bem-vindo ao Gestão E Salão.'
    })
  } catch (e: any) {
    return NextResponse.json({ 
      success: false, 
      error: 'Erro: ' + e.message 
    }, { status: 500 })
  }
}
