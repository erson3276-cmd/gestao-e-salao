import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

function generateSlug(name: string): string {
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 50)
}

async function findSalonBySlug(slug: string) {
  const { data: allSalons } = await supabaseAdmin.from('salons').select('id, name').eq('status', 'active')
  if (allSalons) {
    for (const s of allSalons) {
      if (generateSlug(s.name) === slug || s.id === slug) return s
    }
  }
  return null
}

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const salon = await findSalonBySlug(slug)
  if (!salon) return NextResponse.json({ workingHours: [] })

  const { data: workingHours } = await supabaseAdmin.from('working_hours').select('*').eq('salon_id', salon.id).order('day_of_week', { ascending: true })
  return NextResponse.json({ workingHours: workingHours || [] })
}
