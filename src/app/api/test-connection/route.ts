import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  try {
    // Test Supabase connection
    const { data, error } = await supabaseAdmin
      .from('salons')
      .select('id, name, owner_email')
      .limit(5)

    return NextResponse.json({
      success: true,
      data: data || [],
      error: error?.message || null
    })
  } catch (e: any) {
    return NextResponse.json({
      success: false,
      error: e.message
    }, { status: 500 })
  }
}
