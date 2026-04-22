/**
 * Staff Service - Quản lý tài khoản nhân viên
 * Data Access Layer
 */
import { supabase } from './supabaseClient'
import { User } from '@/models'

export interface CreateStaffData {
  email: string
  password: string
  fullName: string
  role: 'admin' | 'staff'
}

export class StaffService {
  /**
   * Lấy tất cả nhân viên đang hoạt động
   */
  static async getAll(): Promise<User[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_active', true)
      .order('full_name')

    if (error) {
      throw new Error(error.message)
    }

    // Lấy email từ auth.users
    const staffList: User[] = []
    for (const profile of data || []) {
      const { data: userData } = await supabase.auth.admin.getUserById(profile.id)
      staffList.push(new User({
        id: profile.id,
        email: userData?.user?.email || '',
        full_name: profile.full_name,
        role: profile.role,
        is_active: profile.is_active,
        created_at: profile.created_at
      }))
    }

    return staffList
  }

  /**
   * Tạo nhân viên mới
   */
  static async create(staffData: CreateStaffData): Promise<User> {
    // Tạo user trong auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: staffData.email,
      password: staffData.password,
      email_confirm: true
    })

    if (authError) {
      throw new Error(authError.message)
    }

    // Cập nhật profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: staffData.fullName,
        role: staffData.role,
        is_active: true
      })
      .eq('id', authData.user.id)
      .select()
      .single()

    if (profileError) {
      throw new Error(profileError.message)
    }

    return new User({
      id: authData.user.id,
      email: staffData.email,
      full_name: profile.full_name,
      role: profile.role,
      is_active: profile.is_active,
      created_at: profile.created_at
    })
  }

  /**
   * Cập nhật thông tin nhân viên
   */
  static async update(id: string, updates: Partial<User>): Promise<User> {
    const updateData: Record<string, unknown> = {}

    if (updates.fullName !== undefined) updateData.full_name = updates.fullName
    if (updates.role !== undefined) updateData.role = updates.role
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    // Lấy email
    const { data: userData } = await supabase.auth.admin.getUserById(id)

    return new User({
      id: data.id,
      email: userData?.user?.email || '',
      full_name: data.full_name,
      role: data.role,
      is_active: data.is_active,
      created_at: data.created_at
    })
  }

  /**
   * Vô hiệu hóa nhân viên (soft delete)
   */
  static async deactivate(id: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: false })
      .eq('id', id)

    if (error) {
      throw new Error(error.message)
    }
  }
}
