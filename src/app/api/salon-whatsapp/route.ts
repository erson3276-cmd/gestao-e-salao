import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getSalonSession } from '@/app/actions/salon-auth'
import { baileys } from '@/lib/baileys'

const API_URL = process.env.BAILEYS_API_URL || ''
const API_KEY = process.env.BAILEYS_API_KEY || ''

async function checkBaileysServer() {
  if (!API_URL) return { online: false, error: 'BAILEYS_API_URL não configurada' }
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(`${API_URL}/`, { 
      signal: controller.signal,
      cache: 'no-store'
    })
    clearTimeout(timeout)
    const text = await res.text()
    return { online: text.includes('Evolution API') || res.ok, status: res.status }
  } catch (e: any) {
    return { online: false, error: e.message }
  }
}

export async function GET() {
  const session = await getSalonSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: salon } = await supabaseAdmin
    .from('salons')
    .select('whatsapp_instance_id')
    .eq('id', session.salonId)
    .single()

  if (!salon?.whatsapp_instance_id) {
    return NextResponse.json({ connected: false, instanceId: null })
  }

  const status = await baileys.status(salon.whatsapp_instance_id)
  return NextResponse.json({ 
    instanceId: salon.whatsapp_instance_id,
    ...status
  })
}

export async function POST(request: Request) {
  const session = await getSalonSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { action, phone } = await request.json()
  const instanceName = `salon-${session.salonId.slice(0, 8)}`

  if (action === 'health') {
    const check = await checkBaileysServer()
    return NextResponse.json({ 
      server: API_URL,
      hasKey: !!API_KEY,
      ...check
    })
  }

  if (action === 'pairingCode') {
    if (!phone) return NextResponse.json({ error: 'Phone required' }, { status: 400 })
    
    const serverCheck = await checkBaileysServer()
    if (!serverCheck.online) {
      return NextResponse.json({ 
        success: false, 
        error: 'Servidor WhatsApp indisponível', 
        details: serverCheck.error || `Status: ${serverCheck.status}`
      }, { status: 503 })
    }
    
    try {
      const createResult = await baileys.createInstance(instanceName)
      console.log('Instance created:', createResult)
      
      await new Promise(r => setTimeout(r, 2000))
      
      const result = await baileys.pairingCode(instanceName, phone)
      
      await supabaseAdmin
        .from('salons')
        .update({ whatsapp_instance_id: instanceName })
        .eq('id', session.salonId)
      
      if (result.code) {
        return NextResponse.json({ success: true, code: result.code })
      }
      
      return NextResponse.json({ 
        success: false, 
        error: result.message || 'Erro ao gerar código',
        details: JSON.stringify(result)
      }, { status: 500 })
    } catch (e: any) {
      console.error('Pairing error:', e)
      return NextResponse.json({ 
        success: false, 
        error: 'Erro ao gerar código', 
        details: e.message 
      }, { status: 500 })
    }
  }

  if (action === 'connect') {
    const serverCheck = await checkBaileysServer()
    if (!serverCheck.online) {
      return NextResponse.json({ 
        success: false, 
        error: 'Servidor WhatsApp indisponível', 
        details: serverCheck.error || `Status: ${serverCheck.status}`,
        server: API_URL
      }, { status: 503 })
    }

    try {
      const createResult = await baileys.createInstance(instanceName)
      console.log('Instance created:', createResult)
      
      await new Promise(r => setTimeout(r, 3000))
      
      const qrResult = await baileys.qr(instanceName)
      
      if (!qrResult || !qrResult.qr) {
        return NextResponse.json({ 
          success: false, 
          error: qrResult?.message || 'QR Code não gerado', 
          details: 'Tente novamente em alguns segundos',
          instanceId: instanceName
        }, { status: 500 })
      }
      
      await supabaseAdmin
        .from('salons')
        .update({ whatsapp_instance_id: instanceName })
        .eq('id', session.salonId)
      
      return NextResponse.json({ success: true, qr: qrResult.qr })
    } catch (e: any) {
      return NextResponse.json({ 
        success: false, 
        error: 'Erro ao conectar', 
        details: e.message 
      }, { status: 500 })
    }
  }

  if (action === 'disconnect') {
    if (salon?.whatsapp_instance_id) {
      await baileys.disconnect(salon.whatsapp_instance_id)
    }
    await supabaseAdmin
      .from('salons')
      .update({ whatsapp_instance_id: null })
      .eq('id', session.salonId)
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
