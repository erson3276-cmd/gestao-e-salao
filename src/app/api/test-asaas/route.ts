import { NextResponse } from 'next/server'
import { createCustomer, findCustomerByEmail } from '@/lib/asaas'

export async function GET() {
  try {
    const result = await findCustomerByEmail('admin@gestaoesalao.com')
    return NextResponse.json({ 
      success: true, 
      customer: result,
      apiKeyPrefix: process.env.ASAAS_API_KEY?.substring(0, 10) || 'NOT_SET'
    })
  } catch (e: any) {
    return NextResponse.json({ 
      success: false, 
      error: e.message,
      apiKeyPrefix: process.env.ASAAS_API_KEY?.substring(0, 10) || 'NOT_SET'
    }, { status: 500 })
  }
}
