import { createClient, SupabaseClient } from '@supabase/supabase-js'

function createSupabaseAdmin(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    return null
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

let _supabaseAdmin: SupabaseClient | null = null

export const supabaseAdmin = (() => {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createSupabaseAdmin()
  }
  return _supabaseAdmin
})()
