import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { createCustomer, findCustomerByEmail, createPaymentWithCreditCard, updateCustomer } from '@/lib/asaas'
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

    const { planId, creditCard } = await request.json()
    const plan = plans[planId as keyof typeof plans]
    
    if (!plan) {
      return NextResponse.json({ success: false, error: 'Plano inválido' }, { status: 400 })
    }

    if (!creditCard || !creditCard.holderName || !creditCard.number || !creditCard.expiryDate || !creditCard.cvv) {
      return NextResponse.json({ success: false, error: 'Dados do cartão inválidos' }, { status: 400 })
    }

    const { data: salon, error: salonError } = await supabaseAdmin
      .from('salons')
      .select('*')
      .eq('id', salonId)
      .single()

    if (salonError || !salon) {
      return NextResponse.json({ success: false, error: 'Salão não encontrado' }, { status: 404 })
    }

    let asaasCustomer = await findCustomerByEmail(salon.owner_email)
    if (!asaasCustomer) {
      asaasCustomer = await createCustomer(
        salon.owner_name,
        salon.owner_email,
        salon.owner_phone || undefined,
        salon.cpf_cnpj || undefined
      )
    }

    const dueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const payment = await createPaymentWithCreditCard(
      asaasCustomer.id,
      plan.price,
      dueDate,
      `Gestão E Salão - ${plan.label}`,
      creditCard,
      {
        cpfCnpj: salon.cpf_cnpj || undefined,
        email: salon.owner_email,
        name: salon.owner_name,
        phone: salon.owner_phone || undefined
      }
    )

    if (payment.errors) {
      const errorMessage = payment.errors.map((e: any) => e.description).join(', ')
      return NextResponse.json({ success: false, error: errorMessage }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        value: payment.value,
        dueDate: payment.dueDate,
        billingType: 'CONFIRMED'
      }
    })
  } catch (e: any) {
    console.error('Payment error:', e)
    return NextResponse.json({ success: false, error: e.message || 'Erro ao processar pagamento' }, { status: 500 })
  }
}