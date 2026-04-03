import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('comissao')
      .select('*')
      .order('date', { ascending: false })
    
    if (error) throw error
    
    return Response.json({ data: data || [], success: true })
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { vendor_name, sale_amount, percentage, date } = body
    const comission_amount = sale_amount * (percentage / 100)
    
    const { data, error } = await supabase
      .from('comissao')
      .insert([{ vendor_name, sale_amount, percentage, comission_amount, date }])
      .select()
    
    if (error) throw error
    
    return Response.json({ data, success: true })
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, paid } = body
    
    const { data, error } = await supabase
      .from('comissao')
      .update({ paid })
      .eq('id', id)
      .select()
    
    if (error) throw error
    
    return Response.json({ data, success: true })
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json()
    const { id } = body
    
    const { error } = await supabase
      .from('comissao')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    
    return Response.json({ success: true })
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
