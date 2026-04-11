import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { createCustomer, findCustomerByEmail, createPayment, updateCustomer } from '@/lib/asaas'
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

    const { salonId: bodySalonId, planId, billingType, cpf } = await request.json()
    const plan = plans[planId as keyof typeof plans]
    
    if (!plan) {
      return NextResponse.json({ success: false, error: 'Plano inválido' }, { status: 400 })
    }
    
    if ((billingType === 'PIX' || billingType === 'BOLETO') && !cpf) {
      return NextResponse.json({ success: false, error: 'CPF é obrigatório para PIX e Boleto' }, { status: 400 })
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
    console.log('Looking for customer:', salon.owner_email)
    let asaasCustomer = await findCustomerByEmail(salon.owner_email)
    console.log('Found customer:', asaasCustomer)
    
    const ownerCpf = cpf || salon.cpf_cnpj
    
    if (!asaasCustomer) {
      console.log('Creating new customer for:', salon.owner_email)
      asaasCustomer = await createCustomer(
        salon.owner_name,
        salon.owner_email,
        salon.owner_phone || undefined,
        ownerCpf || undefined
      )
      console.log('Created customer:', asaasCustomer)
    } else if (ownerCpf && !asaasCustomer.cpfCnpj) {
      // Update customer with CPF if not set
      await updateCustomer(asaasCustomer.id, salon.owner_name, ownerCpf)
      asaasCustomer.cpfCnpj = ownerCpf
    }

    if (!asaasCustomer?.id) {
      return NextResponse.json({ success: false, error: 'Falha ao criar/obter cliente Asaas' }, { status: 500 })
    }

    // Create payment
    const dueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    console.log('Creating payment:', { customerId: asaasCustomer.id, billingType: billingType || 'PIX', planPrice: plan.price, dueDate })
    const payment = await createPayment(
      asaasCustomer.id,
      plan.price,
      dueDate,
      `Gestão E Salão - ${plan.label}`,
      billingType || 'PIX'
    )
    console.log('Payment created:', payment)

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
    console.error('Payment error:', e)
    return NextResponse.json({ success: false, error: e.message, details: e.stack }, { status: 500 })
  }
}
