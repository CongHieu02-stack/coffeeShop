/**
 * Auth Service - Xử lý đăng nhập, đăng xuất cho Admin và Staff
 * Data Access Layer
 */
import { supabase } from './supabaseClient'
import { User } from '@/models'

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResult {
  success: boolean
  user?: User
  error?: string
}

export class AuthService {
  /**
   * Đăng nhập với email và password
   */
  static async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword(credentials)

      if (error) {
        return { success: false, error: error.message }
      }

      if (!data.user) {
        return { success: false, error: 'Không tìm thấy người dùng' }
      }

      // Lấy profile từ bảng profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profileError) {
        return { success: false, error: 'Không tìm thấy thông tin người dùng' }
      }

      const user = new User({
        id: data.user.id,
        email: data.user.email || '',
        full_name: profile.full_name,
        role: profile.role,
        is_active: profile.is_active,
        created_at: profile.created_at
      })

      return { success: true, user }
    } catch (err: any) {
      return { success: false, error: err.message || 'Lỗi đăng nhập' }
    }
  }

  /**
   * Đăng xuất
   */
  static async logout(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        return { success: false, error: error.message }
      }
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  /**
   * Lấy thông tin user hiện tại
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return null

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!profile) return null

      return new User({
        id: user.id,
        email: user.email || '',
        full_name: profile.full_name,
        role: profile.role,
        is_active: profile.is_active,
        created_at: profile.created_at
      })
    } catch {
      return null
    }
  }

  /**
   * Đổi mật khẩu
   */
  static async changePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  /**
   * Lắng nghe thay đổi trạng thái auth
   */
  static onAuthStateChange(callback: (user: User | null) => void): () => void {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const user = await this.getCurrentUser()
        callback(user)
      } else {
        callback(null)
      }
    })

    return () => subscription.unsubscribe()
  }
}
