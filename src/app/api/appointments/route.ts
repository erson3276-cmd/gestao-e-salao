import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'
import { getSalonSession } from '@/app/actions/salon-auth'

export async function GET() {
  const session = await getSalonSession()
  if (!session) return NextResponse.json({ data: [], success: true })

  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        customers:customer_id(id, name, whatsapp),
        services:service_id(id, name, price, duration_minutes)
      `)
      .eq('salon_id', session.salonId)
      .order('start_time', { ascending: true })
    
    if (error) throw error
    
    return NextResponse.json({ data: data || [], success: true })
  } catch (error: any) {
    console.error('Erro ao buscar agendamentos:', error)
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getSalonSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { customer_id, service_id, start_time, end_time, status } = body
    
    if (!customer_id || !service_id || !start_time || !end_time) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
    }
    
    const { data: conflicts } = await supabase
      .from('appointments')
      .select('id')
      .eq('salon_id', session.salonId)
      .neq('status', 'cancelado')
      .or(`and(start_time.lte.${start_time},end_time.gt.${start_time}),and(start_time.lt.${end_time},end_time.gte.${end_time})`)
    
    if (conflicts && conflicts.length > 0) {
      return NextResponse.json({ error: 'Horário já reservado' }, { status: 400 })
    }
    
    const { data, error } = await supabase
      .from('appointments')
      .insert([{ customer_id, service_id, start_time, end_time, status: status || 'agendado', salon_id: session.salonId }])
      .select(`
        *,
        customers:customer_id(id, name, whatsapp),
        services:service_id(id, name, price, duration_minutes)
      `)
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ data, success: true })
  } catch (error: any) {
    console.error('Erro ao criar agendamento:', error)
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const session = await getSalonSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id)
      .eq('salon_id', session.salonId)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
