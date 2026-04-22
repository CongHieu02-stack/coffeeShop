<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gray-900">Phiếu kết ca nhân viên</h2>
    </div>

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
          <button @click="loadShiftReports" class="btn-primary flex-1">
            <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Xem phiếu kết ca
          </button>
          
          <button @click="setToday" class="btn-secondary">
            Hôm nay
          </button>
        </div>
      </div>
    </div>

    <!-- Summary Cards -->
    <div v-if="shiftReports.length > 0" class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="card p-6 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
        <div class="text-sm opacity-90">Tổng doanh thu</div>
        <div class="text-3xl font-bold mt-1">{{ formatPrice(totalRevenue) }}</div>
        <div class="text-sm opacity-90 mt-2">{{ totalReports }} phiếu</div>
      </div>
      
      <div class="card p-6 bg-gradient-to-br from-amber-500 to-amber-600 text-white">
        <div class="text-sm opacity-90">Tiền mặt</div>
        <div class="text-3xl font-bold mt-1">{{ formatPrice(totalCash) }}</div>
        <div class="text-sm opacity-90 mt-2">{{ Math.round((totalCash/totalRevenue)*100) || 0 }}% tổng</div>
      </div>
      
      <div class="card p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
        <div class="text-sm opacity-90">Chuyển khoản</div>
        <div class="text-3xl font-bold mt-1">{{ formatPrice(totalTransfer) }}</div>
        <div class="text-sm opacity-90 mt-2">{{ Math.round((totalTransfer/totalRevenue)*100) || 0 }}% tổng</div>
      </div>
      
      <div class="card p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
        <div class="text-sm opacity-90">Tổng hóa đơn</div>
        <div class="text-3xl font-bold mt-1">{{ totalInvoices }}</div>
        <div class="text-sm opacity-90 mt-2">hóa đơn</div>
      </div>
    </div>

    <!-- Payment Methods Pie Chart -->
    <div v-if="shiftReports.length > 0" class="card p-6">
      <div class="flex flex-col md:flex-row items-center gap-8">
        <!-- Chart -->
        <div class="w-full md:w-1/2 lg:w-1/3">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 text-center">Tỷ lệ thanh toán</h3>
          <div class="relative h-64">
            <canvas ref="paymentChartCanvas"></canvas>
          </div>
        </div>
        
        <!-- Legend & Stats -->
        <div class="w-full md:w-1/2 lg:w-2/3 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-500">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600">Tiền mặt</p>
                  <p class="text-2xl font-bold text-amber-600">{{ formatPrice(totalCash) }}</p>
                </div>
                <div class="text-right">
                  <p class="text-3xl font-bold text-amber-600">{{ cashPercentage }}%</p>
                </div>
              </div>
              <div class="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div class="bg-amber-500 h-2 rounded-full" :style="{ width: cashPercentage + '%' }"></div>
              </div>
            </div>
            
            <div class="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600">Chuyển khoản</p>
                  <p class="text-2xl font-bold text-blue-600">{{ formatPrice(totalTransfer) }}</p>
                </div>
                <div class="text-right">
                  <p class="text-3xl font-bold text-blue-600">{{ transferPercentage }}%</p>
                </div>
              </div>
              <div class="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div class="bg-blue-500 h-2 rounded-full" :style="{ width: transferPercentage + '%' }"></div>
              </div>
            </div>
          </div>
          
          <!-- Quick filters -->
          <div class="flex flex-wrap gap-2 pt-4 border-t">
            <button @click="setFilter('today')" class="btn-secondary text-sm" :class="{ 'bg-coffee-100 border-coffee-500': filterMode === 'today' }">
              Hôm nay
            </button>
            <button @click="setFilter('week')" class="btn-secondary text-sm" :class="{ 'bg-coffee-100 border-coffee-500': filterMode === 'week' }">
              Tuần này
            </button>
            <button @click="setFilter('month')" class="btn-secondary text-sm" :class="{ 'bg-coffee-100 border-coffee-500': filterMode === 'month' }">
              Tháng này
            </button>
            <button @click="setFilter('custom')" class="btn-secondary text-sm" :class="{ 'bg-coffee-100 border-coffee-500': filterMode === 'custom' }">
              Tùy chọn
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Shift Reports Table -->
    <div class="card">
      <div class="px-6 py-4 border-b border-gray-100">
        <h3 class="text-lg font-semibold text-gray-900">Danh sách phiếu kết ca</h3>
      </div>
      
      <div v-if="isLoading" class="p-8 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
        <p class="mt-4 text-gray-500">Đang tải...</p>
      </div>
      
      <div v-else-if="shiftReports.length === 0" class="p-8 text-center text-gray-500">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p>Chưa có phiếu kết ca nào</p>
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Nhân viên</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Ngày</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Thời gian</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">Tổng doanh thu</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">Tiền mặt</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">Chuyển khoản</th>
              <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">Số HĐ</th>
              <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">Ghi chú</th>
              <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">Chi tiết</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="report in shiftReports" :key="report.id" class="hover:bg-gray-50">
              <td class="px-4 py-3 text-sm font-medium text-gray-900">
  {{ staffStore.staff.find(s => s.id === report.staff_id)?.full_name || report.staff_id?.slice(0, 8) || '-' }}
</td>
              <td class="px-4 py-3 text-sm text-gray-600">{{ formatDate(report.created_at) }}</td>
              <td class="px-4 py-3 text-sm text-gray-600">{{ formatTime(report.created_at) }}</td>
              <td class="px-4 py-3 text-sm font-semibold text-emerald-600 text-right">{{ formatPrice(report.total_amount) }}</td>
              <td class="px-4 py-3 text-sm text-amber-600 text-right">{{ formatPrice(report.total_cash) }}</td>
              <td class="px-4 py-3 text-sm text-blue-600 text-right">{{ formatPrice(report.total_transfer) }}</td>
              <td class="px-4 py-3 text-sm text-center">{{ report.invoice_count }}</td>
              <td class="px-4 py-3 text-sm text-center">
                <span v-if="report.note" class="text-gray-500" :title="report.note">{{ report.note.slice(0, 20) }}{{ report.note.length > 20 ? '...' : '' }}</span>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="px-4 py-3 text-sm text-center">
                <button 
                  @click="openDetailModal(report)"
                  class="text-amber-600 hover:text-amber-800 font-medium"
                >
                  Xem chi tiết
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="selectedReport" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h3 class="text-xl font-bold text-gray-900">Chi tiết phiếu kết ca</h3>
          <button @click="selectedReport = null" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="p-6 space-y-6">
          <!-- Summary -->
          <div class="grid grid-cols-4 gap-4">
            <div class="bg-gray-50 p-4 rounded-lg text-center">
              <div class="text-sm text-gray-600">Ngày</div>
              <div class="font-semibold">{{ formatDate(selectedReport.created_at) }}</div>
            </div>
            <div class="bg-emerald-50 p-4 rounded-lg text-center">
              <div class="text-sm text-gray-600">Tổng doanh thu</div>
              <div class="font-bold text-emerald-600 text-lg">{{ formatPrice(selectedReport.total_amount) }}</div>
            </div>
            <div class="bg-amber-50 p-4 rounded-lg text-center">
              <div class="text-sm text-gray-600">Tiền mặt</div>
              <div class="font-bold text-amber-600 text-lg">{{ formatPrice(selectedReport.total_cash) }}</div>
            </div>
            <div class="bg-blue-50 p-4 rounded-lg text-center">
              <div class="text-sm text-gray-600">Chuyển khoản</div>
              <div class="font-bold text-blue-600 text-lg">{{ formatPrice(selectedReport.total_transfer) }}</div>
            </div>
          </div>
          
          <!-- Invoice List -->
          <div v-if="reportInvoices.length > 0" class="border rounded-lg">
            <div class="bg-gray-50 px-4 py-3 border-b">
              <h4 class="font-semibold text-gray-900">Danh sách hóa đơn ({{ reportInvoices.length }})</h4>
            </div>
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">Mã HĐ</th>
                  <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">Bàn</th>
                  <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">Tổng tiền</th>
                  <th class="px-4 py-2 text-center text-sm font-medium text-gray-600">Phương thức</th>
                  <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">Thời gian</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="invoice in reportInvoices" :key="invoice.id" class="hover:bg-gray-50">
                  <td class="px-4 py-2 text-sm">{{ invoice.id?.slice(0, 8) }}</td>
                  <td class="px-4 py-2 text-sm">{{ invoice.table_id }}</td>
                  <td class="px-4 py-2 text-sm text-right font-medium">{{ formatPrice(invoice.total_amount) }}</td>
                  <td class="px-4 py-2 text-sm text-center">
                    <span :class="{
                      'px-2 py-1 rounded-full text-xs': true,
                      'bg-amber-100 text-amber-700': invoice.payment_method === 'cash',
                      'bg-blue-100 text-blue-700': invoice.payment_method === 'transfer'
                    }">{{ invoice.payment_method === 'cash' ? 'Tiền mặt' : 'Chuyển khoản' }}</span>
                  </td>
                  <td class="px-4 py-2 text-sm">{{ formatDateTime(invoice.paid_at) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div v-else class="text-center py-8 text-gray-500">
            Không có thông tin chi tiết hóa đơn
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useStaffStore } from '@/stores/staff'
import { supabase } from '@/lib/supabaseClient'
import { useToast } from '@/composables/useToast'
import Chart from 'chart.js/auto'

interface ShiftReport {
  id: string
  staff_id: string
  total_amount: number
  total_cash: number
  total_transfer: number
  invoice_count: number
  note?: string
  created_at: string
  staff?: {
    id: string
    email: string
    full_name: string
  }
}

const staffStore = useStaffStore()
const { error: showError } = useToast()
const shiftReports = ref<ShiftReport[]>([])
const isLoading = ref(false)
const selectedReport = ref<ShiftReport | null>(null)
const reportInvoices = ref<any[]>([])

const startDate = ref('')
const endDate = ref('')
const selectedStaff = ref('')
const filterMode = ref('custom')

// Chart
const paymentChartCanvas = ref<HTMLCanvasElement | null>(null)
let paymentChart: Chart | null = null

// Computed totals
const totalReports = computed(() => shiftReports.value.length)
const totalRevenue = computed(() => shiftReports.value.reduce((sum, r) => sum + r.total_amount, 0))
const totalCash = computed(() => shiftReports.value.reduce((sum, r) => sum + r.total_cash, 0))
const totalTransfer = computed(() => shiftReports.value.reduce((sum, r) => sum + r.total_transfer, 0))
const totalInvoices = computed(() => shiftReports.value.reduce((sum, r) => sum + r.invoice_count, 0))

// Payment percentages for chart
const cashPercentage = computed(() => {
  if (totalRevenue.value === 0) return 0
  return Math.round((totalCash.value / totalRevenue.value) * 100)
})

const transferPercentage = computed(() => {
  if (totalRevenue.value === 0) return 0
  return Math.round((totalTransfer.value / totalRevenue.value) * 100)
})

const formatPrice = (price: number) => {
  return price?.toLocaleString('vi-VN') + 'đ' || '0đ'
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('vi-VN')
}

const formatTime = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

const setToday = () => {
  const today = new Date().toISOString().split('T')[0]
  startDate.value = today
  endDate.value = today
  loadShiftReports()
}

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('vi-VN')
}

const openDetailModal = async (report: ShiftReport) => {
  selectedReport.value = report
  
  // Load invoices for this staff on the report date
  const reportDate = new Date(report.created_at).toISOString().split('T')[0]
  const startOfDay = reportDate + 'T00:00:00.000Z'
  const endOfDay = reportDate + 'T23:59:59.999Z'
  
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('staff_id', report.staff_id)
    .eq('status', 'paid')
    .gte('paid_at', startOfDay)
    .lte('paid_at', endOfDay)
  
  if (error) {
    console.error('Error loading invoices:', error)
    reportInvoices.value = []
  } else {
    reportInvoices.value = data || []
  }
}

const loadShiftReports = async () => {
  isLoading.value = true
  try {
    console.log('📥 Loading shift reports with filters:', {
      startDate: startDate.value,
      endDate: endDate.value,
      selectedStaff: selectedStaff.value
    })

    let query = supabase
      .from('shift_reports')
      .select('*')
      .order('created_at', { ascending: false })

    if (startDate.value) {
      query = query.gte('created_at', startDate.value + 'T00:00:00.000Z')
    }
    if (endDate.value) {
      query = query.lte('created_at', endDate.value + 'T23:59:59.999Z')
    }
    if (selectedStaff.value) {
      query = query.eq('staff_id', selectedStaff.value)
    }

    const { data, error } = await query

    if (error) {
      console.error('❌ Error loading shift reports:', error)
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      showError('Lỗi', 'Lỗi tải phiếu kết ca: ' + error.message)
      return
    }

    console.log('✅ Shift reports loaded:', data)
    console.log('📊 Total records:', data?.length || 0)
    shiftReports.value = data || []
  } catch (err: any) {
    console.error('❌ Exception in loadShiftReports:', err)
  } finally {
    isLoading.value = false
  }
}

// Quick filter functions
const setFilter = (mode: string) => {
  filterMode.value = mode
  const today = new Date()
  
  switch (mode) {
    case 'today':
      startDate.value = today.toISOString().split('T')[0]
      endDate.value = today.toISOString().split('T')[0]
      break
    case 'week':
      const weekAgo = new Date(today)
      weekAgo.setDate(today.getDate() - 7)
      startDate.value = weekAgo.toISOString().split('T')[0]
      endDate.value = today.toISOString().split('T')[0]
      break
    case 'month':
      const monthAgo = new Date(today)
      monthAgo.setMonth(today.getMonth() - 1)
      startDate.value = monthAgo.toISOString().split('T')[0]
      endDate.value = today.toISOString().split('T')[0]
      break
    case 'custom':
      // Keep current dates
      break
  }
  
  loadShiftReports()
}

// Chart rendering
const renderChart = () => {
  if (!paymentChartCanvas.value) return
  
  // Destroy existing chart
  if (paymentChart) {
    paymentChart.destroy()
  }
  
  const ctx = paymentChartCanvas.value.getContext('2d')
  if (!ctx) return
  
  paymentChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Tiền mặt', 'Chuyển khoản'],
      datasets: [{
        data: [totalCash.value, totalTransfer.value],
        backgroundColor: ['#f59e0b', '#3b82f6'],
        borderColor: ['#ffffff', '#ffffff'],
        borderWidth: 2,
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const value = context.raw as number
              const total = totalRevenue.value
              const percentage = total > 0 ? Math.round((value / total) * 100) : 0
              return `${context.label}: ${formatPrice(value)} (${percentage}%)`
            }
          }
        }
      }
    }
  })
}

// Watch for data changes to update chart
watch([shiftReports, totalCash, totalTransfer], () => {
  if (shiftReports.value.length > 0) {
    nextTick(() => {
      renderChart()
    })
  }
}, { deep: true })

onMounted(() => {
  staffStore.loadStaff()
  setToday()
})
</script>
