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
  let session
  try {
    session = await getSalonSession()
  } catch (e) {
    // Allow health check without session
  }

  let body
  try {
    body = await request.json()
  } catch {
    body = {}
  }

  const { action, sessionId: sid } = body
  const sessionId = sid || (session ? `salon-${session.salonId.slice(0, 8)}` : 'default-salon')

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
    const { phone, message } = body
    const result = await apiFetch('/send', 'POST', {
      sessionId,
      phone,
      message
    })
    return NextResponse.json(result)
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}