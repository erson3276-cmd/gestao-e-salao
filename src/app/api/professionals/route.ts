import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'
import { getSalonSession } from '@/app/actions/salon-auth'

export async function GET() {
  const session = await getSalonSession()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const { data, error } = await supabase
      .from('professionals')
      .select('*')
      .eq('salon_id', session.salonId)
      .order('name', { ascending: true })
    
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ professionals: data || [] })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getSalonSession()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { id, name, commission_percent, whatsapp } = body

    if (id) {
      const { data, error } = await supabase
        .from('professionals')
        .update({ name, commission_percent, whatsapp })
        .eq('id', id)
        .eq('salon_id', session.salonId)
        .select()
        .single()
      
      if (error) throw error
      return NextResponse.json({ success: true, data })
    } else {
      const { data, error } = await supabase
        .from('professionals')
        .insert([{ name, commission_percent, whatsapp, salon_id: session.salonId }])
        .select()
        .single()
      
      if (error) throw error
      return NextResponse.json({ success: true, data })
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const session = await getSalonSession()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 })

    const { error } = await supabase
      .from('professionals')
      .delete()
      .eq('id', id)
      .eq('salon_id', session.salonId)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
