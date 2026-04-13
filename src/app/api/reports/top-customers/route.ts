import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { startOfMonth, endOfMonth } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1))
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()))
    const salonId = request.headers.get('x-salon-id')

    const start = startOfMonth(new Date(year, month - 1))
    const end = endOfMonth(new Date(year, month - 1))

    const { data: vendas, error } = await supabaseAdmin
      .from('vendas')
      .select('customer_id, total_amount, amount, customers(name, avatar_url)')
      .eq('salon_id', salonId || '')
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString())

    if (error) throw new Error('Erro ao buscar vendas')

    const customerMap = new Map<string, { 
      total_spent: number; 
      total_visits: number; 
      name: string; 
      avatar_url: string | null 
    }>()

    vendas?.forEach(v => {
      if (v.customer_id) {
        const existing = customerMap.get(v.customer_id) || { 
          total_spent: 0, 
          total_visits: 0,
          name: v.customers?.name || 'Cliente',
          avatar_url: v.customers?.avatar_url || null
        }
        existing.total_spent += v.total_amount || v.amount || 0
        existing.total_visits++
        customerMap.set(v.customer_id, existing)
      }
    })

    const topCustomers = Array.from(customerMap.entries())
      .map(([id, data]) => ({
        id,
        name: data.name,
        avatar_url: data.avatar_url,
        total_visits: data.total_visits,
        total_spent: data.total_spent
      }))
      .sort((a, b) => b.total_spent - a.total_spent)
      .slice(0, 10)

    return NextResponse.json({ data: topCustomers })
  } catch (error: any) {
    console.error('Erro ao buscar top customers:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
