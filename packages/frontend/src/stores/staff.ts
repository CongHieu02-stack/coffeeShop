import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabaseClient'

// DEMO MODE
const DEMO_MODE = false

const DEMO_STAFF: StaffMember[] = [
  {
    id: 'demo-admin-id',
    email: 'admin@coffee.com',
    full_name: 'Admin User',
    role: 'admin',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'demo-staff-id',
    email: 'staff@coffee.com',
    full_name: 'Staff User',
    role: 'staff',
    is_active: true,
    created_at: new Date().toISOString()
  }
]

export interface StaffMember {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'staff'
  is_active: boolean
  created_at: string
  created_by?: string
}

export const useStaffStore = defineStore('staff', () => {
  // State
  const staff = ref<StaffMember[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const activeStaff = computed(() =>
    staff.value.filter(s => s.is_active)
  )

  const getStaffById = computed(() => (id: string) =>
    staff.value.find(s => s.id === id)
  )

  // Actions
  const loadStaff = async () => {
    isLoading.value = true
    error.value = null

    try {
      if (DEMO_MODE) {
        staff.value = [...DEMO_STAFF]
        isLoading.value = false
        return
      }

      const { data, error: supabaseError } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name')

      if (supabaseError) throw supabaseError
      staff.value = data || []
    } catch (err) {
      error.value = 'Không thể tải danh sách nhân viên'
      console.error('Error loading staff:', err)
    } finally {
      isLoading.value = false
    }
  }

  const createStaff = async (email: string, password: string, fullName: string, role: 'admin' | 'staff') => {
    isLoading.value = true
    error.value = null

    try {
      // Check if email already exists in current staff list
      const existingStaff = staff.value.find(s => s.email === email)
      if (existingStaff) {
        error.value = 'Email này đã được sử dụng bởi nhân viên khác'
        return null
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
      })

      if (authError) {
        // Handle specific error cases
        const errorMsg = authError.message || authError.toString()
        console.error('Auth error details:', authError)
        if (errorMsg.includes('already registered') || errorMsg.includes('already exists')) {
          error.value = 'Email này đã được đăng ký trong hệ thống. Vui lòng sử dụng email khác hoặc kích hoạt lại tài khoản cũ.'
        } else if (errorMsg.includes('rate limit') || errorMsg.includes('over_email_send_rate_limit')) {
          error.value = 'Đã đạt giới hạn gửi email. Vui lòng thử lại sau 1 giờ, hoặc tắt "Confirm email" trong Supabase Dashboard → Authentication → Providers → Email.'
        } else {
          error.value = 'Lỗi tạo tài khoản: ' + errorMsg
        }
        return null
      }

      // Get current logged-in user's email for created_by field BEFORE creating new user
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      const createdByEmail = currentUser?.email

      if (authData.user) {

        // Upsert profile (insert or update)
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            email: email,
            full_name: fullName,
            role: role,
            is_active: true,
            created_by: createdByEmail
          }, { onConflict: 'id' })
          .select()
          .single()

        if (profileError) {
          console.error('Profile upsert error:', profileError)
          error.value = 'Lỗi cập nhật profile: ' + (profileError.message || profileError.toString())
          throw profileError
        }

        if (profileData) {
          staff.value.push(profileData)
          return profileData
        }
      }
      return null
    } catch (err: any) {
      if (!error.value) {
        error.value = 'Không thể tạo nhân viên'
      }
      console.error('Error creating staff:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  const updateStaff = async (id: string, updates: Partial<StaffMember>) => {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: supabaseError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (supabaseError) throw supabaseError

      if (data) {
        const index = staff.value.findIndex(s => s.id === id)
        if (index !== -1) {
          staff.value[index] = data
        }
        return data
      }
      return null
    } catch (err) {
      error.value = 'Không thể cập nhật nhân viên'
      console.error('Error updating staff:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  const toggleStaffStatus = async (id: string, isActive: boolean) => {
    return updateStaff(id, { is_active: isActive })
  }

  const deleteStaff = async (id: string) => {
    isLoading.value = true
    error.value = null

    try {
      // Check if trying to delete self
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.id === id) {
        error.value = 'Không thể xóa chính bạn'
        return false
      }

      // Delete from profiles first (RLS should handle auth.users)
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      // Remove from local state
      staff.value = staff.value.filter(s => s.id !== id)
      return true
    } catch (err: any) {
      error.value = 'Không thể xóa nhân viên: ' + (err.message || 'Lỗi RLS policy')
      console.error('Error deleting staff:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    staff,
    isLoading,
    error,
    activeStaff,
    getStaffById,
    loadStaff,
    createStaff,
    updateStaff,
    toggleStaffStatus,
    deleteStaff
  }
})
