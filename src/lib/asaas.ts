let ASAAS_API_URL = process.env.ASAAS_API_URL || 'https://api.asaas.com/v3'
const ASAAS_API_KEY = process.env.ASAAS_API_KEY || ''

// Fix base64 encoded URLs
if (ASAAS_API_URL.includes('aHR0c') || ASAAS_API_URL.includes('base64')) {
  try {
    ASAAS_API_URL = Buffer.from(ASAAS_API_URL, 'base64').toString('utf-8')
  } catch {
    ASAAS_API_URL = 'https://api.asaas.com/v3'
  }
}

async function asaasFetch(endpoint: string, method: string = 'GET', body?: any) {
  if (!ASAAS_API_KEY) {
    throw new Error('ASAAS_API_KEY não configurada')
  }
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': 'GestaoESalao/1.0',
    'access_token': ASAAS_API_KEY
  }

  const options: RequestInit = { method, headers, cache: 'no-store' }
  if (body) options.body = JSON.stringify(body)

  const url = `${ASAAS_API_URL}${endpoint}`
  console.log('Asaas request:', method, url)
  
  const res = await fetch(url, options)
  
  if (!res.ok) {
    const text = await res.text()
    console.error('Asaas error:', res.status, text)
    throw new Error(`Asaas API ${res.status}: ${text}`)
  }
  const ct = res.headers.get('content-type')
  return ct && ct.includes('application/json') ? res.json() : null
}

export async function createCustomer(name: string, email: string, phone?: string, cpfCnpj?: string) {
  return asaasFetch('/customers', 'POST', {
    name, email, mobilePhone: phone || undefined,
    cpfCnpj: cpfCnpj || undefined
  })
}

export async function updateCustomer(customerId: string, name?: string, cpfCnpj?: string) {
  return asaasFetch(`/customers/${customerId}`, 'POST', {
    name: name || undefined,
    cpfCnpj: cpfCnpj || undefined
  })
}

export async function findCustomerByEmail(email: string) {
  const data = await asaasFetch(`/customers?email=${encodeURIComponent(email)}`)
  return data?.data?.[0] || null
}

export async function createSubscription(customerId: string, planId: string) {
  return asaasFetch('/subscriptions', 'POST', {
    customer: customerId,
    plan: planId
  })
}

export async function createPayment(customerId: string, value: number, dueDate: string, description: string, billingType: 'PIX' | 'CREDIT_CARD' | 'BOLETO' = 'PIX', cpf?: string) {
  console.log('Creating payment with:', { customerId, billingType, value, dueDate, description, cpf })
  const data = await asaasFetch('/payments', 'POST', {
    customer: customerId,
    billingType,
    value,
    dueDate,
    description,
    cycle: 'NONE',
    cpf: cpf || undefined
  })
  console.log('Asaas payment response:', data)
  return data
}

export async function createPaymentWithCreditCard(customerId: string, value: number, dueDate: string, description: string, creditCard: { holderName: string, number: string, expiryDate: string, cvv: string }, creditCardHolderInfo?: { cpfCnpj?: string, email?: string, name?: string, phone?: string }) {
  const data = await asaasFetch('/payments', 'POST', {
    customer: customerId,
    billingType: 'CREDIT_CARD',
    value,
    dueDate,
    description,
    cycle: 'NONE',
    creditCard: {
      holderName: creditCard.holderName,
      number: creditCard.number.replace(/\s/g, ''),
      expiryDate: creditCard.expiryDate,
      cvv: creditCard.cvv
    },
    creditCardHolderInfo: creditCardHolderInfo || undefined
  })
  return data
}

export async function createRecurringSubscription(customerId: string, value: number, description: string, cycle: 'MONTHLY' | 'SEMESTERLY' | 'YEARLY' = 'MONTHLY') {
  const today = new Date()
  const dueDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  
  return asaasFetch('/subscriptions', 'POST', {
    customer: customerId,
    billingType: 'CREDIT_CARD',
    value,
    cycle,
    description,
    dueDate,
    discount: null,
    interest: null,
    fine: null
  })
}

export async function getPayment(paymentId: string) {
  return asaasFetch(`/payments/${paymentId}`)
}

export async function getSubscriptions() {
  return asaasFetch('/subscriptions')
}

export async function createCheckout(customerId: string, name: string, email: string, cpfCnpj: string, items: {name: string, value: number}[]) {
  return asaasFetch('/checkouts', 'POST', {
    chargeTypes: 'PIX,CREDIT_CARD,BOLETO',
    billingTypes: 'PIX,CREDIT_CARD,BOLETO',
    customer: customerId,
    items: items.map(item => ({
      name: item.name,
      quantity: 1,
      value: item.value
    })),
    callback: {
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`
    }
  })
}

export async function getPixQrCode(paymentId: string) {
  const data = await asaasFetch(`/payments/${paymentId}/pixQrCode`)
  return data
}

export async function refundPayment(paymentId: string, value?: number, reason?: string) {
  return asaasFetch('/refunds', 'POST', {
    payment: paymentId,
    value: value || undefined,
    reason: reason || undefined
  })
}
