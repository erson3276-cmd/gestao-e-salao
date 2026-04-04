import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'
import { getSalonId } from '@/lib/session'

export async function GET() {
  const salonId = await getSalonId()
  if (!salonId) return NextResponse.json({ success: true, data: [] })

  try {
    let query = supabase.from('working_hours').select('*').order('day_of_week', { ascending: true })
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
    const { day_of_week, start_time, end_time, is_active } = body
    
    let existingQuery = supabase.from('working_hours').select('id').eq('day_of_week', day_of_week)
    if (salonId !== 'admin') existingQuery = existingQuery.eq('salon_id', salonId)
    const { data: existing } = await existingQuery.single()
    
    let result
    if (existing) {
      const { data, error } = await supabase.from('working_hours').update({ start_time, end_time, is_active }).eq('day_of_week', day_of_week).select().single()
      if (error) throw error
      result = data
    } else {
      const { data, error } = await supabase.from('working_hours').insert([{ day_of_week, start_time, end_time, is_active, salon_id: salonId === 'admin' ? null : salonId }]).select().single()
      if (error) throw error
      result = data
    }
    
    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
