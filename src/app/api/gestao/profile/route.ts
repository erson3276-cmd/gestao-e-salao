import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getSalonSession } from '@/app/actions/salon-auth'

export async function GET() {
  const session = await getSalonSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Try profiles table first
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('salon_id', session.salonId)
    .single()

  if (profile) {
    return NextResponse.json({ profile })
  }

  // Fallback: get data from salons table
  const { data: salon } = await supabaseAdmin
    .from('salons')
    .select('*')
    .eq('id', session.salonId)
    .single()

  if (salon) {
    return NextResponse.json({
      profile: {
        id: salon.id,
        salon_id: salon.id,
        name: salon.name,
        professional_name: salon.owner_name,
        whatsapp_number: salon.whatsapp_number || salon.owner_phone,
        address: salon.address,
        image_url: salon.image_url,
        opening_time: '09:00',
        closing_time: '18:00',
        slot_interval: 30
      }
    })
  }

  return NextResponse.json({ profile: null })
}

export async function POST(request: Request) {
  const session = await getSalonSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const data = await request.json()

  // Update salons table
  const { error: salonError } = await supabaseAdmin
    .from('salons')
    .update({
      name: data.name || data.salonName,
      whatsapp_number: data.whatsapp_number,
      address: data.address,
      image_url: data.image_url,
      updated_at: new Date().toISOString()
    })
    .eq('id', session.salonId)

  if (salonError) {
    return NextResponse.json({ error: salonError.message }, { status: 500 })
  }

  // Try to update profiles table if it exists
  try {
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('salon_id', session.salonId)
      .single()

    if (existingProfile) {
      await supabaseAdmin
        .from('profiles')
        .update({
          name: data.name,
          professional_name: data.professional_name,
          whatsapp_number: data.whatsapp_number,
          address: data.address,
          image_url: data.image_url,
          opening_time: data.opening_time,
          closing_time: data.closing_time,
          slot_interval: data.slot_interval,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingProfile.id)
      } else {
        await supabaseAdmin
          .from('profiles')
          .insert([{
            salon_id: session.salonId,
            name: data.name,
            professional_name: data.professional_name,
            whatsapp_number: data.whatsapp_number,
            address: data.address,
            image_url: data.image_url,
            opening_time: data.opening_time || '09:00',
            closing_time: data.closing_time || '18:00',
            slot_interval: data.slot_interval || 30
          }])
      }
    } catch {
      // profiles table may not exist, that's ok
    }

  return NextResponse.json({ success: true })
}
