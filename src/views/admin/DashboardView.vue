<template>
  <div class="space-y-6">
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="card p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Tổng sản phẩm</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats.totalProducts }}</p>
          </div>
          <div class="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>
      </div>
      
      <div class="card p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Sản phẩm có sẵn</p>
            <p class="text-2xl font-bold text-green-600 mt-1">{{ stats.availableProducts }}</p>
          </div>
          <div class="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      </div>
      
      <div class="card p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Nhân viên</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats.totalStaff }}</p>
          </div>
          <div class="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      <div class="card p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Doanh thu hôm nay</p>
            <p class="text-2xl font-bold text-coffee-600 mt-1">{{ formatCurrency(stats.todayRevenue) }}</p>
          </div>
          <div class="w-12 h-12 bg-coffee-50 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-coffee-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Recent Invoices -->
    <div class="card">
      <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">Hóa đơn gần đây</h3>
        <router-link to="/admin/invoices" class="text-coffee-600 hover:text-coffee-700 text-sm font-medium">
          Xem tất cả
        </router-link>
      </div>
      
      <div class="overflow-x-auto">
        <table class="table">
          <thead>
            <tr>
              <th>Mã hóa đơn</th>
              <th>Nhân viên</th>
              <th>Bàn</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Thời gian</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="invoice in recentInvoices" :key="invoice.id">
              <td class="font-mono text-xs">{{ invoice.id.slice(0, 8) }}</td>
              <td>{{ invoice.staff_name || 'Không xác định' }}</td>
              <td>Bàn {{ invoice.table_name || invoice.table_id }}</td>
              <td class="font-medium">{{ formatCurrency(invoice.total_amount) }}</td>
              <td>
                <span :class="getStatusClass(invoice.status)">
                  {{ getStatusText(invoice.status) }}
                </span>
              </td>
              <td class="text-gray-500">{{ formatDate(invoice.created_at) }}</td>
            </tr>
            <tr v-if="recentInvoices.length === 0">
              <td colspan="6" class="text-center text-gray-500 py-8">
                Chưa có hóa đơn nào
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useProductsStore } from '@/stores/products'
import { useStaffStore } from '@/stores/staff'
import { useInvoicesStore } from '@/stores/invoices'

const productsStore = useProductsStore()
const staffStore = useStaffStore()
const invoicesStore = useInvoicesStore()

const stats = computed(() => ({
  totalProducts: productsStore.products.length,
  availableProducts: productsStore.availableProducts.length,
  totalStaff: staffStore.staff.length,
  todayRevenue: invoicesStore.todayInvoices
    .filter(i => i.status === 'paid')
    .reduce((sum, i) => sum + i.total_amount, 0)
}))

const recentInvoices = computed(() => {
  return invoicesStore.invoices.slice(0, 10)
})

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit'
  })
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'paid': return 'badge-success'
    case 'pending': return 'badge-warning'
    case 'cancelled': return 'badge-danger'
    default: return 'badge-info'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'paid': return 'Đã thanh toán'
    case 'pending': return 'Chờ thanh toán'
    case 'cancelled': return 'Đã hủy'
    default: return status
  }
}

onMounted(async () => {
  await Promise.all([
    productsStore.loadProducts(),
    staffStore.loadStaff(),
    invoicesStore.loadInvoices()
  ])
})
</script>
