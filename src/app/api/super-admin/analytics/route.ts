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

    const { data: salons } = await supabaseAdmin
      .from('salons')
      .select('id, name, owner_name, owner_email, status, created_at, subscription_ends_at, plan')

    if (!salons || salons.length === 0) {
      return NextResponse.json({
        stats: { total: 0, active: 0, inactive: 0, blocked: 0, revenue: 0, newSalons30d: 0, expiringSoon: 0, conversionRate: 0 },
        monthlyData: []
      })
    }

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    const total = salons.length
    const active = salons.filter(s => s.status === 'active').length
    const inactive = salons.filter(s => s.status === 'inactive').length
    const blocked = salons.filter(s => s.status === 'blocked').length
    const revenue = active * 49.90

    const newSalons30d = salons.filter(s => new Date(s.created_at) >= thirtyDaysAgo).length
    
    const expiringSoon = salons.filter(s => {
      if (s.status !== 'active' || !s.subscription_ends_at) return false
      const endDate = new Date(s.subscription_ends_at)
      return endDate >= now && endDate <= next7Days
    }).length

    const monthlyData: { month: string, count: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      const count = salons.filter(s => {
        const created = new Date(s.created_at)
        return created >= monthStart && created <= monthEnd
      }).length
      monthlyData.push({
        month: monthStart.toLocaleDateString('pt-BR', { month: 'short' }),
        count
      })
    }

    return NextResponse.json({
      stats: {
        total,
        active,
        inactive,
        blocked,
        revenue,
        newSalons30d,
        expiringSoon,
        conversionRate: total > 0 ? Math.round((active / total) * 100) : 0
      },
      monthlyData
    })
  } catch (error: any) {
    console.error('Analytics error:', error)
    return NextResponse.json({ stats: null }, { status: 200 })
  }
}