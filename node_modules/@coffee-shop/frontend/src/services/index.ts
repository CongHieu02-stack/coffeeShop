/**
 * Services Index - Export tất cả Service classes
 * Data Access Layer
 */

export { supabase } from './supabaseClient'
export { AuthService } from './authService'
export { ProductService } from './productService'
export { StaffService } from './staffService'
export { TableService } from './tableService'
export { InvoiceService } from './invoiceService'
export { VoucherService } from './voucherService'
export { ReportService } from './reportService'

// Re-export Voucher from models for convenience
export { Voucher } from '@/models'

// Re-export types
export type { LoginCredentials, AuthResult } from './authService'
export type { CreateStaffData } from './staffService'
export type { CreateInvoiceData, InvoiceFilters } from './invoiceService'
export type { ShiftReportData, RevenueSummary, DailyReport } from './reportService'
