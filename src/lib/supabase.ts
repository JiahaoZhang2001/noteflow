import { createClient, SupabaseClient } from '@supabase/supabase-js'

function createLazyClient() {
  let _instance: SupabaseClient | null = null

  const getInstance = (): SupabaseClient => {
    if (!_instance) {
      _instance = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
    }
    return _instance
  }

  return new Proxy({} as SupabaseClient, {
    get(_, prop: string) {
      return getInstance()[prop as keyof SupabaseClient]
    }
  })
}

export const supabase = createLazyClient()
