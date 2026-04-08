import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { SALON_COOKIE_NAME, hashPassword, type SalonSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { createCustomer, findCustomerByEmail, createPayment } from '@/lib/asaas'

const plans = {
  monthly: { price: 49, label: 'Plano Mensal', months: 1 },
  semiannual: { price: 249.90, label: 'Plano Semestral', months: 6 },
  annual: { price: 449.90, label: 'Plano Anual', months: 12 },
}

export async function POST(request: Request) {
  try {
    const { planId, billingType = 'PIX' } = await request.json()
    const plan = plans[planId as keyof typeof plans]
    
    if (!plan) {
      return NextResponse.json({ success: false, error: 'Plano inválido' }, { status: 400 })
    }

    // Get temp registration data
    const cookieStore = await cookies()
    const tempRegCookie = cookieStore.get('temp_registration')

    if (!tempRegCookie) {
      return NextResponse.json({ success: false, error: 'Dados de registro não encontrados. Faça o cadastro novamente.' }, { status: 400 })
    }

    const tempData = JSON.parse(tempRegCookie.value)

    // Create or find Asaas customer
    let asaasCustomer = await findCustomerByEmail(tempData.ownerEmail)
    
    if (!asaasCustomer) {
      asaasCustomer = await createCustomer(
        tempData.ownerName,
        tempData.ownerEmail,
        tempData.ownerPhone
      )
    }

    if (!asaasCustomer) {
      return NextResponse.json({ success: false, error: 'Erro ao processar pagamento. Tente novamente.' }, { status: 500 })
    }

    // Create payment directly with billing type
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 3) // Due in 3 days

    const payment = await createPayment(
      asaasCustomer.id,
      plan.price,
      dueDate.toISOString().split('T')[0],
      `Gestão E Salão - ${plan.label}`,
      billingType as 'PIX' | 'CREDIT_CARD' | 'BOLETO'
    )

    if (!payment) {
      return NextResponse.json({ success: false, error: 'Erro ao criar pagamento. Tente novamente.' }, { status: 500 })
    }

    // Return payment data for display
    return NextResponse.json({ 
      success: true, 
      payment: {
        id: payment.id,
        value: payment.value,
        dueDate: payment.dueDate,
        billingType: payment.billingType,
        pixQrCode: payment.pixQrCode,
        pixCopiaECola: payment.pixCopiaECola,
        invoiceUrl: payment.invoiceUrl,
        bankSlipLink: payment.bankSlipLink,
        creditCardLink: payment.creditCardLink
      }
    })
  } catch (e: any) {
    console.error('Checkout error:', e)
    return NextResponse.json({ success: false, error: 'Erro: ' + e.message }, { status: 500 })
  }
}
