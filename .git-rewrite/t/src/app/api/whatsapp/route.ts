import { NextResponse } from 'next/server'
import { evolution } from '@/lib/evolution'

export async function POST(request: Request) {
  try {
    const { action } = await request.json()

    switch (action) {
      case 'connect':
        const connectData = await evolution.connect()
        return NextResponse.json(connectData)
      case 'logout':
        const logoutData = await evolution.logout()
        return NextResponse.json(logoutData)
      case 'status':
        const statusData = await evolution.status()
        return NextResponse.json(statusData)
      default:
        return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
