import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabaseAdmin'
import { cookies } from 'next/headers'
import { SALON_COOKIE_NAME } from '../../../lib/auth'

async function getSalonId() {
  const cookieStore = await cookies()
  const session = cookieStore.get(SALON_COOKIE_NAME)
  if (session?.value) {
    try {
      const data = JSON.parse(session.value)
      return data.salonId
    } catch { return null }
  }
  return null
}

export async function GET() {
  try {
    const salonId = await getSalonId()
    let query = supabaseAdmin
      .from('appointments')
      .select('*, customers:customer_id(name, whatsapp), services:service_id(name, price, duration_minutes)')
      .order('start_time', { ascending: true })
    if (salonId) query = query.eq('salon_id', salonId)
    const { data, error } = await query
    if (error) return NextResponse.json({ data: [], error: error.message })
    return NextResponse.json({ data: data || [] })
  } catch (e) {
    return NextResponse.json({ data: [], error: 'Erro ao buscar agendamentos' })
  }
}

export async function POST(request: Request) {
  try {
    const salonId = await getSalonId()
    const body = await request.json()
    const insertData = salonId ? { ...body, salon_id: salonId } : body
    const { data, error } = await supabaseAdmin
      .from('appointments')
      .insert([insertData])
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao criar agendamento' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body
    const salonId = await getSalonId()
    let query = supabaseAdmin.from('appointments').update(updateData).eq('id', id)
    if (salonId) query = query.eq('salon_id', salonId)
    const { data, error } = await query.select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao atualizar agendamento' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID necessário' }, { status: 400 })
    const salonId = await getSalonId()
    let query = supabaseAdmin.from('appointments').delete().eq('id', id)
    if (salonId) query = query.eq('salon_id', salonId)
    const { error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao excluir agendamento' }, { status: 500 })
  }
}
