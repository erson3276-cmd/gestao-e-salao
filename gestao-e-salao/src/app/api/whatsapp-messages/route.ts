import { NextResponse } from 'next/server'
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
    let query = supabase
      .from('whatsapp_messages')
      .select('*')
    
    if (salonId) query = query.eq('salon_id', salonId)
    
    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(100)
    
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, data: data || [] })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
