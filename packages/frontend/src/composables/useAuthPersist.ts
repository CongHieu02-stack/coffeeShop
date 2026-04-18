const AUTH_STORAGE_KEY = 'coffee_shop_auth'

interface PersistedAuthData {
  user: {
    id: string
    email: string
  } | null
  profile: {
    id: string
    full_name: string
    role: 'admin' | 'staff'
    is_active: boolean
  } | null
}

export function useAuthPersist() {
  const saveToStorage = (data: PersistedAuthData) => {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data))
    } catch (err) {
      console.error('Failed to save auth to storage:', err)
    }
  }

  const loadFromStorage = (): PersistedAuthData | null => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (err) {
      console.error('Failed to load auth from storage:', err)
    }
    return null
  }

  const clearStorage = () => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY)
    } catch (err) {
      console.error('Failed to clear auth storage:', err)
    }
  }

  return {
    saveToStorage,
    loadFromStorage,
    clearStorage
  }
}
