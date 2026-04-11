import { NextResponse } from 'next/server'

export async function GET() {
  const rawKey = process.env.ASAAS_KEY_FULL || process.env.ASAAS_API_KEY || ''
  const hasDollarSign = rawKey.startsWith('$')
  const hasSpaces = rawKey !== rawKey.trim()
  const keyLength = rawKey.length
  
  return NextResponse.json({ 
    hasDollarSign,
    hasSpaces,
    keyLength,
    first10Chars: rawKey.substring(0, 10),
    last10Chars: rawKey.substring(Math.max(0, rawKey.length - 10))
  })
}
