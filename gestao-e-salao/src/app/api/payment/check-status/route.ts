import { NextResponse } from 'next/server'
import { getPayment } from '@/lib/asaas'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('paymentId')

    if (!paymentId) {
      return NextResponse.json({ success: false, error: 'Payment ID required' }, { status: 400 })
    }

    const payment = await getPayment(paymentId)

    if (!payment) {
      return NextResponse.json({ success: false, error: 'Payment not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      status: payment.status,
      value: payment.value,
      billingType: payment.billingType
    })
  } catch (e: any) {
    console.error('Check payment error:', e)
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}