import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getPayment } from '@/lib/asaas'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const event = body.event
    const paymentId = body.payment?.id

    if (event === 'PAYMENT_RECEIVED' && paymentId) {
      const payment = await getPayment(paymentId)
      
      if (payment && payment.status === 'RECEIVED') {
        const description = payment.description || ''
        const salonMatch = description.match(/Gestão E Salão - (\w+)/)
        const planLabel = salonMatch ? salonMatch[1] : 'Mensal'
        
        const daysMap: Record<string, number> = {
          'Mensal': 30,
          'Semestral': 180,
          'Anual': 365,
        }
        const days = daysMap[planLabel] || 30

        const { data: salon } = await supabaseAdmin
          .from('salons')
          .select('id, owner_email')
          .eq('owner_email', payment.customerEmail || payment.description)
          .single()

        if (salon) {
          const newEndsAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
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
