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
    let query = supabase.from('notes').select('*')
    if (salonId) query = query.eq('salon_id', salonId)
    const { data, error } = await query
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return Response.json({ data: data || [], success: true })
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, content, color, pinned } = body
    const salonId = await getSalonId()
    
    const insertData = salonId 
      ? { title, content, color, pinned: pinned || false, salon_id: salonId }
      : { title, content, color, pinned: pinned || false }
    
    const { data, error } = await supabase
      .from('notes')
      .insert([insertData])
      .select()
    
    if (error) throw error
    
    return Response.json({ data, success: true })
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, title, content, color, pinned } = body
    const salonId = await getSalonId()
    
    let query = supabase
      .from('notes')
      .update({ title, content, color, pinned, updated_at: new Date().toISOString() })
      .eq('id', id)
    
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
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) return Response.json({ error: 'ID required' }, { status: 400 })
    
    const salonId = await getSalonId()
    
    let query = supabase.from('notes').delete().eq('id', id)
    if (salonId) query = query.eq('salon_id', salonId)
    
    const { error } = await query
    
    if (error) throw error
    
    return Response.json({ success: true })
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
