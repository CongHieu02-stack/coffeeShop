<template>
  <ModalDialog
    :is-open="isOpen"
    :title="title"
    :close-on-backdrop="false"
    @close="cancel"
  >
    <p class="text-gray-600">{{ message }}</p>
    
    <template #footer>
      <div class="flex justify-end space-x-3">
        <button 
          @click="cancel"
          class="btn-secondary"
        >
          {{ cancelText }}
        </button>
        <button 
          @click="confirm"
          :class="[
            'btn',
            variant === 'danger' ? 'btn-danger' : 'btn-primary'
          ]"
        >
          {{ confirmText }}
        </button>
      </div>
    </template>
  </ModalDialog>
</template>

<script setup lang="ts">
import ModalDialog from './ModalDialog.vue'

interface Props {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'primary' | 'danger'
}

withDefaults(defineProps<Props>(), {
  confirmText: 'Xác nhận',
  cancelText: 'Hủy',
  variant: 'primary'
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const confirm = () => {
  emit('confirm')
}

const cancel = () => {
  emit('cancel')
}
</script>
