import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getPayment } from '@/lib/asaas'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const event = body.event
    const paymentId = body.payment?.id

    if ((event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') && paymentId) {
      const payment = await getPayment(paymentId)
      
      if (payment && (payment.status === 'RECEIVED' || payment.status === 'CONFIRMED')) {
        const description = payment.description || ''
        const salonMatch = description.match(/Gest[aã]o E Sal[aã]o - (\w+)/)
        const planLabel = salonMatch ? salonMatch[1] : 'Mensal'
        
        const daysMap: Record<string, number> = {
          'Mensal': 30,
          'Semestral': 180,
          'Anual': 365,
        }
        const days = daysMap[planLabel] || 30

        const { data: salon } = await supabaseAdmin
          .from('salons')
          .select('id, owner_email, subscription_ends_at')
          .eq('owner_email', payment.customer?.email || '')
          .single()

        if (salon) {
          const now = new Date()
          const currentEndsAt = salon.subscription_ends_at ? new Date(salon.subscription_ends_at) : now
          const baseDate = currentEndsAt > now ? currentEndsAt : now
          const newEndsAt = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000).toISOString()
          
          await supabaseAdmin
            .from('salons')
            .update({
              status: 'active',
              subscription_ends_at: newEndsAt,
              updated_at: new Date().toISOString()
            })
            .eq('id', salon.id)
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
