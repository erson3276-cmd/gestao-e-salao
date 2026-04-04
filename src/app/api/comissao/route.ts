import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'
import { cookies } from 'next/headers'

async function getSalonId(): Promise<string | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get('salon_session')
  if (session) {
    try { return JSON.parse(session.value).salonId } catch {}
  }
  const adminAuth = cookieStore.get('admin_auth')
  if (adminAuth?.value === 'authenticated') return null
  const superAdmin = cookieStore.get('super_admin_session')
  if (superAdmin?.value === 'authenticated') return null
  return null
}

export async function GET() {
  try {
    const salonId = await getSalonId()
    let query = supabase.from('comissao').select('*')
    if (salonId) query = query.eq('salon_id', salonId)
    const { data, error } = await query.order('date', { ascending: false })
    
    if (error) throw error
    
    return Response.json({ data: data || [], success: true })
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { vendor_name, sale_amount, percentage, date } = body
    const comission_amount = sale_amount * (percentage / 100)
    const salonId = await getSalonId()
    
    const insertData = salonId ? { vendor_name, sale_amount, percentage, comission_amount, date, salon_id: salonId } : { vendor_name, sale_amount, percentage, comission_amount, date }
    
    const { data, error } = await supabase
      .from('comissao')
      .insert([insertData])
      .select()
    
    if (error) throw error
    
    return Response.json({ data, success: true })
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, paid } = body
    const salonId = await getSalonId()
    
    let query = supabase.from('comissao').update({ paid }).eq('id', id)
    if (salonId) query = query.eq('salon_id', salonId)
    
    const { data, error } = await query.select()
    
    if (error) throw error
    
    return Response.json({ data, success: true })
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json()
    const { id } = body
    const salonId = await getSalonId()
    
    let query = supabase.from('comissao').delete().eq('id', id)
    if (salonId) query = query.eq('salon_id', salonId)
    
    const { error } = await query
    
    if (error) throw error
    
    return Response.json({ success: true })
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
