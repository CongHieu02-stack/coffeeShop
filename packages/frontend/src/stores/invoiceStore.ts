/**
 * Invoice Store (Controller)
 * Quản lý hóa đơn
 * Theo mẫu MVC - Controller gọi InvoiceService, quản lý state
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Invoice, InvoiceItem } from '@/models'
import { InvoiceService, type CreateInvoiceData, type InvoiceFilters } from '@/services'

export { InvoiceItem }

export const useInvoiceStore = defineStore('invoices', () => {
  // ==================== STATE ====================
  const invoices = ref<Invoice[]>([])
  const currentInvoice = ref<Invoice | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // ==================== GETTERS ====================
  const pendingInvoices = computed(() =>
    invoices.value.filter(inv => inv.status === 'pending')
  )

  const paidInvoices = computed(() =>
    invoices.value.filter(inv => inv.status === 'paid')
  )

  const todayInvoices = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return invoices.value.filter(inv => inv.createdAt.toISOString().startsWith(today))
  })

  const totalRevenue = computed(() =>
    paidInvoices.value.reduce((sum, inv) => sum + inv.totalAmount, 0)
  )

  // ==================== ACTIONS ====================

  /**
   * Load danh sách hóa đơn
   */
  const loadInvoices = async (filters?: InvoiceFilters) => {
    isLoading.value = true
    error.value = null

    try {
      invoices.value = await InvoiceService.getAll(filters)
    } catch (err: any) {
      error.value = 'Không thể tải danh sách hóa đơn'
      console.error('Error loading invoices:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Load hóa đơn theo ID
   */
  const loadInvoiceById = async (id: string) => {
    isLoading.value = true
    error.value = null

    try {
      const invoice = await InvoiceService.getById(id)
      currentInvoice.value = invoice
      return invoice
    } catch (err: any) {
      error.value = 'Không thể tải hóa đơn'
      console.error('Error loading invoice:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Tạo hóa đơn mới
   */
  const createInvoice = async (data: CreateInvoiceData) => {
    isLoading.value = true
    error.value = null

    try {
      const newInvoice = await InvoiceService.create(data)
      invoices.value.unshift(newInvoice)
      currentInvoice.value = newInvoice
      return newInvoice
    } catch (err: any) {
      error.value = 'Không thể tạo hóa đơn'
      console.error('Error creating invoice:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Thanh toán hóa đơn
   */
  const payInvoice = async (id: string, paymentMethod: 'cash' | 'transfer') => {
    isLoading.value = true
    error.value = null

    try {
      const updated = await InvoiceService.pay(id, paymentMethod)
      const index = invoices.value.findIndex(inv => inv.id === id)
      if (index !== -1) {
        invoices.value[index] = updated
      }
      currentInvoice.value = updated
      return updated
    } catch (err: any) {
      error.value = 'Không thể thanh toán hóa đơn'
      console.error('Error paying invoice:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Thêm món vào hóa đơn pending
   */
  const addItemsToInvoice = async (
    invoiceId: string,
    items: Array<{ productId: number; quantity: number; unitPrice: number }>
  ) => {
    isLoading.value = true
    error.value = null

    try {
      const updated = await InvoiceService.addItems(invoiceId, items)
      const index = invoices.value.findIndex(inv => inv.id === invoiceId)
      if (index !== -1) {
        invoices.value[index] = updated
      }
      currentInvoice.value = updated
      return updated
    } catch (err: any) {
      error.value = 'Không thể thêm món vào hóa đơn'
      console.error('Error adding items:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Xóa hóa đơn khỏi state
   */
  const clearCurrentInvoice = () => {
    currentInvoice.value = null
  }

  return {
    // State
    invoices,
    currentInvoice,
    isLoading,
    error,

    // Getters
    pendingInvoices,
    paidInvoices,
    todayInvoices,
    totalRevenue,

    // Actions
    loadInvoices,
    loadInvoiceById,
    createInvoice,
    payInvoice,
    addItemsToInvoice,
    clearCurrentInvoice
  }
})
