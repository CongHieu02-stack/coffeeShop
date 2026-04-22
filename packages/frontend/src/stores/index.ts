/**
 * Stores Index - Export tất cả Pinia Stores (Controllers)
 * Theo mẫu MVC
 */

// Core Stores
export { useAuthStore } from './authStore'
export { useProductStore } from './productStore'
export { useCartStore } from './cartStore'
export { useTableStore } from './tableStore'
export { useInvoiceStore } from './invoiceStore'
export { useShiftStore } from './shiftStore'

// Re-export old stores for compatibility (will be deprecated)
export { useProductsStore } from './products'
export { useTablesStore } from './tables'
export { useInvoicesStore } from './invoices'
export { useVouchersStore } from './vouchers'
export { useStaffStore } from './staff'

// Export types
export type { CartItem } from './cartStore'
export type { ShiftData } from './shiftStore'
