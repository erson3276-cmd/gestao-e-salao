import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'
import { getSalonId } from '@/lib/session'

export async function GET() {
  const salonId = await getSalonId()
  if (!salonId) return NextResponse.json({ data: [], success: true })

  try {
    let query = supabase.from('appointments').select('*, customers:customer_id(id, name, whatsapp), services:service_id(id, name, price, duration_minutes)').order('start_time', { ascending: true })
    if (salonId !== 'admin') query = query.eq('salon_id', salonId)
    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ data: data || [], success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const salonId = await getSalonId()
  if (!salonId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const body = await request.json()
    const { customer_id, service_id, start_time, end_time, status } = body
    if (!customer_id || !service_id || !start_time || !end_time) return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
    
    let conflictQuery = supabase.from('appointments').select('id').neq('status', 'cancelado').or(`and(start_time.lte.${start_time},end_time.gt.${start_time}),and(start_time.lt.${end_time},end_time.gte.${end_time})`)
    if (salonId !== 'admin') conflictQuery = conflictQuery.eq('salon_id', salonId)
    const { data: conflicts } = await conflictQuery
    if (conflicts && conflicts.length > 0) return NextResponse.json({ error: 'Horário já reservado' }, { status: 400 })
    
    const { data, error } = await supabase.from('appointments').insert([{ customer_id, service_id, start_time, end_time, status: status || 'agendado', salon_id: salonId === 'admin' ? null : salonId }]).select('*, customers:customer_id(id, name, whatsapp), services:service_id(id, name, price, duration_minutes)').single()
    if (error) throw error
    return NextResponse.json({ data, success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const salonId = await getSalonId()
  if (!salonId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    let query = supabase.from('appointments').delete().eq('id', id)
    if (salonId !== 'admin') query = query.eq('salon_id', salonId)
    const { error } = await query
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
