const ASAAS_API_URL = process.env.ASAAS_API_URL || 'https://api.asaas.com/v3'
const ASAAS_API_KEY = process.env.ASAAS_API_KEY || ''

async function asaasFetch(endpoint: string, method: string = 'GET', body?: any) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'access_token': ASAAS_API_KEY
  }

  const options: RequestInit = { method, headers, cache: 'no-store' }
  if (body) options.body = JSON.stringify(body)

  const res = await fetch(`${ASAAS_API_URL}${endpoint}`, options)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Asaas API ${res.status}: ${text}`)
  }
  const ct = res.headers.get('content-type')
  return ct && ct.includes('application/json') ? res.json() : null
}

export async function createCustomer(name: string, email: string, phone?: string) {
  return asaasFetch('/customers', 'POST', {
    name, email, mobilePhone: phone || undefined
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

export async function createPayment(customerId: string, value: number, dueDate: string, description: string, billingType: 'PIX' | 'CREDIT_CARD' | 'BOLETO' = 'PIX') {
  const data = await asaasFetch('/payments', 'POST', {
    customer: customerId,
    billingType,
    value,
    dueDate,
    description,
    cycle: 'NONE'
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

export async function createPlan(name: string, value: number, cycle: 'MONTHLY' | 'SEMESTERLY' | 'YEARLY') {
  return asaasFetch('/plans', 'POST', {
    name,
    value,
    cycle,
    active: true
  })
}
