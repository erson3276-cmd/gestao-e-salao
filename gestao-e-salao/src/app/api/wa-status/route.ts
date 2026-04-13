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
      .from('whatsapp_status')
      .select('*')
    
    if (salonId) {
      query = query.eq('salon_id', salonId)
    } else {
      query = query.eq('id', 1)
    }
    
    const { data, error } = await query.single()
    
    if (error) {
      return NextResponse.json({ connected: false, state: 'error', message: 'Status table not found' })
    }
    
    return NextResponse.json({
      connected: data.connected || false,
      state: data.state || 'disconnected',
      hasSession: data.has_session || false,
      updated_at: data.updated_at
    })
  } catch (error: any) {
    return NextResponse.json({ connected: false, state: 'error', message: error.message })
  }
}
