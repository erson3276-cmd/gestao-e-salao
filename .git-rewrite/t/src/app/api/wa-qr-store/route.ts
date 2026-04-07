import { NextResponse } from 'next/server'

let currentQR: { qr: string | null; state: string; updated_at: string } = {
  qr: null,
  state: 'disconnected',
  updated_at: ''
}

export async function GET() {
  return NextResponse.json({
    qr: currentQR.qr,
    state: currentQR.state,
    updated_at: currentQR.updated_at
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { qr, state } = body
    
    currentQR = {
      qr: qr || null,
      state: state || 'disconnected',
      updated_at: new Date().toISOString()
    }
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 })
  }
}
