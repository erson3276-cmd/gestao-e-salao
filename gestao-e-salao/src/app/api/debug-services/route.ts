import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

function generateSlug(name: string): string {
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 50)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug') || 'moca-chiq'

  const { data: allSalons } = await supabaseAdmin.from('salons').select('*').eq('status', 'active')
  const { data: allServices } = await supabaseAdmin.from('services').select('*')

  const matchedSalons = allSalons?.map(s => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    generatedSlug: generateSlug(s.name),
    matches: generateSlug(s.name) === slug || s.slug === slug || s.id === slug
  })) || []

  const results = matchedSalons.map(ms => {
    const salonServices = allServices?.filter(s => s.salon_id === ms.id) || []
    return {
      salon: ms,
      servicesCount: salonServices.length,
      services: salonServices
    }
  })

  return NextResponse.json({
    searchSlug: slug,
    salons: results,
    totalServices: allServices?.length || 0
  })
}
