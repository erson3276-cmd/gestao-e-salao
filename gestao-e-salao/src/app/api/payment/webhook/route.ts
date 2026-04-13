import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { SALON_COOKIE_NAME, type SalonSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const event = body.event
    const payment = body.payment

    console.log('Webhook received:', event, payment?.id)

    if ((event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED' || event === 'INSTALLMENT_RECEIVED') && payment?.id) {
      const paymentValue = payment.value
      const customerEmail = payment.customer?.email

      if (!customerEmail) {
        return NextResponse.json({ success: false, error: 'Email do cliente não encontrado' })
      }

      if (payment.status !== 'RECEIVED' && payment.status !== 'CONFIRMED') {
        return NextResponse.json({ success: true, message: 'Pagamento não confirmado' })
      }

      const { data: salon, error: salonError } = await supabaseAdmin
        .from('salons')
        .select('*')
        .eq('owner_email', customerEmail)
        .single()

      if (salonError || !salon) {
        return NextResponse.json({ success: false, error: 'Salão não encontrado' })
      }

      let days = 30
      if (paymentValue >= 400) days = 365
      else if (paymentValue >= 200) days = 180

      const now = new Date()
      let newEndsAt: Date

      if (salon.subscription_ends_at) {
        const currentEndsAt = new Date(salon.subscription_ends_at)
        const baseDate = currentEndsAt > now ? currentEndsAt : now
        newEndsAt = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000)
      } else {
        newEndsAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
      }

      await supabaseAdmin
        .from('salons')
        .update({ 
          status: 'active', 
          subscription_ends_at: newEndsAt.toISOString(),
          payment_id: payment?.id || null,
          payment_date: new Date().toISOString()
        })
        .eq('id', salon.id)

      const session: SalonSession = {
        salonId: salon.id,
        salonName: salon.name,
        ownerEmail: salon.owner_email,
        plan: salon.plan || 'profissional',
        subscriptionEndsAt: newEndsAt.toISOString(),
        status: 'active'
      }

      const cookieStore = await cookies()
      cookieStore.set(SALON_COOKIE_NAME, JSON.stringify(session), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
      })

      console.log('Salon subscription updated:', salon.id, 'status: active')

      return NextResponse.json({ success: true, message: 'Assinatura ativada com sucesso!' })
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('Webhook error:', e)
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
