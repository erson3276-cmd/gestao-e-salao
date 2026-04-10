import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getSalonSession } from '@/app/actions/salon-auth'
import { whatsappManager } from '@/lib/whatsapp-manager'

const WHATSAPP_API = process.env.WHATSAPP_API_URL || 'http://167.234.248.199:8083'

async function checkWhatsAppServer() {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(`${WHATSAPP_API}/health`, { 
      signal: controller.signal,
      cache: 'no-store'
    })
    clearTimeout(timeout)
    const data = await res.json()
    return { online: data.status === 'ok', status: data }
  } catch (e: any) {
    return { online: false, error: e.message }
  }
}

function getSessionId(salonId: string) {
  return `salon-${salonId.slice(0, 8)}`
}

export async function GET() {
  const session = await getSalonSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: salon } = await supabaseAdmin
    .from('salons')
    .select('id, whatsapp_instance_id')
    .eq('id', session.salonId)
    .single()

  const sessionId = salon?.whatsapp_instance_id || getSessionId(session.salonId)
  const status = await whatsappManager.status(sessionId)
  
  return NextResponse.json({ 
    instanceId: sessionId,
    connected: status.connected
  })
}

export async function POST(request: Request) {
  const session = await getSalonSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { action, phone, message } = await request.json()
  const salonId = session.salonId
  const sessionId = getSessionId(salonId)

  if (action === 'health') {
    const check = await checkWhatsAppServer()
    return NextResponse.json({ 
      server: WHATSAPP_API,
      online: check.online
    })
  }

  if (action === 'connect') {
    const serverCheck = await checkWhatsAppServer()
    if (!serverCheck.online) {
      return NextResponse.json({ 
        success: false, 
        error: 'Servidor WhatsApp indisponível',
        details: serverCheck.error
      }, { status: 503 })
    }

    try {
      const result = await whatsappManager.createSession(sessionId)
      
      await supabaseAdmin
        .from('salons')
        .update({ whatsapp_instance_id: sessionId })
        .eq('id', salonId)

      if (result.qr) {
        return NextResponse.json({ success: true, qr: result.qr })
      }
      
      return NextResponse.json({ success: true, status: result.status })
    } catch (e: any) {
      return NextResponse.json({ success: false, error: e.message }, { status: 500 })
    }
  }

  if (action === 'sendMessage') {
    if (!phone || !message) {
      return NextResponse.json({ error: 'Phone and message required' }, { status: 400 })
    }

    try {
      const result = await whatsappManager.sendText(sessionId, phone, message)
      return NextResponse.json({ success: !result.error, ...result })
    } catch (e: any) {
      return NextResponse.json({ success: false, error: e.message }, { status: 500 })
    }
  }

  if (action === 'disconnect') {
    try {
      await whatsappManager.disconnect(sessionId)
      await supabaseAdmin
        .from('salons')
        .update({ whatsapp_instance_id: null })
        .eq('id', salonId)
      return NextResponse.json({ success: true })
    } catch (e: any) {
      return NextResponse.json({ success: false, error: e.message }, { status: 500 })
    }
  }

  if (action === 'getQR') {
    try {
      const result = await whatsappManager.qr(sessionId)
      return NextResponse.json(result)
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 })
    }
  }

  if (action === 'pairingCode') {
    if (!phone) {
      return NextResponse.json({ error: 'Phone required' }, { status: 400 })
    }

    try {
      const cleanPhone = phone.replace(/\D/g, '')
      const res = await fetch(`${WHATSAPP_API}/pairing/${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone })
      })
      const result = await res.json()
      
      await supabaseAdmin
        .from('salons')
        .update({ whatsapp_instance_id: sessionId })
        .eq('id', salonId)

      return NextResponse.json(result)
    } catch (e: any) {
      return NextResponse.json({ success: false, error: e.message }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
