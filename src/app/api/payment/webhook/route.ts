import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { SALON_COOKIE_NAME, hashPassword, type SalonSession } from '@/lib/auth'
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
      const customerName = payment.customer?.name
      const paymentStatus = payment.status

      if (paymentStatus !== 'RECEIVED' && paymentStatus !== 'CONFIRMED') {
        return NextResponse.json({ success: true, message: 'Pagamento não confirmado' })
      }

      // Get temp registration data
      const cookieStore = await cookies()
      const tempRegCookie = cookieStore.get('temp_registration')

      if (!tempRegCookie) {
        // Check if salon already exists (renewal case)
        if (customerEmail) {
          const { data: salon } = await supabaseAdmin
            .from('salons')
            .select('id, subscription_ends_at')
            .eq('owner_email', customerEmail)
            .single()

          if (salon) {
            const now = new Date()
            const currentEndsAt = salon.subscription_ends_at ? new Date(salon.subscription_ends_at) : now
            const baseDate = currentEndsAt > now ? currentEndsAt : now
            
            let days = 30
            if (paymentValue >= 400) days = 365
            else if (paymentValue >= 200) days = 180

            const newEndsAt = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000).toISOString()

            await supabaseAdmin
              .from('salons')
              .update({ status: 'active', subscription_ends_at: newEndsAt })
              .eq('id', salon.id)

            return NextResponse.json({ success: true, message: 'Assinatura renovada!' })
          }
        }
        return NextResponse.json({ success: false, error: 'Dados de registro não encontrados' })
      }

      const tempData = JSON.parse(tempRegCookie.value)

      // Verify email not exists
      const { data: existing } = await supabaseAdmin
        .from('salons')
        .select('id')
        .eq('owner_email', tempData.ownerEmail)
        .single()

      if (existing) {
        return NextResponse.json({ success: true, message: 'Conta já existe' })
      }

      // Calculate subscription
      let days = 30
      if (paymentValue >= 400) days = 365
      else if (paymentValue >= 200) days = 180

      const now = new Date()
      const subscriptionEndsAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString()

      // Create salon
      const { data: salon, error } = await supabaseAdmin
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
          subscription_ends_at: subscriptionEndsAt
        }])
        .select()
        .single()

      if (error) {
        console.error('Error creating salon:', error)
        return NextResponse.json({ success: false, error: error.message })
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

      console.log('Salon created and session set:', salon.id)

      return NextResponse.json({ success: true, message: 'Conta ativada com sucesso!' })
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('Webhook error:', e)
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
