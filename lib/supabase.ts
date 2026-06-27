import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// 1. Make sure the 'export' keyword is right here before the const/function:
export const createClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}