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

  const { action } = await request.json()
  const instanceId = `salon-${session.salonId}`

  if (action === 'connect') {
    const result = await baileys.connect(instanceId)
    
    await supabaseAdmin
      .from('salons')
      .update({ whatsapp_instance_id: instanceId })
      .eq('id', session.salonId)

    const qr = await baileys.qr(instanceId)
    return NextResponse.json({ success: true, qr: qr?.qr, pairingCode: qr?.pairingCode })
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
