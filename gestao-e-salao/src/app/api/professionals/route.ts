import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'
import { getSalonId } from '@/lib/session'

export async function GET() {
  const salonId = await getSalonId()
  if (!salonId) return NextResponse.json({ professionals: [] })

  try {
    let query = supabase.from('professionals').select('*').order('name', { ascending: true })
    if (salonId !== 'admin') query = query.eq('salon_id', salonId)
    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ professionals: data || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const salonId = await getSalonId()
  if (!salonId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const body = await request.json()
    const { id, name, commission_percent, whatsapp } = body
    if (id) {
      const { data, error } = await supabase.from('professionals').update({ name, commission_percent, whatsapp }).eq('id', id).select().single()
      if (error) throw error
      return NextResponse.json({ success: true, data })
    } else {
      const { data, error } = await supabase.from('professionals').insert([{ name, commission_percent, whatsapp, salon_id: salonId === 'admin' ? null : salonId }]).select().single()
      if (error) throw error
      return NextResponse.json({ success: true, data })
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const salonId = await getSalonId()
  if (!salonId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    let query = supabase.from('professionals').delete().eq('id', id)
    if (salonId !== 'admin') query = query.eq('salon_id', salonId)
    const { error } = await query
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
