import { ref } from 'vue'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: number
  type: ToastType
  title: string
  message?: string
  duration?: number
}

const toasts = ref<Toast[]>([])
let toastIdCounter = 0

export function useToast() {
  const addToast = (type: ToastType, title: string, message?: string, duration = 3000) => {
    const id = toastIdCounter++
    toasts.value.push({ id, type, title, message, duration })
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
    
    return id
  }

  const removeToast = (id: number) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const success = (title: string, message?: string, duration?: number) => {
    return addToast('success', title, message, duration)
  }

  const error = (title: string, message?: string, duration?: number) => {
    return addToast('error', title, message, duration)
  }

  const warning = (title: string, message?: string, duration?: number) => {
    return addToast('warning', title, message, duration)
  }

  const info = (title: string, message?: string, duration?: number) => {
    return addToast('info', title, message, duration)
  }

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info
  }
}
