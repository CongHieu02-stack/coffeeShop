import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import type { User } from '@supabase/supabase-js'
import { useAuthPersist } from '@/composables/useAuthPersist'

// DEMO MODE - Set to true to bypass Supabase
const DEMO_MODE = false

const DEMO_USERS = {
  'admin@coffee.com': { password: 'admin123', role: 'admin', full_name: 'Admin User' },
  'staff@coffee.com': { password: 'staff123', role: 'staff', full_name: 'Staff User' }
}

interface Profile {
  id: string
  full_name: string
  role: 'admin' | 'staff'
  is_active: boolean
}

export const useAuthStore = defineStore('auth', () => {
  // Composables
  const { saveToStorage, loadFromStorage, clearStorage } = useAuthPersist()

  // State
  const user = ref<User | null>(null)
  const profile = ref<Profile | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isInitialized = ref(false)

  // Persist auth state to localStorage
  watch(
    [user, profile],
    ([newUser, newProfile]) => {
      if (newUser && newProfile) {
        saveToStorage({
          user: { id: newUser.id, email: newUser.email || '' },
          profile: newProfile
        })
      } else {
        clearStorage()
      }
    },
    { deep: true }
  )

  // Getters
  const isAuthenticated = computed(() => !!user.value && profile.value?.is_active === true)
  const userRole = computed(() => profile.value?.role || null)
  const userName = computed(() => profile.value?.full_name || user.value?.email || '')

  // Actions
  const initializeAuth = async () => {
    isLoading.value = true

    try {
      // First, try to restore from localStorage (for DEMO mode or persisted state)
      const persistedData = loadFromStorage()

      if (persistedData?.user && persistedData?.profile) {
        user.value = { id: persistedData.user.id, email: persistedData.user.email } as User
        profile.value = persistedData.profile
        isInitialized.value = true
        isLoading.value = false
        return
      }

      // DEMO MODE - skip Supabase
      if (DEMO_MODE) {
        isLoading.value = false
        return
      }

      // Get session from Supabase
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        user.value = session.user
        await loadProfile(session.user.id)
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          user.value = session.user
          await loadProfile(session.user.id)
        } else if (event === 'SIGNED_OUT') {
          user.value = null
          profile.value = null
          clearStorage()
        }
      })
    } catch (err) {
      console.error('Auth initialization error:', err)
    } finally {
      isInitialized.value = true
      isLoading.value = false
    }
  }

  const loadProfile = async (userId: string) => {
    try {
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError) throw profileError
      profile.value = data
    } catch (err) {
      console.error('Error loading profile:', err)
      profile.value = null
    }
  }

  const signIn = async (email: string, password: string) => {
    isLoading.value = true
    error.value = null

    try {
      // DEMO MODE
      if (DEMO_MODE) {
        const demoUser = DEMO_USERS[email as keyof typeof DEMO_USERS]
        if (demoUser && demoUser.password === password) {
          // Create mock user
          user.value = {
            id: email === 'admin@coffee.com' ? 'demo-admin-id' : 'demo-staff-id',
            email,
          } as User

          profile.value = {
            id: email === 'admin@coffee.com' ? 'demo-admin-id' : 'demo-staff-id',
            full_name: demoUser.full_name,
            role: demoUser.role as 'admin' | 'staff',
            is_active: true
          }

          // Persist to localStorage
          saveToStorage({
            user: { id: user.value.id, email: user.value.email || '' },
            profile: profile.value
          })

          return true
        } else {
          error.value = 'Email hoặc mật khẩu không đúng'
          return false
        }
      }

      // REAL SUPABASE MODE
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInError) {
        error.value = signInError.message
        return false
      }

      if (data.user) {
        user.value = data.user
        await loadProfile(data.user.id)
        return true
      }

      return false
    } catch (err) {
      error.value = 'Có lỗi xảy ra khi đăng nhập. Vui lòng kiểm tra kết nối mạng.'
      console.error('Login error:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const signOut = async () => {
    try {
      if (!DEMO_MODE) {
        await supabase.auth.signOut()
      }
      user.value = null
      profile.value = null
      clearStorage()
      return true
    } catch (err) {
      console.error('Error signing out:', err)
      return false
    }
  }

  return {
    user,
    profile,
    isLoading,
    error,
    isAuthenticated,
    userRole,
    userName,
    isInitialized,
    initializeAuth,
    signIn,
    signOut
  }
})
