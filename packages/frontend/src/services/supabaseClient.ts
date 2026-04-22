/**
 * Supabase Client Service - Khởi tạo kết nối với Supabase
 * Data Access Layer
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bzskozuqyyccfccxspbu.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6c2tvenVxeXljY2ZjY3hzcGJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjAyMjcsImV4cCI6MjA5MjE5NjIyN30.mZyMNhMFJxHrI3mvFVwP9ZoTeHvewBdkMm5ggEcWQM4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type SupabaseClient = typeof supabase
