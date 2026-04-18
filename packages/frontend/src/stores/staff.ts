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
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
      })

      if (authError) throw authError

      if (authData.user) {
        // Update profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .update({ full_name: fullName, role })
          .eq('id', authData.user.id)
          .select()
          .single()

        if (profileError) throw profileError

        if (profileData) {
          staff.value.push(profileData)
          return profileData
        }
      }
      return null
    } catch (err) {
      error.value = 'Không thể tạo nhân viên'
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

  return {
    staff,
    isLoading,
    error,
    activeStaff,
    getStaffById,
    loadStaff,
    createStaff,
    updateStaff,
    toggleStaffStatus
  }
})
