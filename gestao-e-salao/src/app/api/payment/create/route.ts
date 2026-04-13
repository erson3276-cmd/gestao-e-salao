import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { createCustomer, findCustomerByEmail, createPayment, updateCustomer } from '@/lib/asaas'
import { getSalonId } from '@/lib/session'

const plans = {
  monthly: { price: 49.90, days: 30, label: 'Plano Mensal' },
  semiannual: { price: 249.90, days: 180, label: 'Plano Semestral' },
  annual: { price: 449.90, days: 365, label: 'Plano Anual' },
}

export async function POST(request: Request) {
  try {
    const { planId, billingType, customerData } = await request.json()
    const plan = plans[planId as keyof typeof plans]
    
    if (!plan) {
      return NextResponse.json({ success: false, error: 'Plano inválido' }, { status: 400 })
    }

    if (!customerData?.cpf || customerData.cpf.replace(/\D/g, '').length !== 11) {
      return NextResponse.json({ success: false, error: 'CPF inválido' }, { status: 400 })
    }

    if (!customerData?.email || !customerData?.name) {
      return NextResponse.json({ success: false, error: 'Dados do cliente incompletos' }, { status: 400 })
    }

    const cpf = customerData.cpf.replace(/\D/g, '')

    // Find or create Asaas customer with complete data
    let asaasCustomer = await findCustomerByEmail(customerData.email)
    
    if (!asaasCustomer) {
      // Create new customer with all data
      asaasCustomer = await createCustomer(
        customerData.name,
        customerData.email,
        customerData.phone,
        cpf
      )
    } else {
      // Update existing customer with CPF if missing
      if (!asaasCustomer.cpfCnpj) {
        await updateCustomer(asaasCustomer.id, customerData.name, cpf)
      }
    }

    if (!asaasCustomer?.id) {
      return NextResponse.json({ success: false, error: 'Falha ao criar cliente Asaas' }, { status: 500 })
    }

    // Create payment
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 3)
    
    const payment = await createPayment(
      asaasCustomer.id,
      plan.price,
      dueDate.toISOString().split('T')[0],
      `Gestão E Salão - ${plan.label} - ${customerData.name}`,
      billingType || 'PIX'
    )

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        value: payment.value,
        dueDate: payment.dueDate,
        billingType: payment.billingType,
        pixQrCode: payment.pixQrCode,
        pixCopiaECola: payment.pixCopiaECola,
        boletoUrl: payment.boletoUrl,
        invoiceUrl: payment.invoiceUrl
      }
    })
  } catch (e: any) {
    console.error('Payment error:', e)
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
