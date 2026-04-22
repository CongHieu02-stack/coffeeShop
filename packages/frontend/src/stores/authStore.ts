/**
 * Auth Store (Controller)
 * Lưu thông tin phiên đăng nhập và phân quyền (Role-based)
 * Theo mẫu MVC - Controller gọi AuthService, quản lý state
 */
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { User } from '@/models'
import { AuthService, type LoginCredentials } from '@/services'
import { useAuthPersist } from '@/composables/useAuthPersist'

export const useAuthStore = defineStore('auth', () => {
  // ==================== STATE ====================
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isInitialized = ref(false)

  // Persistence
  const { saveToStorage, loadFromStorage, clearStorage } = useAuthPersist()

  // Watch for changes and persist
  watch(user, (newUser) => {
    if (newUser) {
      saveToStorage({
        user: {
          id: newUser.id,
          email: newUser.email
        },
        profile: {
          id: newUser.id,
          full_name: newUser.fullName,
          role: newUser.role,
          is_active: newUser.isActive
        }
      })
    } else {
      clearStorage()
    }
  }, { deep: true })

  // ==================== GETTERS ====================
  const isAuthenticated = computed(() =>
    !!user.value && user.value.isActive && user.value.canLogin()
  )

  const userRole = computed(() => user.value?.role || null)

  const isAdmin = computed(() => user.value?.isAdmin() || false)

  const isStaff = computed(() => user.value?.isStaff() || false)

  const userName = computed(() =>
    user.value?.getDisplayName() || ''
  )

  // ==================== ACTIONS ====================

  /**
   * Khởi tạo auth - kiểm tra session hiện tại
   */
  const initializeAuth = async () => {
    isLoading.value = true

    try {
      // Try restore from storage first
      const persisted = loadFromStorage()
      if (persisted?.user && persisted?.profile) {
        user.value = User.fromJSON(persisted.user)
        isInitialized.value = true
        isLoading.value = false
        return
      }

      // Check current session
      const currentUser = await AuthService.getCurrentUser()
      if (currentUser) {
        user.value = currentUser
      }
    } catch (err) {
      console.error('Auth initialization error:', err)
    } finally {
      isInitialized.value = true
      isLoading.value = false
    }
  }

  /**
   * Đăng nhập
   */
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      const result = await AuthService.login(credentials)

      if (!result.success || !result.user) {
        error.value = result.error || 'Đăng nhập thất bại'
        return false
      }

      user.value = result.user
      return true
    } catch (err: any) {
      error.value = err.message || 'Có lỗi xảy ra khi đăng nhập'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Đăng xuất
   */
  const logout = async (): Promise<boolean> => {
    try {
      await AuthService.logout()
      user.value = null
      clearStorage()
      return true
    } catch (err) {
      console.error('Logout error:', err)
      return false
    }
  }

  /**
   * Đổi mật khẩu
   */
  const changePassword = async (newPassword: string): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      const result = await AuthService.changePassword(newPassword)

      if (!result.success) {
        error.value = result.error || 'Không thể đổi mật khẩu'
        return false
      }

      return true
    } catch (err: any) {
      error.value = err.message || 'Có lỗi xảy ra'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Lắng nghe thay đổi auth state
   */
  const subscribeToAuthChanges = () => {
    return AuthService.onAuthStateChange((authUser) => {
      user.value = authUser
    })
  }

  return {
    // State
    user,
    isLoading,
    error,
    isInitialized,

    // Getters
    isAuthenticated,
    userRole,
    isAdmin,
    isStaff,
    userName,

    // Actions
    initializeAuth,
    login,
    logout,
    changePassword,
    subscribeToAuthChanges
  }
})
