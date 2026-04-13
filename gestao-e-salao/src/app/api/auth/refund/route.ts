import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { SALON_COOKIE_NAME, type SalonSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { refundPayment, getPayment } from '@/lib/asaas'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SALON_COOKIE_NAME)

    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })
    }

    const session: SalonSession = JSON.parse(sessionCookie.value)
    const body = await request.json()
    const { reason } = body

    // Get salon data
    const { data: salon, error: salonError } = await supabaseAdmin
      .from('salons')
      .select('*')
      .eq('id', session.salonId)
      .single()

    if (salonError || !salon) {
      return NextResponse.json({ success: false, error: 'Salão não encontrado' }, { status: 404 })
    }

    // Check if there's a payment to refund
    if (!salon.payment_id) {
      return NextResponse.json({ success: false, error: 'Nenhum pagamento encontrado para reembolso' }, { status: 400 })
    }

    // Get payment details from Asaas
    const payment = await getPayment(salon.payment_id)

    if (!payment) {
      return NextResponse.json({ success: false, error: 'Pagamento não encontrado' }, { status: 404 })
    }

    // Check payment status - must be CONFIRMED or RECEIVED
    if (payment.status !== 'CONFIRMED' && payment.status !== 'RECEIVED') {
      return NextResponse.json({ success: false, error: 'Pagamento não confirmado não pode ser estornado' }, { status: 400 })
    }

    // Check if within 7 days (Brazilian law)
    const paymentDate = new Date(payment.dateCreated)
    const now = new Date()
    const daysSincePayment = Math.floor((now.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24))

    if (daysSincePayment > 7) {
      return NextResponse.json({ 
        success: false, 
        error: 'Prazo de 7 dias para reembolso expirado. O prazo é de 7 dias após a compra conforme legislação brasileira.' 
      }, { status: 400 })
    }

    // Process refund
    const refundResult = await refundPayment(
      salon.payment_id,
      payment.value,
      reason || 'Solicitação de reembolso pelo cliente - Lei do Direito de Arrependimento (7 dias)'
    )

    if (!refundResult) {
      return NextResponse.json({ success: false, error: 'Erro ao processar reembolso' }, { status: 500 })
    }

    // Update salon to inactive
    await supabaseAdmin
      .from('salons')
      .update({ 
        status: 'cancelled',
        cancellation_reason: reason || 'Reembolso solicitado',
        cancelled_at: new Date().toISOString()
      })
      .eq('id', session.salonId)

    // Delete session
    cookieStore.delete(SALON_COOKIE_NAME)

    return NextResponse.json({
      success: true,
      message: 'Reembolso processado com sucesso. Você será redirecionado em alguns segundos.',
      refund: {
        value: refundResult.value,
        status: refundResult.status,
        date: refundResult.dateCreated
      }
    })
  } catch (e: any) {
    console.error('Refund error:', e)
    return NextResponse.json({ success: false, error: 'Erro: ' + e.message }, { status: 500 })
  }
}