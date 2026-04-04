import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { createCustomer, findCustomerByEmail, createPayment } from '@/lib/asaas'
import { getSalonId } from '@/lib/session'

const plans = {
  monthly: { price: 49.90, days: 30, label: 'Mensal' },
  semiannual: { price: 249.90, days: 180, label: 'Semestral' },
  annual: { price: 449.90, days: 365, label: 'Anual' },
}

export async function POST(request: Request) {
  try {
    const salonId = await getSalonId()
    if (!salonId) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })
    }

    const { salonId: bodySalonId, planId, billingType } = await request.json()
    const plan = plans[planId as keyof typeof plans]
    
    if (!plan) {
      return NextResponse.json({ success: false, error: 'Plano inválido' }, { status: 400 })
    }

    const targetSalonId = salonId === 'admin' ? (bodySalonId || salonId) : salonId

    const { data: salon, error: salonError } = await supabaseAdmin
      .from('salons')
      .select('*')
      .eq('id', targetSalonId)
      .single()

    if (salonError || !salon) {
      return NextResponse.json({ success: false, error: 'Salão não encontrado' }, { status: 404 })
    }

    // Find or create Asaas customer
    let asaasCustomer = await findCustomerByEmail(salon.owner_email)
    if (!asaasCustomer) {
      asaasCustomer = await createCustomer(
        salon.owner_name,
        salon.owner_email,
        salon.owner_phone || undefined
      )
    }

    // Create payment
    const dueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const payment = await createPayment(
      asaasCustomer.id,
      plan.price,
      dueDate,
      `Gestão E Salão - ${plan.label}`,
      billingType || 'PIX'
    )

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        invoiceUrl: payment.invoiceUrl,
        pixQrCode: payment.pixQrCode,
        pixCopiaECola: payment.pixCopiaECola,
        boletoUrl: payment.boletoUrl,
        value: payment.value,
        dueDate: payment.dueDate,
        billingType: payment.billingType
      }
    })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
