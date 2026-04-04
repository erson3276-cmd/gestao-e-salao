import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(request: Request, { params }: { params: Promise<{ salonId: string }> }) {
  const { salonId } = await params
  
  const { data: services } = await supabaseAdmin
    .from('services')
    .select('*')
    .eq('salon_id', salonId)
    .order('name', { ascending: true })

  return NextResponse.json({ services: services || [] })
}
