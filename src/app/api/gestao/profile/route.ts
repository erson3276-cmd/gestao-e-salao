import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getSalonSession } from '@/app/actions/salon-auth'

export async function GET() {
  const session = await getSalonSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: salon, error } = await supabaseAdmin
    .from('salons')
    .select('*')
    .eq('id', session.salonId)
    .single()

  if (error || !salon) {
    return NextResponse.json({ error: 'Salão não encontrado' }, { status: 404 })
  }

  return NextResponse.json({
    profile: {
      id: salon.id,
      salon_id: salon.id,
      name: salon.name || '',
      professional_name: salon.owner_name || '',
      whatsapp_number: salon.whatsapp_number || salon.owner_phone || '',
      address: salon.address || '',
      image_url: salon.image_url || '',
      opening_time: '09:00',
      closing_time: '18:00',
      slot_interval: 30
    }
  })
}

export async function POST(request: Request) {
  const session = await getSalonSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await request.json()

  const { error } = await supabaseAdmin
    .from('salons')
    .update({
      name: data.name || data.salonName || session.salonName,
      owner_name: data.professional_name || data.owner_name,
      whatsapp_number: data.whatsapp_number,
      address: data.address,
      image_url: data.image_url,
      updated_at: new Date().toISOString()
    })
    .eq('id', session.salonId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
