import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../types/database'

let client: SupabaseClient<Database> | null = null

export const getSupabase = (): SupabaseClient<Database> => {
    if (!client) {
        const supabaseUrl = process.env.SUPABASE_URL || ''
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || ''

        if (!supabaseUrl) {
            throw new Error('SUPABASE_URL is not defined in environment variables')
        }

        client = createClient<Database>(supabaseUrl, supabaseKey)
    }
    return client
}

// For backward compatibility
export const supabase = getSupabase()
