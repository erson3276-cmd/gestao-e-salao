import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { findCustomerByEmail } from '@/lib/asaas'

export async function GET() {
  const key1 = process.env.ASAAS_API_KEY || ''
  const key2 = process.env.ASAAS_KEY_NEW || ''
  const key3 = process.env.ASAAS_KEY_FULL || ''
  
  return NextResponse.json({ 
    key1: { len: key1.length, prefix: key1.substring(0, 8) },
    key2: { len: key2.length, prefix: key2.substring(0, 8) },
    key3: { len: key3.length, prefix: key3.substring(0, 8) }
  })
}

export async function POST() {
  try {
    const result = await findCustomerByEmail('admin@gestaoesalao.com')
    return NextResponse.json({ success: true, customer: result?.id })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
