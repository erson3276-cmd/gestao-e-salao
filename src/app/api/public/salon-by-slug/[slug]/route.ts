import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50)
}

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  try {
    // 1. Fetch all active salons
    const { data: allSalons, error } = await supabaseAdmin
      .from('salons')
      .select('id, name, image_url, address, whatsapp_number')
      .eq('status', 'active')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!allSalons || allSalons.length === 0) {
      return NextResponse.json({ salon: null }, { status: 404 })
    }

    // 2. Match by generated slug from name OR by ID (for old links)
    for (const salon of allSalons) {
      const generatedSlug = generateSlug(salon.name)
      if (generatedSlug === slug || salon.id === slug) {
        return NextResponse.json({ salon: { ...salon, slug: generatedSlug } })
      }
    }

    return NextResponse.json({ salon: null }, { status: 404 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
