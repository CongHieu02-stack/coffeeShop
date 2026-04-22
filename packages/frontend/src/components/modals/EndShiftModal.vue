<template>
  <ModalDialog
    :is-open="isOpen"
    title="Kết ca - Tổng kết doanh thu"
    @close="handleClose"
  >
    <div id="shift-report" class="space-y-6">
      <!-- Header Info -->
      <div class="text-center border-b pb-4">
        <h2 class="text-xl font-bold text-gray-900">COFFEE SHOP</h2>
        <p class="text-gray-600">Báo cáo kết ca</p>
        <p class="text-sm text-gray-500 mt-1">
          Nhân viên: <span class="font-medium">{{ authStore.userName }}</span>
        </p>
        <p class="text-sm text-gray-500">
          Ngày: <span class="font-medium">{{ currentDate }}</span>
        </p>
        <p class="text-sm text-gray-500">
          Giờ kết ca: <span class="font-medium">{{ currentTime }}</span>
        </p>
      </div>

      <!-- Revenue Summary -->
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-blue-50 p-4 rounded-lg">
          <div class="flex items-center space-x-2">
            <svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span class="text-sm text-gray-600">Tiền mặt</span>
          </div>
          <p class="text-xl font-bold text-blue-600 mt-1">
            {{ formatCurrency(revenueSummary.cash) }}
          </p>
        </div>

        <div class="bg-green-50 p-4 rounded-lg">
          <div class="flex items-center space-x-2">
            <svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-sm text-gray-600">Chuyển khoản</span>
          </div>
          <p class="text-xl font-bold text-green-600 mt-1">
            {{ formatCurrency(revenueSummary.transfer) }}
          </p>
        </div>
      </div>

      <!-- Total -->
      <div class="bg-coffee-50 p-4 rounded-lg border-2 border-coffee-200">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <svg class="w-6 h-6 text-coffee-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span class="font-semibold text-gray-900">TỔNG DOANH THU</span>
          </div>
          <p class="text-2xl font-bold text-coffee-600">
            {{ formatCurrency(revenueSummary.total) }}
          </p>
        </div>
        <p class="text-sm text-gray-600 mt-2">
          Tổng số hóa đơn: <span class="font-medium">{{ revenueSummary.count }}</span>
        </p>
      </div>

      <!-- Invoice List -->
      <div v-if="todayPaidInvoices.length > 0" class="border rounded-lg overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-2 text-left">Bàn</th>
              <th class="px-4 py-2 text-right">Số tiền</th>
              <th class="px-4 py-2 text-center">PTTT</th>
              <th class="px-4 py-2 text-right">Giờ</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr v-for="invoice in todayPaidInvoices" :key="invoice.id" class="hover:bg-gray-50">
              <td class="px-4 py-2">{{ invoice.table_name }}</td>
              <td class="px-4 py-2 text-right">{{ formatCurrency(invoice.total_amount) }}</td>
              <td class="px-4 py-2 text-center">
                <span :class="invoice.payment_method === 'cash' ? 'text-blue-600' : 'text-green-600'">
                  {{ invoice.payment_method === 'cash' ? 'Tiền mặt' : 'CK' }}
                </span>
              </td>
              <td class="px-4 py-2 text-right text-gray-500">
                {{ formatTime(invoice.paid_at) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="text-center text-gray-500 py-8">
        Chưa có hóa đơn nào trong ngày
      </div>

      <!-- Signature Section -->
      <div class="mt-8 pt-6 border-t-2 border-gray-300">
        <p class="text-center font-medium text-gray-800 mb-6">
          Da ket ca va ban giao doanh thu
        </p>
        <div class="flex justify-around">
          <div class="text-center">
            <p class="font-medium text-gray-700 mb-2">Nhan vien ky ten</p>
            <div class="border-b-2 border-gray-400 w-48 mt-8"></div>
            <p class="text-sm text-gray-500 mt-1">{{ authStore.userName }}</p>
          </div>
          <div class="text-center">
            <p class="font-medium text-gray-700 mb-2">Quan ly ky ten</p>
            <div class="border-b-2 border-gray-400 w-48 mt-8"></div>
            <p class="text-sm text-gray-500 mt-1">&nbsp;</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <template #footer>
      <div class="flex justify-end space-x-3">
        <button @click="handleClose" class="btn-secondary">
          Đóng
        </button>
        <button @click="exportToPDF" class="btn-primary" :disabled="isExporting">
          <svg v-if="!isExporting" class="w-5 h-5 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span v-if="isExporting">Đang xuất...</span>
          <span v-else>Xuất hóa đơn PDF</span>
        </button>
      </div>
    </template>
  </ModalDialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import { useInvoicesStore } from '@/stores/invoices'
import { useTablesStore } from '@/stores/tables'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import ModalDialog from '@/components/common/ModalDialog.vue'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface Props {
  isOpen: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const authStore = useAuthStore()
const { success, error: showError, warning } = useToast()
const invoicesStore = useInvoicesStore()
const tablesStore = useTablesStore()
const router = useRouter()
const isExporting = ref(false)

const logoutAfterExport = async () => {
  await authStore.signOut()
  router.push('/login')
}

const saveShiftReport = async () => {
  try {
    const reportData = {
      staff_id: authStore.user?.id,
      total_cash: revenueSummary.value.cash,
      total_transfer: revenueSummary.value.transfer,
      total_amount: revenueSummary.value.total,
      invoice_count: revenueSummary.value.count,
      note: `Kết ca - ${authStore.userName} - ${today.value}`
    }

    console.log('📤 Saving shift report:', reportData)

    const { data, error } = await supabase
      .from('shift_reports')
      .insert(reportData)
      .select()
      .single()

    if (error) {
      console.error('❌ Error saving shift report:', error)
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      throw error
    } else {
      console.log('✅ Shift report saved successfully:', data)
    }
  } catch (err: any) {
    console.error('❌ Exception in saveShiftReport:', err)
    throw err
  }
}

const currentDate = computed(() => {
  return new Date().toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
})

const currentTime = computed(() => {
  return new Date().toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  })
})

const today = computed(() => new Date().toISOString().split('T')[0])

const todayPaidInvoices = computed(() => {
  // Get last shift end time
  const lastShift = invoicesStore.lastShiftEnd || localStorage.getItem('lastShiftEnd')
  const lastShiftTime = lastShift ? new Date(lastShift).getTime() : 0
  
  return invoicesStore.invoices.filter(i => {
    const isToday = i.created_at?.startsWith(today.value)
    const isPaid = i.status === 'paid'
    const isMyInvoice = i.staff_id === authStore.user?.id
    // Only show invoices after last shift end (or all if no last shift)
    const paidTime = i.paid_at ? new Date(i.paid_at).getTime() : 0
    const isAfterShift = lastShift ? paidTime > lastShiftTime : true
    return isToday && isPaid && isMyInvoice && isAfterShift
  }).sort((a, b) => new Date(b.paid_at!).getTime() - new Date(a.paid_at!).getTime())
})

const revenueSummary = computed(() => {
  const cash = todayPaidInvoices.value
    .filter(i => i.payment_method === 'cash')
    .reduce((sum, i) => sum + i.total_amount, 0)

  const transfer = todayPaidInvoices.value
    .filter(i => i.payment_method === 'transfer')
    .reduce((sum, i) => sum + i.total_amount, 0)

  return {
    cash,
    transfer,
    total: cash + transfer,
    count: todayPaidInvoices.value.length
  }
})

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

const formatTime = (dateString: string | null|undefined) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleClose = () => {
  emit('close')
}

const exportToPDF = async () => {
  isExporting.value = true
  try {
    const element = document.getElementById('shift-report')
    if (!element) {
      showError('Lỗi', 'Không tìm thấy nội dung báo cáo')
      return
    }

    // Capture the report as image
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    })

    const imgData = canvas.toDataURL('image/png')

    // Create PDF
    const doc = new jsPDF('p', 'mm', 'a4')
    const pageWidth = doc.internal.pageSize.getWidth()

    const imgWidth = pageWidth - 20 // 10mm margin each side
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    // Add image to PDF
    doc.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight)

    // Phan ky ten se duoc them vao HTML template de render qua html2canvas
    // Khong su dung doc.text() vi khong ho tro Unicode tieng Viet

    // Save
    const fileName = `ket-ca-${authStore.userName}-${today.value}.pdf`
    doc.save(fileName)

    success('Thành công', 'Đã xuất hóa đơn PDF thành công!')

    // Save shift report to database for admin
    try {
      await saveShiftReport()
      success('Thành công', 'Đã lưu phiếu kết ca vào hệ thống! Hệ thống sẽ tự động đăng xuất.')
    } catch (err: any) {
      warning('Cảnh báo', 'Xuất PDF thành công nhưng lưu phiếu kết ca thất bại! Vui lòng liên hệ admin.')
      console.error('Save shift report error:', err)
    }

    // Reset invoices data and tables
    invoicesStore.resetInvoices()
    tablesStore.resetTables()

    // Auto logout after export
    setTimeout(() => {
      logoutAfterExport()
    }, 2000)
  } catch (err) {
    console.error('Error exporting PDF:', err)
    showError('Lỗi', 'Có lỗi khi xuất PDF. Vui lòng thử lại.')
  } finally {
    isExporting.value = false
  }
}

onMounted(() => {
  if (authStore.user?.id) {
    invoicesStore.loadInvoices({ staffId: authStore.user.id })
  }
})
</script>
