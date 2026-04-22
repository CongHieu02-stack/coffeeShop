<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-coffee-50 to-coffee-100">
    <div class="w-full max-w-md p-8">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-coffee-600 rounded-full mb-4">
          <svg class="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-gray-900">Coffee Shop</h1>
        <p class="text-gray-600 mt-2">Hệ thống quản lý quán cà phê</p>
      </div>
      
      <!-- Login Form -->
      <div class="card p-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-6 text-center">Đăng nhập</h2>
        
        <form @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label class="label">Email</label>
            <input
              ref="emailInput"
              v-model="email"
              type="email"
              class="input"
              placeholder="Nhập email"
              required
              @invalid="handleEmailInvalid"
            />
            <div v-if="emailError" class="mt-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {{ emailError }}
            </div>
          </div>
          
          <div>
            <label class="label">Mật khẩu</label>
            <input
              v-model="password"
              type="password"
              class="input"
              placeholder="Nhập mật khẩu"
              required
            />
            <div v-if="authStore.error" class="mt-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {{ authStore.error }}
            </div>
          </div>
          
          <button
            type="submit"
            class="btn-primary w-full"
            :disabled="authStore.isLoading"
          >
            <LoadingSpinner v-if="authStore.isLoading" class="inline-block mr-2" />
            <span v-else>Đăng nhập</span>
          </button>
        </form>
      </div>
      
      <!-- Demo accounts info -->
      <div class="mt-6 text-center">
       
        <div class="space-y-1 text-xs text-gray-400">
          
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const emailInput = ref<HTMLInputElement>()
const emailError = ref('')

const handleEmailInvalid = (event: Event) => {
  event.preventDefault()
  const input = event.target as HTMLInputElement
  
  if (!input.value) {
    emailError.value = 'Vui lòng nhập email'
  } else if (!input.validity.valid) {
    emailError.value = 'Email không đúng định dạng. Vui lòng nhập email hợp lệ'
  }
}

const handleLogin = async () => {
  // Clear previous email error
  emailError.value = ''
  
  // Validate email format
  if (!email.value) {
    emailError.value = 'Vui lòng nhập email'
    return
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    emailError.value = 'Email không đúng định dạng. Vui lòng nhập email hợp lệ'
    return
  }
  
  const success = await authStore.signIn(email.value, password.value)
  
  if (success) {
    // Redirect based on role
    if (authStore.userRole === 'admin') {
      router.push('/admin')
    } else {
      router.push('/client')
    }
  }
}
</script>
