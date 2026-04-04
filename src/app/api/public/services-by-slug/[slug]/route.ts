import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

function generateSlug(name: string): string {
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 50)
}

async function findSalonBySlug(slug: string) {
  const { data: salonBySlug } = await supabaseAdmin.from('salons').select('id').eq('slug', slug).eq('status', 'active').single()
  if (salonBySlug) return salonBySlug

  const { data: allSalons } = await supabaseAdmin.from('salons').select('id, name, slug').eq('status', 'active')
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
  if (!salon) return NextResponse.json({ services: [] })

  const { data: services } = await supabaseAdmin.from('services').select('*').eq('salon_id', salon.id).order('name', { ascending: true })
  return NextResponse.json({ services: services || [] })
}
