import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { SALON_COOKIE_NAME, hashPassword, type SalonSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { createCustomer, findCustomerByEmail, createCheckout } from '@/lib/asaas'

const plans = {
  monthly: { price: 49, label: 'Plano Mensal', months: 1 },
  semiannual: { price: 249.90, label: 'Plano Semestral', months: 6 },
  annual: { price: 449.90, label: 'Plano Anual', months: 12 },
}

export async function POST(request: Request) {
  try {
    const { planId } = await request.json()
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

    // Create checkout payment with Asaas checkout
    const checkout = await createCheckout(
      asaasCustomer.id,
      tempData.salonName,
      tempData.ownerEmail,
      tempData.ownerCpf || '',
      [{ name: plan.label, value: plan.price }]
    )

    if (!checkout || !checkout.checkoutUrl) {
      return NextResponse.json({ success: false, error: 'Erro ao criar pagamento. Tente novamente.' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      checkoutUrl: checkout.checkoutUrl
    })
  } catch (e: any) {
    console.error('Checkout error:', e)
    return NextResponse.json({ success: false, error: 'Erro: ' + e.message }, { status: 500 })
  }
}
