import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
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
      // If bucket doesn't exist, try to create it
      if (uploadError.message?.includes('not found')) {
        await supabase.storage.createBucket('salon-photos', {
          public: true,
          fileSizeLimit: 5242880 // 5MB
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

    return NextResponse.json({ success: true, url: urlData.publicUrl })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Upload failed' }, { status: 500 })
  }
}
