import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'
import { getSalonId } from '@/lib/session'

export async function GET() {
  const salonId = await getSalonId()
  if (!salonId) return NextResponse.json({ data: [], success: true })

  try {
    let query = supabase.from('despesas').select('*').order('date', { ascending: false })
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
    const { description, amount, category, date, due_date, paid, recurring, recurrence_type, notes } = body

    if (!description || !amount) return NextResponse.json({ error: 'Descrição e valor são obrigatórios' }, { status: 400 })

    const targetSalonId = salonId === 'admin' ? (body.salon_id || null) : salonId

    const { data, error } = await supabase.from('despesas').insert([{
      description: description.trim(),
      amount: parseFloat(amount),
      category: category || 'Outros',
      date: date || new Date().toISOString().split('T')[0],
      due_date: due_date || null,
      paid: paid || false,
      recurring: recurring || false,
      recurrence_type: recurrence_type || null,
      notes: notes || null,
      paid_date: paid ? new Date().toISOString().split('T')[0] : null,
      salon_id: targetSalonId
    }]).select().single()

    if (error) throw error
    return NextResponse.json({ data, success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const salonId = await getSalonId()
  if (!salonId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const body = await request.json()
    const { id, ...updateData } = body
    if (!id) return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })

    if (updateData.amount !== undefined) updateData.amount = parseFloat(updateData.amount)
    if (updateData.description !== undefined) updateData.description = updateData.description.trim()
    if (updateData.paid !== undefined) {
      updateData.paid_date = updateData.paid ? new Date().toISOString().split('T')[0] : null
    }

    let query = supabase.from('despesas').update(updateData).eq('id', id)
    if (salonId !== 'admin') query = query.eq('salon_id', salonId)

    const { data, error } = await query.select().single()
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

    let query = supabase.from('despesas').delete().eq('id', id)
    if (salonId !== 'admin') query = query.eq('salon_id', salonId)

    const { error } = await query
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
