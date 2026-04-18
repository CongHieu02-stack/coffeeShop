<template>
  <ModalDialog
    :is-open="isOpen"
    title="Đổi mật khẩu"
    @close="$emit('close')"
  >
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Mật khẩu mới
        </label>
        <input
          v-model="newPassword"
          type="password"
          required
          minlength="6"
          class="input w-full"
          placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Xác nhận mật khẩu mới
        </label>
        <input
          v-model="confirmPassword"
          type="password"
          required
          minlength="6"
          class="input w-full"
          placeholder="Nhập lại mật khẩu mới"
        />
      </div>

      <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>
      <p v-if="success" class="text-green-600 text-sm">Đổi mật khẩu thành công!</p>

      <div class="flex gap-3 pt-2">
        <button
          type="button"
          @click="$emit('close')"
          class="btn-secondary flex-1"
          :disabled="isLoading"
        >
          Hủy
        </button>
        <button
          type="submit"
          class="btn-primary flex-1"
          :disabled="isLoading || !isValid"
        >
          <span v-if="isLoading">Đang xử lý...</span>
          <span v-else>Đổi mật khẩu</span>
        </button>
      </div>
    </form>
  </ModalDialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import ModalDialog from '@/components/common/ModalDialog.vue'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const authStore = useAuthStore()

const newPassword = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref(false)
const isLoading = computed(() => authStore.isLoading)

const isValid = computed(() => {
  return newPassword.value.length >= 6 &&
         confirmPassword.value.length >= 6 &&
         newPassword.value === confirmPassword.value
})

const handleSubmit = async () => {
  error.value = ''
  success.value = false

  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Mật khẩu xác nhận không khớp'
    return
  }

  if (newPassword.value.length < 6) {
    error.value = 'Mật khẩu phải có ít nhất 6 ký tự'
    return
  }

  const result = await authStore.changePassword(newPassword.value)

  if (result) {
    success.value = true
    newPassword.value = ''
    confirmPassword.value = ''
    setTimeout(() => {
      emit('close')
      success.value = false
    }, 1500)
  } else {
    error.value = authStore.error || 'Không thể đổi mật khẩu'
  }
}
</script>
