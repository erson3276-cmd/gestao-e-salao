import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { createCustomer, findCustomerByEmail, createCheckout } from '@/lib/asaas'

const plans = {
  monthly: { price: 49, label: 'Plano Mensal' },
  semiannual: { price: 249.90, label: 'Plano Semestral' },
  annual: { price: 449.90, label: 'Plano Anual' },
}

export async function POST(request: Request) {
  try {
    const salonId = await getSalonId()
    if (!salonId) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })
    }

    const { salonId: bodySalonId, planId } = await request.json()
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

    let asaasCustomer = await findCustomerByEmail(salon.owner_email)
    
    if (!asaasCustomer) {
      asaasCustomer = await createCustomer(
        salon.owner_name,
        salon.owner_email,
        salon.owner_phone || undefined,
        salon.cpf_cnpj || undefined
      )
    }

    if (!asaasCustomer?.id) {
      return NextResponse.json({ success: false, error: 'Falha ao criar/obter cliente Asaas' }, { status: 500 })
    }

    const checkout = await createCheckout(
      asaasCustomer.id,
      salon.owner_name,
      salon.owner_email,
      salon.cpf_cnpj || '',
      [{ name: plan.label, value: plan.price }]
    )

    return NextResponse.json({
      success: true,
      checkoutUrl: checkout.url
    })
  } catch (e: any) {
    console.error('Checkout error:', e)
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

async function getSalonId() {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  const token = cookieStore.get('salon_session')?.value
  if (!token) return null
  
  try {
    const { data } = await supabaseAdmin
      .from('salons')
      .select('id')
      .eq('session_token', token)
      .single()
    return data?.id || null
  } catch {
    return null
  }
}
