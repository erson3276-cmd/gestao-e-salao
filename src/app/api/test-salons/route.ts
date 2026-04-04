import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  try {
    const { error, count } = await supabaseAdmin.from('salons').select('*', { count: 'exact', head: true })
    return NextResponse.json({ 
      exists: !error, 
      error: error?.message || null,
      count 
    })
  } catch (e: any) {
    return NextResponse.json({ 
      exists: false, 
      error: e.message 
    })
  }
}
