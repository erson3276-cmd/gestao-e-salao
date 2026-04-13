import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'
import { getSalonId } from '@/lib/session'

export async function GET() {
  const salonId = await getSalonId()
  if (!salonId) return NextResponse.json({ success: true, data: [] })

  try {
    let query = supabase.from('blocked_slots').select('*').order('date', { ascending: true })
    if (salonId !== 'admin') query = query.eq('salon_id', salonId)
    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ success: true, data: data || [] })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const salonId = await getSalonId()
  if (!salonId) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })

  try {
    const body = await request.json()
    const { data, error } = await supabase.from('blocked_slots').insert({ date: body.date, start_time: body.start_time, end_time: body.end_time, salon_id: salonId === 'admin' ? null : salonId }).select().single()
    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const salonId = await getSalonId()
  if (!salonId) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })
    let query = supabase.from('blocked_slots').delete().eq('id', id)
    if (salonId !== 'admin') query = query.eq('salon_id', salonId)
    const { error } = await query
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
