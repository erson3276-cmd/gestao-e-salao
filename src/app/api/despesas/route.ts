import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')
    const year = searchParams.get('year')
    const category = searchParams.get('category')
    const paid = searchParams.get('paid')
    const recurring = searchParams.get('recurring')

    let query = supabase
      .from('despesas')
      .select('*')
      .order('date', { ascending: false })

    if (month && year) {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`
      const endDate = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0]
      query = query.gte('date', startDate).lte('date', endDate)
    }

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    if (paid !== null && paid !== undefined && paid !== 'all') {
      query = query.eq('paid', paid === 'true')
    }

    if (recurring !== null && recurring !== undefined && recurring !== 'all') {
      query = query.eq('recurring', recurring === 'true')
    }

    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching despesas:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }
    
    return Response.json({ data: data || [], success: true })
  } catch (error: any) {
    console.error('Exception in GET despesas:', error)
    return Response.json({ error: error.message || 'Erro interno' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      description, 
      amount, 
      category, 
      date, 
      due_date, 
      paid, 
      recurring,
      recurrence_type,
      notes 
    } = body

    if (!description || !amount) {
      return Response.json({ error: 'Descrição e valor são obrigatórios' }, { status: 400 })
    }
    
    const { data, error } = await supabase
      .from('despesas')
      .insert([{ 
        description: description.trim(), 
        amount: parseFloat(amount), 
        category: category || 'Outros', 
        date: date || new Date().toISOString().split('T')[0],
        due_date: due_date || null,
        paid: paid || false,
        recurring: recurring || false,
        recurrence_type: recurrence_type || null,
        notes: notes || null,
        paid_date: paid ? new Date().toISOString().split('T')[0] : null
      }])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating despesa:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }
    
    return Response.json({ data, success: true })
  } catch (error: any) {
    console.error('Exception in POST despesas:', error)
    return Response.json({ error: error.message || 'Erro interno' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { 
      id, 
      description, 
      amount, 
      category, 
      date, 
      due_date, 
      paid, 
      recurring,
      recurrence_type,
      notes 
    } = body

    if (!id) {
      return Response.json({ error: 'ID é obrigatório' }, { status: 400 })
    }
    
    const updateData: Record<string, any> = {}
    
    if (description !== undefined) updateData.description = description.trim()
    if (amount !== undefined) updateData.amount = parseFloat(amount)
    if (category !== undefined) updateData.category = category
    if (date !== undefined) updateData.date = date
    if (due_date !== undefined) updateData.due_date = due_date || null
    if (paid !== undefined) {
      updateData.paid = paid
      updateData.paid_date = paid ? (new Date().toISOString().split('T')[0]) : null
    }
    if (recurring !== undefined) updateData.recurring = recurring
    if (recurrence_type !== undefined) updateData.recurrence_type = recurrence_type
    if (notes !== undefined) updateData.notes = notes || null

    const { data, error } = await supabase
      .from('despesas')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating despesa:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }
    
    return Response.json({ data, success: true })
  } catch (error: any) {
    console.error('Exception in PUT despesas:', error)
    return Response.json({ error: error.message || 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return Response.json({ error: 'ID é obrigatório' }, { status: 400 })
    }
    
    const { error } = await supabase
      .from('despesas')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting despesa:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }
    
    return Response.json({ success: true })
  } catch (error: any) {
    console.error('Exception in DELETE despesas:', error)
    return Response.json({ error: error.message || 'Erro interno' }, { status: 500 })
  }
}
