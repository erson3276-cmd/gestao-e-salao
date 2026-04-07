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

export async function POST() {
  try {
    const { data: salons, error } = await supabaseAdmin
      .from('salons')
      .select('id, name, slug')

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    const results = []
    for (const salon of salons || []) {
      const slug = generateSlug(salon.name)
      
      const { error: updateError } = await supabaseAdmin
        .from('salons')
        .update({ slug })
        .eq('id', salon.id)

      results.push({ id: salon.id, name: salon.name, slug, error: updateError?.message || null })
    }

    return NextResponse.json({ success: true, results })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
