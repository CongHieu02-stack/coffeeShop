<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Tổng kết ca</h2>
        <p class="text-gray-500">{{ currentDate }}</p>
      </div>
      
      <div class="flex items-center space-x-4">
        <input 
          v-model="selectedDate" 
          type="date" 
          class="input w-40"
          @change="loadSummary"
        />
        <button @click="setToday" class="btn-secondary">
          Hôm nay
        </button>
      </div>
    </div>
    
    <!-- Summary Cards -->
    <div v-if="summary" class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Total Revenue -->
      <div class="card p-6 border-l-4 border-coffee-600">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Tổng doanh thu</p>
            <p class="text-3xl font-bold text-coffee-600 mt-2">{{ formatCurrency(summary.total) }}</p>
            <p class="text-sm text-gray-500 mt-1">{{ summary.count }} hóa đơn</p>
          </div>
          <div class="w-14 h-14 bg-coffee-100 rounded-full flex items-center justify-center">
            <svg class="w-7 h-7 text-coffee-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      <!-- Cash -->
      <div class="card p-6 border-l-4 border-yellow-500">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Tiền mặt</p>
            <p class="text-2xl font-bold text-yellow-600 mt-2">{{ formatCurrency(summary.cash) }}</p>
            <p class="text-sm text-gray-500 mt-1">
              {{ summary.total > 0 ? Math.round((summary.cash / summary.total) * 100) : 0 }}% tổng
            </p>
          </div>
          <div class="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg class="w-7 h-7 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      <!-- Transfer -->
      <div class="card p-6 border-l-4 border-blue-500">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Chuyển khoản</p>
            <p class="text-2xl font-bold text-blue-600 mt-2">{{ formatCurrency(summary.transfer) }}</p>
            <p class="text-sm text-gray-500 mt-1">
              {{ summary.total > 0 ? Math.round((summary.transfer / summary.total) * 100) : 0 }}% tổng
            </p>
          </div>
          <div class="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
            <svg class="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Invoices List -->
    <div v-if="todayInvoices.length > 0" class="card">
      <div class="px-6 py-4 border-b border-gray-100">
        <h3 class="text-lg font-semibold text-gray-900">Hóa đơn trong ngày</h3>
      </div>
      
      <div class="overflow-x-auto">
        <table class="table">
          <thead>
            <tr>
              <th>Mã hóa đơn</th>
              <th>Bàn</th>
              <th>Tổng tiền</th>
              <th>Phương thức</th>
              <th>Thời gian</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="invoice in todayInvoices" :key="invoice.id">
              <td class="font-mono text-xs">{{ invoice.id.slice(0, 8) }}...</td>
              <td>Bàn {{ invoice.table_name || invoice.table_id }}</td>
              <td class="font-medium">{{ formatCurrency(invoice.total_amount) }}</td>
              <td>
                <span v-if="invoice.payment_method === 'cash'" class="badge-warning">Tiền mặt</span>
                <span v-else-if="invoice.payment_method === 'transfer'" class="badge-info">Chuyển khoản</span>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="text-gray-500">{{ formatTime(invoice.paid_at || invoice.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Empty State -->
    <div v-else class="card p-12 text-center">
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p class="text-gray-500">Chưa có hóa đơn nào trong ngày này</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useInvoicesStore, type Invoice } from '@/stores/invoices'
import { useAuthStore } from '@/stores/auth'

const invoicesStore = useInvoicesStore()
const authStore = useAuthStore()

const selectedDate = ref('')
const todayInvoices = ref<Invoice[]>([])

const summary = computed(() => {
  if (todayInvoices.value.length === 0) return null
  
  const cash = todayInvoices.value
    .filter(i => i.payment_method === 'cash')
    .reduce((sum, i) => sum + i.total_amount, 0)
  
  const transfer = todayInvoices.value
    .filter(i => i.payment_method === 'transfer')
    .reduce((sum, i) => sum + i.total_amount, 0)
  
  return {
    total: cash + transfer,
    cash,
    transfer,
    count: todayInvoices.value.length
  }
})

const currentDate = computed(() => {
  const date = selectedDate.value ? new Date(selectedDate.value) : new Date()
  return date.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
})

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const setToday = () => {
  selectedDate.value = new Date().toISOString().split('T')[0]
  loadSummary()
}

const loadSummary = async () => {
  if (!selectedDate.value || !authStore.user) return
  
  console.log('Loading summary for user:', authStore.user.id, authStore.user)
  
  // Format: YYYY-MM-DD 00:00:00 to YYYY-MM-DD 23:59:59
  const startDate = selectedDate.value + 'T00:00:00.000Z'
  const endDate = selectedDate.value + 'T23:59:59.999Z'
  
  console.log('Date range:', { startDate, endDate })
  
  await invoicesStore.loadInvoices({
    // Temporarily remove staff filter to test
    // staffId: authStore.user.id,
    startDate,
    endDate
  })
  
  console.log('All invoices loaded:', invoicesStore.invoices)
  console.log('Paid invoices:', invoicesStore.paidInvoices)
  
  // Show all paid invoices for now (remove staff filter)
  todayInvoices.value = invoicesStore.paidInvoices
  
  console.log('Today invoices for staff:', todayInvoices.value)
}

onMounted(() => {
  setToday()
})

// Reload when window gets focus (returning from order page)
window.addEventListener('focus', () => {
  loadSummary()
})
</script>
