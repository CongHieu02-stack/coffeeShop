/**
 * Cart Store (Controller)
 * Quản lý giỏ hàng tạm thời khi Staff đang Order
 * Theo mẫu MVC - Controller gọi Service, quản lý state
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Product } from '@/models'
import { Voucher, VoucherService } from '@/services'

export interface CartItem {
  product: Product
  quantity: number
  note?: string
}

export const useCartStore = defineStore('cart', () => {
  // ==================== STATE ====================
  const items = ref<CartItem[]>([])
  const currentTableId = ref<number | null>(null)
  const currentInvoiceId = ref<string | null>(null)
  const appliedVoucher = ref<Voucher | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // ==================== GETTERS ====================
  const itemCount = computed(() =>
    items.value.reduce((count, item) => count + item.quantity, 0)
  )

  const subtotal = computed(() =>
    items.value.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  )

  const discountAmount = computed(() => {
    const voucher = appliedVoucher.value
    if (!voucher?.isValid()) {
      return 0
    }
    return voucher.calculateDiscount(subtotal.value)
  })

  const totalAmount = computed(() =>
    subtotal.value - discountAmount.value
  )

  const isEmpty = computed(() => items.value.length === 0)

  const canCheckout = computed(() =>
    !isEmpty.value && currentTableId.value !== null
  )

  // ==================== ACTIONS ====================

  /**
   * Thêm sản phẩm vào giỏ
   */
  const addItem = (product: Product, quantity: number = 1, note?: string) => {
    const existingItem = items.value.find(item => item.product.id === product.id)

    if (existingItem) {
      existingItem.quantity += quantity
      if (note) existingItem.note = note
    } else {
      items.value.push({ product, quantity, note })
    }
  }

  /**
   * Cập nhật số lượng sản phẩm
   */
  const updateQuantity = (productId: number, quantity: number) => {
    const item = items.value.find(i => i.product.id === productId)

    if (item) {
      if (quantity <= 0) {
        removeItem(productId)
      } else {
        item.quantity = quantity
      }
    }
  }

  /**
   * Xóa sản phẩm khỏi giỏ
   */
  const removeItem = (productId: number) => {
    items.value = items.value.filter(item => item.product.id !== productId)
  }

  /**
   * Cập nhật ghi chú cho sản phẩm
   */
  const updateNote = (productId: number, note: string) => {
    const item = items.value.find(i => i.product.id === productId)
    if (item) {
      item.note = note
    }
  }

  /**
   * Áp dụng voucher
   */
  const applyVoucher = async (code: string): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      const voucher = await VoucherService.getByCode(code)

      if (!voucher) {
        error.value = 'Mã giảm giá không tồn tại'
        return false
      }

      if (!voucher.isValid()) {
        error.value = 'Mã giảm giá đã hết hạn hoặc hết lượt sử dụng'
        return false
      }

      if (!voucher.isApplicable(subtotal.value)) {
        error.value = `Đơn hàng tối thiểu ${voucher.minOrderAmount.toLocaleString('vi-VN')}đ để áp dụng mã này`
        return false
      }

      appliedVoucher.value = voucher
      return true
    } catch (err: any) {
      error.value = err.message
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Xóa voucher
   */
  const removeVoucher = () => {
    appliedVoucher.value = null
  }

  /**
   * Chuyển giỏ hàng thành InvoiceItems
   */
  const toInvoiceItems = (): Array<{ productId: number; quantity: number; unitPrice: number }> => {
    return items.value.map(item => ({
      productId: item.product.id,
      quantity: item.quantity,
      unitPrice: item.product.price
    }))
  }

  /**
   * Đặt bàn hiện tại
   */
  const setTable = (tableId: number | null) => {
    currentTableId.value = tableId
  }

  /**
   * Đặt invoice ID (khi thêm món vào hóa đơn pending)
   */
  const setInvoiceId = (invoiceId: string | null) => {
    currentInvoiceId.value = invoiceId
  }

  /**
   * Xóa toàn bộ giỏ hàng
   */
  const clearCart = () => {
    items.value = []
    currentTableId.value = null
    currentInvoiceId.value = null
    appliedVoucher.value = null
    error.value = null
  }

  /**
   * Hoàn thành thanh toán - xóa giỏ và tăng usage nếu có voucher
   */
  const completeCheckout = async () => {
    if (appliedVoucher.value) {
      try {
        await VoucherService.incrementUsage(appliedVoucher.value.id)
      } catch (err) {
        console.error('Failed to increment voucher usage:', err)
      }
    }
    clearCart()
  }

  return {
    // State
    items,
    currentTableId,
    currentInvoiceId,
    appliedVoucher,
    isLoading,
    error,

    // Getters
    itemCount,
    subtotal,
    discountAmount,
    totalAmount,
    isEmpty,
    canCheckout,

    // Actions
    addItem,
    updateQuantity,
    removeItem,
    updateNote,
    applyVoucher,
    removeVoucher,
    toInvoiceItems,
    setTable,
    setInvoiceId,
    clearCart,
    completeCheckout
  }
})
