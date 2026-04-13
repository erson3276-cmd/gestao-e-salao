import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(request: Request, { params }: { params: Promise<{ salonId: string }> }) {
  const { salonId } = await params
  
  const { data: workingHours } = await supabaseAdmin
    .from('working_hours')
    .select('*')
    .eq('salon_id', salonId)
    .order('day_of_week', { ascending: true })

  return NextResponse.json({ workingHours: workingHours || [] })
}
