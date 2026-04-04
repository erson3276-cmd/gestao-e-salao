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
    // 1. Try to find by slug column first (if it exists and is populated)
    const { data: salonBySlug } = await supabaseAdmin
      .from('salons')
      .select('id, name, slug, image_url, address, whatsapp_number')
      .eq('status', 'active')
      .filter('slug', 'eq', slug)
      .single()

    if (salonBySlug) {
      return NextResponse.json({ salon: salonBySlug })
    }

    // 2. Fallback: Fetch all active salons and match by generated slug from name
    const { data: allSalons } = await supabaseAdmin
      .from('salons')
      .select('id, name, slug, image_url, address, whatsapp_number')
      .eq('status', 'active')

    if (allSalons) {
      for (const salon of allSalons) {
        const generatedSlug = generateSlug(salon.name)
        // Match by generated slug OR by ID (for old links)
        if (generatedSlug === slug || salon.id === slug) {
          return NextResponse.json({ salon: { ...salon, slug: generatedSlug } })
        }
      }
    }

    return NextResponse.json({ salon: null }, { status: 404 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
