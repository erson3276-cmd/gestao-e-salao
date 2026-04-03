import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('working_hours')
      .select('*')
      .order('day_of_week', { ascending: true })
    
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, data: data || [] })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { day_of_week, start_time, end_time, is_active } = body
    
    // Check if exists
    const { data: existing } = await supabase
      .from('working_hours')
      .select('id')
      .eq('day_of_week', day_of_week)
      .single()
    
    let result
    if (existing) {
      const { data, error } = await supabase
        .from('working_hours')
        .update({ start_time, end_time, is_active })
        .eq('day_of_week', day_of_week)
        .select()
        .single()
      
      if (error) throw error
      result = data
    } else {
      const { data, error } = await supabase
        .from('working_hours')
        .insert([{ day_of_week, start_time, end_time, is_active }])
        .select()
        .single()
      
      if (error) throw error
      result = data
    }
    
    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
