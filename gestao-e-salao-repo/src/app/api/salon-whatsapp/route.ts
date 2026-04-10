import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getSalonSession } from '@/app/actions/salon-auth'
import { whatsappManager } from '@/lib/whatsapp-manager'

const API_URL = process.env.EVOLUTION_API_URL || 'http://167.234.248.199:8082'
const API_KEY = process.env.EVOLUTION_API_KEY || 'salao2024'

async function checkEvolutionServer() {
  if (!API_URL) return { online: false, error: 'EVOLUTION_API_URL não configurada' }
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(`${API_URL}/instance/connectionState/health-check`, { 
      signal: controller.signal,
      cache: 'no-store'
    })
    clearTimeout(timeout)
    return { online: res.ok, status: res.status, url: API_URL }
  } catch (e: any) {
    return { online: false, error: e.message, url: API_URL }
  }
}

export async function GET() {
  const session = await getSalonSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: salon } = await supabaseAdmin
    .from('salons')
    .select('id, whatsapp_instance_id')
    .eq('id', session.salonId)
    .single()

  if (!salon?.whatsapp_instance_id) {
    return NextResponse.json({ connected: false, instanceId: null })
  }

  const status = await whatsappManager.status(session.salonId)
  return NextResponse.json({ 
    instanceId: salon.whatsapp_instance_id,
    ...status
  })
}

export async function POST(request: Request) {
  const session = await getSalonSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { action, phone, message } = await request.json()
  const salonId = session.salonId

  if (action === 'health') {
    const check = await checkEvolutionServer()
    return NextResponse.json({ 
      server: API_URL,
      hasKey: !!API_KEY,
      ...check
    })
  }

  if (action === 'createInstance') {
    try {
      const result = await whatsappManager.createInstance(salonId)
      return NextResponse.json({ success: true, ...result })
    } catch (e: any) {
      return NextResponse.json({ success: false, error: e.message }, { status: 500 })
    }
  }

  if (action === 'connect') {
    const serverCheck = await checkEvolutionServer()
    if (!serverCheck.online) {
      return NextResponse.json({ 
        success: false, 
        error: 'Servidor WhatsApp indisponível', 
        details: serverCheck.error
      }, { status: 503 })
    }

    try {
      const { data: salon } = await supabaseAdmin
        .from('salons')
        .select('whatsapp_instance_id')
        .eq('id', salonId)
        .single()

      if (!salon?.whatsapp_instance_id) {
        await whatsappManager.createInstance(salonId)
        await new Promise(r => setTimeout(r, 2000))
      }

      const result = await whatsappManager.connect(salonId)
      
      const instanceName = `salon-${salonId.slice(0, 8)}`
      await supabaseAdmin
        .from('salons')
        .update({ whatsapp_instance_id: instanceName })
        .eq('id', salonId)

      if (result.qr) {
        return NextResponse.json({ success: true, qr: result.qr })
      }
      if (result.code) {
        return NextResponse.json({ success: true, code: result.code })
      }
      if (result.connected) {
        return NextResponse.json({ success: true, connected: true })
      }
      
      return NextResponse.json({ success: false, ...result })
    } catch (e: any) {
      return NextResponse.json({ success: false, error: e.message }, { status: 500 })
    }
  }

  if (action === 'pairingCode') {
    if (!phone) return NextResponse.json({ error: 'Phone required' }, { status: 400 })
    
    const serverCheck = await checkEvolutionServer()
    if (!serverCheck.online) {
      return NextResponse.json({ 
        success: false, 
        error: 'Servidor indisponível'
      }, { status: 503 })
    }

    try {
      const { data: salon } = await supabaseAdmin
        .from('salons')
        .select('whatsapp_instance_id')
        .eq('id', salonId)
        .single()

      if (!salon?.whatsapp_instance_id) {
        await whatsappManager.createInstance(salonId)
        await new Promise(r => setTimeout(r, 2000))
      }

      const result = await whatsappManager.pairingCode(salonId, phone)
      
      const instanceName = `salon-${salonId.slice(0, 8)}`
      await supabaseAdmin
        .from('salons')
        .update({ whatsapp_instance_id: instanceName })
        .eq('id', salonId)

      if (result.code) {
        return NextResponse.json({ success: true, code: result.code })
      }
      
      return NextResponse.json({ success: false, ...result })
    } catch (e: any) {
      return NextResponse.json({ success: false, error: e.message }, { status: 500 })
    }
  }

  if (action === 'sendMessage') {
    const { phone, message } = await request.json()
    
    if (!phone || !message) {
      return NextResponse.json({ error: 'Phone and message required' }, { status: 400 })
    }

    const { data: salon } = await supabaseAdmin
      .from('salons')
      .select('whatsapp_instance_id')
      .eq('id', salonId)
      .single()

    if (!salon?.whatsapp_instance_id) {
      return NextResponse.json({ success: false, error: 'WhatsApp não conectado' }, { status: 400 })
    }

    try {
      const result = await whatsappManager.sendText(salonId, phone, message)
      return NextResponse.json({ success: !result.error, ...result })
    } catch (e: any) {
      return NextResponse.json({ success: false, error: e.message }, { status: 500 })
    }
  }

  if (action === 'disconnect') {
    try {
      await whatsappManager.disconnect(salonId)
      await supabaseAdmin
        .from('salons')
        .update({ whatsapp_instance_id: null })
        .eq('id', salonId)
      return NextResponse.json({ success: true })
    } catch (e: any) {
      return NextResponse.json({ success: false, error: e.message }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
