import { getSupabase } from '../db/supabase'

export interface LoginCredentials {
  email: string
  password: string
}

export interface UserProfile {
  id: string
  full_name: string
  role: 'admin' | 'staff'
  is_active: boolean
}

export const AuthModel = {
  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials) {
    const supabase = getSupabase()
    const { data, error } = await supabase.auth.signInWithPassword(credentials)
    
    if (error) throw error
    return data
  },

  /**
   * Get user by JWT token
   */
  async getUserByToken(token: string) {
    const supabase = getSupabase()
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error) throw error
    return user
  },

  /**
   * Get profile by user ID
   */
  async getProfileByUserId(userId: string) {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data as UserProfile
  }
}
