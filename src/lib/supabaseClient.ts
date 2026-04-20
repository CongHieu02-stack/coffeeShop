import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bzskozuqyyccfccxspbu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6c2tvenVxeXljY2ZjY3hzcGJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjAyMjcsImV4cCI6MjA5MjE5NjIyN30.mZyMNhMFJxHrI3mvFVwP9ZoTeHvewBdkMm5ggEcWQM4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
