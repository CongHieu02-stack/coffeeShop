import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabaseClient'

// 1. Định nghĩa cấu trúc dữ liệu cho Chi tiết món (Invoice Item)
export interface InvoiceItem {
  id: string
  invoice_id: string
  product_id: string | number
  product_name?: string
  quantity: number
  unit_price: number
  subtotal: number
}

// 2. Định nghĩa cấu trúc dữ liệu cho Hóa đơn (Invoice)
export interface Invoice {
  id: string
  staff_id: string
  staff_name?: string
  table_id: string | number
  table_name?: string
  total_amount: number
  status: 'pending' | 'paid' | 'cancelled'
  payment_method?: 'cash' | 'transfer'
  created_at: string
  items?: InvoiceItem[]
}

// 3. Cấu trúc tham số để lọc hóa đơn
export interface LoadInvoicesParams {
  staffId?: string
  startDate?: string
  endDate?: string
}

export const useInvoicesStore = defineStore('invoices', () => {
  // State
  const invoices = ref<Invoice[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  const loadInvoices = async (params?: LoadInvoicesParams) => {
    isLoading.value = true
    error.value = null
    
    try {
      // Bắt đầu xây dựng câu truy vấn
      let query = supabase
        .from('invoices')
        .select(`
          *,
          staff:profiles!staff_id (full_name),
          items:invoice_items (
            id, invoice_id, product_id, quantity, unit_price, subtotal, 
            product:products!product_id (name)
          )
        `)
        .order('created_at', { ascending: false })

      // Áp dụng bộ lọc (nếu trang Doanh thu truyền params vào)
      if (params) {
        if (params.staffId) {
          query = query.eq('staff_id', params.staffId)
        }
        if (params.startDate) {
          query = query.gte('created_at', `${params.startDate}T00:00:00`)
        }
        if (params.endDate) {
          query = query.lte('created_at', `${params.endDate}T23:59:59`)
        }
      }

      // Thực thi truy vấn
      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      // Làm phẳng dữ liệu (Mapping)
      invoices.value = (data || []).map(invoice => ({
        ...invoice,
        staff_name: invoice.staff?.full_name || 'Không xác định',
        items: (invoice.items || []).map((item: any) => ({
          id: item.id,
          invoice_id: item.invoice_id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.subtotal,
          product_name: item.product?.name || 'Sản phẩm không rõ'
        }))
      }))

    } catch (err: any) {
      console.error('Lỗi tải danh sách hóa đơn:', err)
      error.value = err.message || 'Không thể kết nối đến máy chủ.'
    } finally {
      isLoading.value = false
    }
  }

  // Hàm tính toán tổng doanh thu (Dành cho trang Báo cáo)
  const getRevenueSummary = (startDate?: string, endDate?: string, staffId?: string) => {
    let filtered = invoices.value.filter(i => i.status === 'paid')

    if (staffId) {
      filtered = filtered.filter(i => i.staff_id === staffId)
    }

    if (startDate && endDate) {
      filtered = filtered.filter(i => {
        const dateStr = i.created_at.split('T')[0]
        return dateStr >= startDate && dateStr <= endDate
      })
    }

    const total = filtered.reduce((sum, invoice) => sum + invoice.total_amount, 0)
    const cash = filtered.filter(i => i.payment_method === 'cash').reduce((sum, invoice) => sum + invoice.total_amount, 0)
    const transfer = filtered.filter(i => i.payment_method === 'transfer').reduce((sum, invoice) => sum + invoice.total_amount, 0)

    return {
      total,
      cash,
      transfer,
      count: filtered.length
    }
  }

  // Getters
  const todayInvoices = computed(() => {
    const today = new Date().toLocaleDateString('en-CA') 
    return invoices.value.filter(i => i.created_at.startsWith(today))
  })

  return {
    // State & Getters
    invoices,
    isLoading,
    error,
    todayInvoices,
    
    // Actions
    loadInvoices,
    getRevenueSummary
  }
})