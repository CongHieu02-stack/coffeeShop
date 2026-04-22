import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabaseClient'

// ================= TYPES =================
export interface InvoiceItem {
  id: string
  invoice_id: string
  product_id: 'string | null'
  product_name?: string
  quantity: number
  unit_price: number
  subtotal: number
}

export interface Invoice {
  id: string
  staff_id: string | number
  staff_name?: string
  table_id: string | number
  table_name?: string
  total_amount: number
  status: 'pending' | 'paid' | 'cancelled'
  payment_method?: 'cash' | 'transfer'
  paid_at?: string
  created_at: string
  items?: InvoiceItem[]
}

export interface LoadInvoicesParams {
  staffId?: string
  startDate?: string
  endDate?: string
}

// ================= STORE =================
export const useInvoicesStore = defineStore('invoices', () => {
  const invoices = ref<Invoice[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastShiftEnd = ref<string | null>(localStorage.getItem('lastShiftEnd'))
// 2. Khai báo actions
  const resetInvoices = () => {
    invoices.value = [] // Xóa danh sách hóa đơn hiện tại
    const now = new Date().toISOString()
    lastShiftEnd.value = now
    localStorage.setItem('lastShiftEnd', now) // Lưu thời điểm kết ca
  }
  
  // ================= LOAD =================
  const loadInvoices = async (params?: LoadInvoicesParams) => {
    isLoading.value = true
    error.value = null

    try {
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

      if (params?.staffId) {
        query = query.eq('staff_id', params.staffId)
      }

      if (params?.startDate) {
        query = query.gte('created_at', `${params.startDate}T00:00:00`)
      }

      if (params?.endDate) {
        query = query.lte('created_at', `${params.endDate}T23:59:59`)
      }

      const { data, error: fetchError } = await query
      if (fetchError) throw fetchError

      invoices.value = (data || []).map((invoice: any) => ({
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
      console.error('Lỗi tải hóa đơn:', err)
      error.value = err?.message || 'Không thể kết nối server'
    } finally {
      isLoading.value = false
    }
  }

  const paidInvoices = computed(() => {
  return invoices.value.filter(i => i.status === 'paid')
})

  // ================= UPDATE =================
  const updateInvoice = async (id: string, updates: Partial<Invoice>) => {
    isLoading.value = true
    error.value = null

    try {
      const safeUpdates: any = {
        staff_id: updates.staff_id,
        table_id: updates.table_id,
        total_amount: updates.total_amount,
        payment_method: updates.payment_method,
        status: updates.status,
        paid_at: updates.paid_at
      }

      // 🔥 FIX: loại luôn null + undefined
      Object.keys(safeUpdates).forEach(key => {
        if (safeUpdates[key] === undefined || safeUpdates[key] === null) {
          delete safeUpdates[key]
        }
      })

      const { data, error: supabaseError } = await supabase
        .from('invoices')
        .update(safeUpdates)
        .eq('id', id)
        .select()
        .single()

      if (supabaseError) throw supabaseError

      if (data) {
        const index = invoices.value.findIndex(i => i.id === id)

        if (index !== -1) {
          const oldInvoice = invoices.value[index]

          invoices.value[index] = {
            ...oldInvoice,
            ...data
          }
        }

        return invoices.value[index]
      }

      return null
    } catch (err: any) {
      console.error('Update invoice error:', err)
      error.value = err?.message || 'Lỗi cập nhật hóa đơn'
      return null
    } finally {
      isLoading.value = false
    }
  }

  // ================= PAYMENT =================
  const payInvoice = async (id: string, paymentMethod: 'cash' | 'transfer') => {
    const result = await updateInvoice(id, {
      status: 'paid',
      payment_method: paymentMethod,
      paid_at: new Date().toISOString()
    })

    // 🔥 FIX: trả boolean rõ ràng
    return result !== null
  }
  const createInvoice = async (
  invoiceData: Partial<Invoice>,
  items: {
    product_id: string | number
    quantity: number
    unit_price: number
  }[]
) => {
  try {
    // 1. Tạo invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert([invoiceData])
      .select()
      .single()

    if (invoiceError) {
      console.error('Create invoice error:', invoiceError)
      throw invoiceError
    }

    // 2. Tạo invoice_items
    if (items.length > 0) {
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(
          items.map(item => ({
            ...item,
            invoice_id: invoice.id
          }))
        )

      if (itemsError) {
        console.error('Create invoice items error:', itemsError)
        throw itemsError
      }
    }

    return invoice
  } catch (err) {
    console.error('createInvoice failed:', err)
    return null
  }
}


  // ================= REPORT =================
  const getRevenueSummary = (startDate?: string, endDate?: string, staffId?: string) => {
    let filtered = invoices.value.filter(i => i.status === 'paid')

    if (staffId) {
      filtered = filtered.filter(i => i.staff_id === staffId)
    }

    if (startDate && endDate) {
      filtered = filtered.filter(i => {
        const dateStr = i.created_at?.split('T')[0] || ''
        return dateStr >= startDate && dateStr <= endDate
      })
    }

    const total = filtered.reduce((sum, i) => sum + (i.total_amount || 0), 0)
    const cash = filtered
      .filter(i => i.payment_method === 'cash')
      .reduce((sum, i) => sum + (i.total_amount || 0), 0)

    const transfer = filtered
      .filter(i => i.payment_method === 'transfer')
      .reduce((sum, i) => sum + (i.total_amount || 0), 0)

    return {
      total,
      cash,
      transfer,
      count: filtered.length
    }
    
  }

  // ================= GETTERS =================
  const todayInvoices = computed(() => {
    const today = new Date().toISOString().split('T')[0]

    return invoices.value.filter(i =>
      (i.created_at || '').startsWith(today)
    )
  })

  // ================= EXPORT =================
  return {
  invoices,
  isLoading,
  error,
  todayInvoices,
  paidInvoices,
  lastShiftEnd,
  resetInvoices,

  loadInvoices,
  updateInvoice,
  payInvoice,
  getRevenueSummary,
  createInvoice, // 👈 THÊM DÒNG NÀY
 
}
})