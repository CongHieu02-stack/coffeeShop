/**
 * Shift Store (Controller)
 * Quản lý dữ liệu kết ca hiện tại
 * Theo mẫu MVC - Controller gọi ReportService, quản lý state
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Invoice } from '@/models'
import { ReportService, type ShiftReportData, type RevenueSummary } from '@/services'

export interface ShiftData {
  staffId: string
  staffName: string
  startTime: Date
  invoices: Invoice[]
  totalCash: number
  totalTransfer: number
  totalAmount: number
  invoiceCount: number
  note?: string
}

export const useShiftStore = defineStore('shift', () => {
  // ==================== STATE ====================
  const currentShift = ref<ShiftData | null>(null)
  const shiftReports = ref<unknown[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // ==================== GETTERS ====================
  const hasActiveShift = computed(() => currentShift.value !== null)

  const shiftDuration = computed(() => {
    if (!currentShift.value) return 0
    return Math.floor((Date.now() - currentShift.value.startTime.getTime()) / 60000) // minutes
  })

  // ==================== ACTIONS ====================

  /**
   * Bắt đầu ca làm việc mới
   */
  const startShift = (staffId: string, staffName: string) => {
    currentShift.value = {
      staffId,
      staffName,
      startTime: new Date(),
      invoices: [],
      totalCash: 0,
      totalTransfer: 0,
      totalAmount: 0,
      invoiceCount: 0
    }
  }

  /**
   * Thêm hóa đơn vào ca hiện tại
   */
  const addInvoice = (invoice: Invoice) => {
    if (!currentShift.value) return

    currentShift.value.invoices.push(invoice)
    currentShift.value.invoiceCount++
    currentShift.value.totalAmount += invoice.totalAmount

    if (invoice.paymentMethod === 'cash') {
      currentShift.value.totalCash += invoice.totalAmount
    } else if (invoice.paymentMethod === 'transfer') {
      currentShift.value.totalTransfer += invoice.totalAmount
    }
  }

  /**
   * Lấy báo cáo doanh thu cho ca hiện tại
   */
  const getShiftRevenue = async (): Promise<RevenueSummary | null> => {
    if (!currentShift.value) return null

    isLoading.value = true
    error.value = null

    try {
      const summary = await ReportService.getRevenueSummary(
        currentShift.value.startTime,
        new Date(),
        currentShift.value.staffId
      )
      return summary
    } catch (err: any) {
      error.value = err.message
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Chốt ca và lưu báo cáo
   */
  const endShift = async (note?: string): Promise<boolean> => {
    if (!currentShift.value) {
      error.value = 'Không có ca làm việc đang hoạt động'
      return false
    }

    isLoading.value = true
    error.value = null

    try {
      const reportData: ShiftReportData = {
        staffId: currentShift.value.staffId,
        totalCash: currentShift.value.totalCash,
        totalTransfer: currentShift.value.totalTransfer,
        totalAmount: currentShift.value.totalAmount,
        invoiceCount: currentShift.value.invoiceCount,
        note
      }

      await ReportService.createShiftReport(reportData)

      // Clear current shift
      currentShift.value = null
      return true
    } catch (err: any) {
      error.value = 'Không thể chốt ca: ' + err.message
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Load danh sách báo cáo ca
   */
  const loadShiftReports = async (staffId?: string, limit?: number) => {
    isLoading.value = true
    error.value = null

    try {
      shiftReports.value = await ReportService.getShiftReports(staffId, limit)
    } catch (err: any) {
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Hủy ca hiện tại (không lưu)
   */
  const cancelShift = () => {
    currentShift.value = null
  }

  return {
    // State
    currentShift,
    shiftReports,
    isLoading,
    error,

    // Getters
    hasActiveShift,
    shiftDuration,

    // Actions
    startShift,
    addInvoice,
    getShiftRevenue,
    endShift,
    loadShiftReports,
    cancelShift
  }
})
