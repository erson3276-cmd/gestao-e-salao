import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { cookies } from 'next/headers'
import { SUPER_ADMIN_COOKIE_NAME } from '@/lib/auth'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const superAdminCookie = cookieStore.get(SUPER_ADMIN_COOKIE_NAME)
    
    if (!superAdminCookie || superAdminCookie.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: logs } = await supabaseAdmin
      .from('super_admin_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    return NextResponse.json({ logs: logs || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const superAdminCookie = cookieStore.get(SUPER_ADMIN_COOKIE_NAME)
    
    if (!superAdminCookie || superAdminCookie.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, details, salon_id, salon_name } = await request.json()

    const { data, error } = await supabaseAdmin
      .from('super_admin_logs')
      .insert([{
        action,
        details,
        salon_id,
        salon_name,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, log: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}