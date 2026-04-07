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

    const { data: salons, error } = await supabaseAdmin
      .from('salons')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ salons: salons || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies()
    const superAdminCookie = cookieStore.get(SUPER_ADMIN_COOKIE_NAME)
    
    if (!superAdminCookie || superAdminCookie.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing salon id' }, { status: 400 })
    }

    const tables = ['appointments', 'customers', 'services', 'vendas', 'despesas', 'comissao', 'whatsapp_messages', 'whatsapp_status', 'blocked_slots', 'working_hours', 'professionals', 'notes']
    
    for (const table of tables) {
      try {
        await supabaseAdmin.from(table).delete().eq('salon_id', id)
      } catch { /* table may not exist or have no salon_id */ }
    }

    const { error } = await supabaseAdmin.from('salons').delete().eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies()
    const superAdminCookie = cookieStore.get(SUPER_ADMIN_COOKIE_NAME)
    
    if (!superAdminCookie || superAdminCookie.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, status, extendDays } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing salon id' }, { status: 400 })
    }

    const updateData: any = { updated_at: new Date().toISOString() }
    if (status) updateData.status = status
    if (extendDays) {
      const { data: salon } = await supabaseAdmin
        .from('salons')
        .select('subscription_ends_at')
        .eq('id', id)
        .single()
      
      const now = new Date()
      const currentEndsAt = salon?.subscription_ends_at ? new Date(salon.subscription_ends_at) : now
      const baseDate = currentEndsAt > now ? currentEndsAt : now
      updateData.subscription_ends_at = new Date(baseDate.getTime() + extendDays * 24 * 60 * 60 * 1000).toISOString()
      updateData.status = 'active'
    }

    const { data, error } = await supabaseAdmin
      .from('salons')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ salon: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
