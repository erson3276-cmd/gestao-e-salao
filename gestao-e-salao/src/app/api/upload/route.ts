import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'
import { cookies } from 'next/headers'

async function getSalonId(): Promise<string | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get('salon_session')
  if (session) {
    try { return JSON.parse(session.value).salonId } catch {}
  }
  const adminAuth = cookieStore.get('admin_auth')
  if (adminAuth?.value === 'authenticated') return null
  const superAdmin = cookieStore.get('super_admin_session')
  if (superAdmin?.value === 'authenticated') return null
  return null
}

export async function POST(request: Request) {
  try {
    const salonId = await getSalonId()
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    const fileExt = file.name.split('.').pop()
    const salonPrefix = salonId ? `${salonId}/` : ''
    const fileName = `${salonPrefix}${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `salon-photos/${fileName}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabase.storage
      .from('salon-photos')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true
      })

    if (uploadError) {
      if (uploadError.message?.includes('not found')) {
        await supabase.storage.createBucket('salon-photos', {
          public: true,
          fileSizeLimit: 5242880
        })
        
        const { error: retryError } = await supabase.storage
          .from('salon-photos')
          .upload(filePath, buffer, {
            contentType: file.type,
            upsert: true
          })
        
        if (retryError) throw retryError
      } else {
        throw uploadError
      }
    }

    const { data: urlData } = supabase.storage
      .from('salon-photos')
      .getPublicUrl(filePath)

    return NextResponse.json({ success: true, url: urlData.publicUrl, path: filePath })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Upload failed' }, { status: 500 })
  }
}
