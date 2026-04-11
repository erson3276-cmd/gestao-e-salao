import { NextResponse } from 'next/server'
import { getSalonSession } from '@/app/actions/salon-auth'

const WHATSAPP_API = process.env.WHATSAPP_API_URL || 'http://167.234.248.199:8083'

async function apiFetch(endpoint: string, method: string = 'GET', body?: any) {
  const options: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' }
  }
  if (body) options.body = JSON.stringify(body)

  try {
    const res = await fetch(`${WHATSAPP_API}${endpoint}`, options)
    return await res.json()
  } catch (e: any) {
    return { error: e.message }
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('sessionId')
  
  if (sessionId) {
    const status = await apiFetch(`/session/${sessionId}/status`)
    return NextResponse.json(status)
  }

  const health = await apiFetch('/health')
  return NextResponse.json(health)
}

export async function POST(request: Request) {
  const session = await getSalonSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { action, sessionId: sid } = await request.json()
  const sessionId = sid || `salon-${session.salonId.slice(0, 8)}`

  if (action === 'health') {
    const health = await apiFetch('/health')
    return NextResponse.json(health)
  }

  if (action === 'connect') {
    const result = await apiFetch(`/session/${sessionId}`, 'POST', { fetchQR: true })
    return NextResponse.json(result)
  }

  if (action === 'disconnect') {
    const result = await apiFetch(`/session/${sessionId}`, 'DELETE')
    return NextResponse.json(result)
  }

  if (action === 'sendMessage') {
    const { phone, message } = await request.json()
    const result = await apiFetch('/send', 'POST', {
      sessionId,
      phone,
      message
    })
    return NextResponse.json(result)
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
