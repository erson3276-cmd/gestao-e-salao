import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getSalonId } from '@/lib/session'

export async function GET() {
  const salonId = await getSalonId()
  if (!salonId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // If admin, get the first active salon (or the one from session)
  const targetId = salonId === 'admin' ? null : salonId

  let query = supabaseAdmin.from('salons').select('*')
  if (targetId) {
    query = query.eq('id', targetId)
  } else {
    query = query.eq('status', 'active').order('created_at', { ascending: false }).limit(1)
  }

  const { data: salons, error } = await query

  if (error || !salons || salons.length === 0) {
    return NextResponse.json({ error: 'Salão não encontrado' }, { status: 404 })
  }

  const salon = salons[0]

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
  const salonId = await getSalonId()
  if (!salonId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await request.json()
  const targetId = salonId === 'admin' ? (data.id || data.salon_id) : salonId

  if (!targetId) {
    return NextResponse.json({ error: 'Salão não identificado' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('salons')
    .update({
      name: data.name || data.salonName,
      owner_name: data.professional_name || data.owner_name,
      whatsapp_number: data.whatsapp_number,
      address: data.address,
      image_url: data.image_url,
      updated_at: new Date().toISOString()
    })
    .eq('id', targetId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
