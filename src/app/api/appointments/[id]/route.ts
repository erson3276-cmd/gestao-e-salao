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

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body
    const salonId = await getSalonId()
    
    let query = supabase
      .from('appointments')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
    
    if (salonId) query = query.eq('salon_id', salonId)
    
    const { data, error } = await query
      .select(`
        *,
        customers:customer_id(id, name, whatsapp),
        services:service_id(id, name, price, duration_minutes)
      `)
      .single()
    
    if (error) throw error
    
    return Response.json({ data, success: true })
  } catch (error: any) {
    console.error('Erro ao atualizar agendamento:', error)
    return Response.json({ error: error.message || 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const salonId = await getSalonId()
    
    let query = supabase
      .from('appointments')
      .delete()
      .eq('id', id)
    
    if (salonId) query = query.eq('salon_id', salonId)
    
    const { error } = await query
    
    if (error) throw error
    
    return Response.json({ success: true })
  } catch (error: any) {
    console.error('Erro ao excluir agendamento:', error)
    return Response.json({ error: error.message || 'Erro interno' }, { status: 500 })
  }
}
