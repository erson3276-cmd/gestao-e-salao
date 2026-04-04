import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getSalonSession } from '@/app/actions/salon-auth'
import { baileys } from '@/lib/baileys'

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
    connected: status.connected === true,
    instanceId: salon.whatsapp_instance_id,
    ...status
  })
}

export async function POST(request: Request) {
  const session = await getSalonSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { action, phone } = await request.json()
  const instanceId = `salon-${session.salonId}`

  if (action === 'connect') {
    await baileys.connect(instanceId)
    
    await supabaseAdmin
      .from('salons')
      .update({ whatsapp_instance_id: instanceId })
      .eq('id', session.salonId)

    const qr = await baileys.qr(instanceId)
    return NextResponse.json({ success: true, qr: qr?.qr, pairingCode: qr?.pairingCode })
  }

  if (action === 'pairingCode') {
    if (!phone) return NextResponse.json({ error: 'Phone required' }, { status: 400 })
    
    await baileys.connect(instanceId)
    await supabaseAdmin
      .from('salons')
      .update({ whatsapp_instance_id: instanceId })
      .eq('id', session.salonId)

    const result = await baileys.pairingCode(instanceId, phone)
    return NextResponse.json({ success: true, code: result?.code })
  }

  if (action === 'disconnect') {
    await baileys.disconnect(instanceId)
    await supabaseAdmin
      .from('salons')
      .update({ whatsapp_instance_id: null })
      .eq('id', session.salonId)
    return NextResponse.json({ success: true })
  }

  if (action === 'qr') {
    const qr = await baileys.qr(instanceId)
    return NextResponse.json({ qr: qr?.qr, pairingCode: qr?.pairingCode })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
