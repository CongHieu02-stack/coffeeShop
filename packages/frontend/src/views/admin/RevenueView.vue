<template>
  <div class="space-y-6">
    <!-- Filters -->
    <div class="card p-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label class="label">Từ ngày</label>
          <input v-model="startDate" type="date" class="input" />
        </div>
        
        <div>
          <label class="label">Đến ngày</label>
          <input v-model="endDate" type="date" class="input" />
        </div>
        
        <div>
          <label class="label">Nhân viên (tùy chọn)</label>
          <select v-model="selectedStaff" class="input">
            <option value="">Tất cả nhân viên</option>
            <option v-for="staff in staffStore.staff" :key="staff.id" :value="staff.id">
              {{ staff.full_name }}
            </option>
          </select>
        </div>
        
        <div class="flex space-x-2">
          <button @click="calculateRevenue" class="btn-primary flex-1">
            <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Xem doanh thu
          </button>
          
          <button @click="setToday" class="btn-secondary">
            Hôm nay
          </button>
        </div>
      </div>
    </div>
    
    <!-- Summary Cards -->
    <div v-if="revenueData" class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Total -->
      <div class="card p-6 border-l-4 border-coffee-600">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Tổng doanh thu</p>
            <p class="text-3xl font-bold text-coffee-600 mt-2">{{ formatCurrency(revenueData.total) }}</p>
            <p class="text-sm text-gray-500 mt-1">{{ revenueData.count }} hóa đơn</p>
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
            <p class="text-2xl font-bold text-yellow-600 mt-2">{{ formatCurrency(revenueData.cash) }}</p>
            <p class="text-sm text-gray-500 mt-1">
              {{ revenueData.total > 0 ? Math.round((revenueData.cash / revenueData.total) * 100) : 0 }}% tổng doanh thu
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
            <p class="text-2xl font-bold text-blue-600 mt-2">{{ formatCurrency(revenueData.transfer) }}</p>
            <p class="text-sm text-gray-500 mt-1">
              {{ revenueData.total > 0 ? Math.round((revenueData.transfer / revenueData.total) * 100) : 0 }}% tổng doanh thu
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
    
    <!-- Daily Breakdown -->
    <div v-if="revenueData && dailyBreakdown.length > 0" class="card">
      <div class="px-6 py-4 border-b border-gray-100">
        <h3 class="text-lg font-semibold text-gray-900">Chi tiết theo ngày</h3>
      </div>
      
      <div class="overflow-x-auto">
        <table class="table">
          <thead>
            <tr>
              <th>Ngày</th>
              <th>Số hóa đơn</th>
              <th>Tiền mặt</th>
              <th>Chuyển khoản</th>
              <th>Tổng</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="day in dailyBreakdown" :key="day.date">
              <td class="font-medium">{{ formatDate(day.date) }}</td>
              <td>{{ day.count }}</td>
              <td class="text-yellow-600">{{ formatCurrency(day.cash) }}</td>
              <td class="text-blue-600">{{ formatCurrency(day.transfer) }}</td>
              <td class="font-bold text-coffee-600">{{ formatCurrency(day.total) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Empty State -->
    <div v-if="!revenueData" class="card p-12 text-center">
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <p class="text-gray-500">Chọn khoảng thời gian để xem doanh thu</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useInvoicesStore } from '@/stores/invoices'
import { useStaffStore } from '@/stores/staff'

const invoicesStore = useInvoicesStore()
const staffStore = useStaffStore()

const startDate = ref('')
const endDate = ref('')
const selectedStaff = ref('')
const revenueData = ref<{ total: number; cash: number; transfer: number; count: number } | null>(null)

const dailyBreakdown = computed(() => {
  if (!startDate.value || !endDate.value) return []
  
  const start = new Date(startDate.value)
  const end = new Date(endDate.value)
  const days: { date: string; total: number; cash: number; transfer: number; count: number }[] = []
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0]
    const dayInvoices = invoicesStore.invoices.filter(i => {
      const matchesDate = i.created_at.startsWith(dateStr)
      const matchesStaff = selectedStaff.value ? i.staff_id === selectedStaff.value : true
      return matchesDate && matchesStaff && i.status === 'paid'
    })
    
    const cash = dayInvoices.filter(i => i.payment_method === 'cash').reduce((s, i) => s + i.total_amount, 0)
    const transfer = dayInvoices.filter(i => i.payment_method === 'transfer').reduce((s, i) => s + i.total_amount, 0)
    
    if (dayInvoices.length > 0) {
      days.push({
        date: dateStr,
        total: cash + transfer,
        cash,
        transfer,
        count: dayInvoices.length
      })
    }
  }
  
  return days.reverse()
})

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const setToday = () => {
  const today = new Date().toISOString().split('T')[0]
  startDate.value = today
  endDate.value = today
  calculateRevenue()
}

const calculateRevenue = async () => {
  if (!startDate.value || !endDate.value) return
  
  await invoicesStore.loadInvoices({
    staffId: selectedStaff.value || undefined,
    startDate: startDate.value,
    endDate: endDate.value
  })
  
  revenueData.value = invoicesStore.getRevenueSummary(
    startDate.value,
    endDate.value,
    selectedStaff.value || undefined
  )
}

onMounted(() => {
  staffStore.loadStaff()
  // Set default dates to today
  setToday()
})
</script>
