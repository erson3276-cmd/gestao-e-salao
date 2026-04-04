import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(request: Request, { params }: { params: Promise<{ salonId: string }> }) {
  const { salonId } = await params
  
  const { data: salon } = await supabaseAdmin
    .from('salons')
    .select('id, name, image_url, address, whatsapp_number')
    .eq('id', salonId)
    .eq('status', 'active')
    .single()

  if (!salon) {
    return NextResponse.json({ salon: null }, { status: 404 })
  }

  return NextResponse.json({ salon })
}
