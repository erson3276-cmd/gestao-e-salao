import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { SALON_COOKIE_NAME, SUPER_ADMIN_COOKIE_NAME } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  const cookieStore = await cookies()
  
  const salonCookie = cookieStore.get(SALON_COOKIE_NAME)
  const superAdminCookie = cookieStore.get(SUPER_ADMIN_COOKIE_NAME)
  const adminAuth = cookieStore.get('admin_auth')
  
  if (superAdminCookie?.value === 'authenticated') {
    return NextResponse.json({ role: 'super-admin' })
  }
  
  if (salonCookie) {
    try {
      const session = JSON.parse(salonCookie.value)
      
      const { data: salon } = await supabaseAdmin
        .from('salons')
        .select('image_url')
        .eq('id', session.salonId)
        .single()
      
      return NextResponse.json({ 
        role: 'salon', 
        ...session,
        imageUrl: salon?.image_url || null
      })
    } catch {
      return NextResponse.json({ role: null }, { status: 401 })
    }
  }

  if (adminAuth?.value === 'authenticated') {
    const { data: salons } = await supabaseAdmin
      .from('salons')
      .select('id, name')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)

    if (salons && salons.length > 0) {
      return NextResponse.json({
        role: 'admin',
        salonId: salons[0].id,
        salonName: salons[0].name
      })
    }
  }
  
  return NextResponse.json({ role: null }, { status: 401 })
}
