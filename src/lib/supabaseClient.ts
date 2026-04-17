import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fbrbtbkkwoqsssmbiknr.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicmJ0Ymtrd29xc3NzbWJpa25yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyOTgzNzYsImV4cCI6MjA5MTg3NDM3Nn0.lpUz9dAIs_J5AqfC5Cfz8pLRWoLaN_hKfEUnKhKXNG0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
