import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return Response.json({ data: data || [], success: true })
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, content, color, pinned } = body
    
    const { data, error } = await supabase
      .from('notes')
      .insert([{ title, content, color, pinned: pinned || false }])
      .select()
    
    if (error) throw error
    
    return Response.json({ data, success: true })
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, title, content, color, pinned } = body
    
    const { data, error } = await supabase
      .from('notes')
      .update({ title, content, color, pinned, updated_at: new Date().toISOString() })
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
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) return Response.json({ error: 'ID required' }, { status: 400 })
    
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    
    return Response.json({ success: true })
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
