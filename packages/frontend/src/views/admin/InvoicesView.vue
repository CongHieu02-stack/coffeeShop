<template>
  <div class="space-y-6">
    <!-- Filters -->
    <div class="flex items-center space-x-4">
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Tìm kiếm hóa đơn..."
          class="input w-64 pl-10"
        />
        <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      
      <select v-model="statusFilter" class="input w-40">
        <option value="all">Tất cả trạng thái</option>
        <option value="pending">Chờ thanh toán</option>
        <option value="paid">Đã thanh toán</option>
        <option value="cancelled">Đã hủy</option>
      </select>
      
      <input 
        v-model="dateFilter" 
        type="date" 
        class="input w-40"
      />
      
      <button @click="loadInvoices" class="btn-secondary">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
    
    <!-- Invoices Table -->
    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="table">
          <thead>
            <tr>
              <th>Mã hóa đơn</th>
              <th>Nhân viên</th>
              <th>Bàn</th>
              <th>Tổng tiền</th>
              <th>Phương thức</th>
              <th>Trạng thái</th>
              <th>Thời gian tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="invoice in filteredInvoices" :key="invoice.id">
              <td class="font-mono text-xs">{{ invoice.id.slice(0, 8) }}...</td>
              <td>{{ invoice.staff_name || 'Không xác định' }}</td>
              <td>Bàn {{ invoice.table_name || invoice.table_id }}</td>
              <td class="font-medium">{{ formatCurrency(invoice.total_amount) }}</td>
              <td>
                <span v-if="invoice.payment_method === 'cash'" class="badge-warning">Tiền mặt</span>
                <span v-else-if="invoice.payment_method === 'transfer'" class="badge-info">Chuyển khoản</span>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td>
                <span :class="getStatusClass(invoice.status)">
                  {{ getStatusText(invoice.status) }}
                </span>
              </td>
              <td class="text-gray-500">{{ formatDate(invoice.created_at) }}</td>
              <td>
                <button 
                  @click="viewInvoice(invoice)"
                  class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </td>
            </tr>
            <tr v-if="filteredInvoices.length === 0">
              <td colspan="8" class="text-center text-gray-500 py-8">
                Không tìm thấy hóa đơn nào
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Invoice Detail Modal -->
    <ModalDialog
      :is-open="isDetailModalOpen"
      title="Chi tiết hóa đơn"
      @close="isDetailModalOpen = false"
    >
      <div v-if="selectedInvoice" class="space-y-4">
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p class="text-gray-500">Mã hóa đơn</p>
            <p class="font-medium">{{ selectedInvoice.id }}</p>
          </div>
          <div>
            <p class="text-gray-500">Nhân viên</p>
            <p class="font-medium">{{ selectedInvoice.staff_name || 'Không xác định' }}</p>
          </div>
          <div>
            <p class="text-gray-500">Bàn</p>
            <p class="font-medium">Bàn {{ selectedInvoice.table_name || selectedInvoice.table_id }}</p>
          </div>
          <div>
            <p class="text-gray-500">Thời gian tạo</p>
            <p class="font-medium">{{ formatDateTime(selectedInvoice.created_at) }}</p>
          </div>
        </div>
        
        <div class="border-t pt-4">
          <h4 class="font-medium mb-3">Danh sách món</h4>
          <table class="w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-3 py-2 text-left">Sản phẩm</th>
                <th class="px-3 py-2 text-right">SL</th>
                <th class="px-3 py-2 text-right">Đơn giá</th>
                <th class="px-3 py-2 text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in selectedInvoice.items" :key="item.id" class="border-b">
                <td class="px-3 py-2">{{ item.product_name || item.product_id }}</td>
                <td class="px-3 py-2 text-right">{{ item.quantity }}</td>
                <td class="px-3 py-2 text-right">{{ formatCurrency(item.unit_price) }}</td>
                <td class="px-3 py-2 text-right font-medium">{{ formatCurrency(item.subtotal) }}</td>
              </tr>
            </tbody>
            <tfoot class="bg-gray-50">
              <tr>
                <td colspan="3" class="px-3 py-2 text-right font-medium">Tổng cộng:</td>
                <td class="px-3 py-2 text-right font-bold text-coffee-600">{{ formatCurrency(selectedInvoice.total_amount) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div class="flex items-center justify-between pt-4 border-t">
          <div>
            <span class="text-sm text-gray-500">Trạng thái:</span>
            <span :class="getStatusClass(selectedInvoice.status)" class="ml-2">
              {{ getStatusText(selectedInvoice.status) }}
            </span>
          </div>
          <div v-if="selectedInvoice.payment_method">
            <span class="text-sm text-gray-500">Thanh toán:</span>
            <span class="ml-2 font-medium">
              {{ selectedInvoice.payment_method === 'cash' ? 'Tiền mặt' : 'Chuyển khoản' }}
            </span>
          </div>
        </div>
      </div>
    </ModalDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useInvoicesStore, type Invoice } from '@/stores/invoices'
import ModalDialog from '@/components/common/ModalDialog.vue'

const invoicesStore = useInvoicesStore()

const searchQuery = ref('')
const statusFilter = ref('all')
const dateFilter = ref('')
const isDetailModalOpen = ref(false)
const selectedInvoice = ref<Invoice | null>(null)

const filteredInvoices = computed(() => {
  let result = invoicesStore.invoices
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(i => 
      i.id.toLowerCase().includes(query) ||
      (i.staff_name && i.staff_name.toLowerCase().includes(query))
    )
  }
  
  if (statusFilter.value !== 'all') {
    result = result.filter(i => i.status === statusFilter.value)
  }
  
  if (dateFilter.value) {
    result = result.filter(i => i.created_at.startsWith(dateFilter.value))
  }
  
  return result
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
    month: '2-digit',
    year: 'numeric'
  })
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
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

const viewInvoice = (invoice: Invoice) => {
  selectedInvoice.value = invoice
  isDetailModalOpen.value = true
}

const loadInvoices = () => {
  invoicesStore.loadInvoices()
}

onMounted(() => {
  loadInvoices()
})
</script>
