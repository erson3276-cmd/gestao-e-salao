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
  
  // First try by slug column if it exists
  const { data: salonBySlug } = await supabaseAdmin
    .from('salons')
    .select('id, name, slug, image_url, address, whatsapp_number')
    .eq('slug', slug)
    .eq('status', 'active')
    .single()

  if (salonBySlug) {
    return NextResponse.json({ salon: salonBySlug })
  }

  // Fallback: try matching by generated slug from name
  const { data: allSalons } = await supabaseAdmin
    .from('salons')
    .select('id, name, slug, image_url, address, whatsapp_number')
    .eq('status', 'active')

  if (allSalons) {
    for (const salon of allSalons) {
      const generatedSlug = generateSlug(salon.name)
      if (generatedSlug === slug || salon.id === slug) {
        // Auto-update slug if column exists
        try {
          await supabaseAdmin.from('salons').update({ slug: generatedSlug }).eq('id', salon.id)
        } catch { /* column may not exist */ }
        return NextResponse.json({ salon: { ...salon, slug: generatedSlug } })
      }
    }
  }

  return NextResponse.json({ salon: null }, { status: 404 })
}
