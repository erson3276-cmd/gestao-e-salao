import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'
import { getSalonSession } from '@/app/actions/salon-auth'

export async function GET() {
  const session = await getSalonSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('salons')
    .select('only_registered_clients')
    .eq('id', session.salonId)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data || { only_registered_clients: false })
}

export async function PUT(request: Request) {
  const session = await getSalonSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { only_registered_clients } = await request.json()

  const { data, error } = await supabase
    .from('salons')
    .update({ only_registered_clients })
    .eq('id', session.salonId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}
