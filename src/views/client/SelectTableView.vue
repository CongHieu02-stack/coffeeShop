<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-gray-900">Chọn bàn</h2>
      <div class="flex items-center space-x-4 text-sm">
        <div class="flex items-center space-x-2">
          <div class="w-4 h-4 bg-green-100 border-2 border-green-500 rounded"></div>
          <span>Còn trống</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-4 h-4 bg-red-100 border-2 border-red-500 rounded"></div>
          <span>Đã có khách</span>
        </div>
      </div>
    </div>
    
    <!-- Confirm Clear Table Dialog -->
    <ConfirmDialog
      :is-open="isConfirmDialogOpen"
      title="Làm trống bàn"
      :message="`Bạn có chắc muốn làm trống ${tableToClear?.name || 'bàn'}?`"
      confirm-text="Làm trống"
      cancel-text="Hủy"
      @confirm="clearTable"
      @cancel="isConfirmDialogOpen = false"
    />
    
    <!-- Tables Grid -->
    <div v-if="tablesStore.isLoading" class="flex items-center justify-center py-12">
      <LoadingSpinner text="Đang tải..." />
    </div>
    
    <div v-else class="grid grid-cols-4 gap-6">
      <button
        v-for="table in tablesStore.tables"
        :key="table.id"
        @click="selectTable(table)"
        :disabled="table.is_occupied"
        :class="[
          'relative p-6 rounded-xl border-2 transition-all text-left',
          table.is_occupied 
            ? 'bg-red-50 border-red-200 cursor-not-allowed' 
            : 'bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-300 hover:shadow-lg cursor-pointer'
        ]"
      >
        <div class="flex items-center justify-between mb-2">
          <span class="text-2xl font-bold" :class="table.is_occupied ? 'text-red-700' : 'text-green-700'">
            {{ table.name || `Bàn ${table.id}` }}
          </span>
          <div 
            :class="[
              'w-3 h-3 rounded-full',
              table.is_occupied ? 'bg-red-500' : 'bg-green-500'
            ]"
          ></div>
        </div>
        
        <p :class="table.is_occupied ? 'text-red-600' : 'text-green-600'" class="text-sm mb-3">
          {{ table.is_occupied ? 'Đã có khách' : 'Còn trống' }}
        </p>
        
        <!-- Clear Table Button -->
        <button
          v-if="table.is_occupied"
          @click.stop="confirmClearTable(table)"
          class="w-full py-2 px-4 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium text-sm transition-colors flex items-center justify-center space-x-2"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span>Làm trống bàn</span>
        </button>
        
        <!-- Status Icon -->
        <div class="absolute top-4 right-4">
          <svg 
            v-if="table.is_occupied"
            class="w-6 h-6 text-red-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <svg 
            v-else
            class="w-6 h-6 text-green-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </button>
    </div>
    
    <!-- Empty State -->
    <div v-if="!tablesStore.isLoading && tablesStore.tables.length === 0" class="text-center py-12">
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      </div>
      <p class="text-gray-500">Chưa có bàn nào được thiết lập</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTablesStore, type Table } from '@/stores/tables'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

const router = useRouter()
const tablesStore = useTablesStore()

const isConfirmDialogOpen = ref(false)
const tableToClear = ref<Table | null>(null)

const selectTable = (table: Table) => {
  if (!table.is_occupied) {
    router.push(`/client/order/${table.id}`)
  }
}

const confirmClearTable = (table: Table) => {
  tableToClear.value = table
  isConfirmDialogOpen.value = true
}

const clearTable = async () => {
  if (tableToClear.value) {
    await tablesStore.updateTableStatus(tableToClear.value.id, false)
    isConfirmDialogOpen.value = false
    tableToClear.value = null
  }
}

onMounted(() => {
  tablesStore.loadTables()
})
</script>
