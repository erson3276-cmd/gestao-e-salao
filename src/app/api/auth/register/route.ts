import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { SALON_COOKIE_NAME, hashPassword, type SalonSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

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

    const { data: existing } = await supabaseAdmin
      .from('salons')
      .select('id')
      .eq('owner_email', ownerEmail)
      .single()

    if (existing) {
      return NextResponse.json({ success: false, error: 'Este email já está cadastrado' })
    }

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
        status: 'trial',
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
      message: 'Conta criada com sucesso! Você tem 14 dias de teste grátis.',
      step: 'onboarding',
      trialDaysRemaining: TRIAL_DAYS
    })
  } catch (e: any) {
    return NextResponse.json({ 
      success: false, 
      error: 'Erro: ' + e.message 
    }, { status: 500 })
  }
}
