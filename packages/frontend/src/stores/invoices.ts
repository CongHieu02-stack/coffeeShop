import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabaseClient'

// DEMO MODE
const DEMO_MODE = false

const today = new Date().toISOString()

const DEMO_INVOICES: Invoice[] = [
  {
    id: 'demo-invoice-1',
    staff_id: 'demo-staff-id',
    staff_name: 'Staff User',
    table_id: 2,
    table_name: 'Bàn 2',
    total_amount: 75000,
    payment_method: 'cash',
    status: 'paid',
    paid_at: today,
    created_at: today,
    items: [
      { id: 'item-1', invoice_id: 'demo-invoice-1', product_id: 1, product_name: 'Cà phê đen', quantity: 2, unit_price: 25000, subtotal: 50000 },
      { id: 'item-2', invoice_id: 'demo-invoice-1', product_id: 2, product_name: 'Cà phê sữa', quantity: 1, unit_price: 30000, subtotal: 30000 }
    ]
  },
  {
    id: 'demo-invoice-2',
    staff_id: 'demo-staff-id',
    staff_name: 'Staff User',
    table_id: 5,
    table_name: 'Bàn 5',
    total_amount: 90000,
    payment_method: 'transfer',
    status: 'paid',
    paid_at: today,
    created_at: today,
    items: [
      { id: 'item-3', invoice_id: 'demo-invoice-2', product_id: 4, product_name: 'Cappuccino', quantity: 2, unit_price: 45000, subtotal: 90000 }
    ]
  }
]

export interface InvoiceItem {
  id: string
  invoice_id: string
  product_id: number
  product_name?: string
  quantity: number
  unit_price: number
  subtotal?: number
}

export interface Invoice {
  id: string
  staff_id: string
  staff_name?: string
  table_id: number
  table_name?: string
  total_amount: number
  payment_method: 'cash' | 'transfer' | null
  status: 'pending' | 'paid' | 'cancelled'
  paid_at: string | null
  created_at: string
  items?: InvoiceItem[]
}

export const useInvoicesStore = defineStore('invoices', () => {
  // State
  const invoices = ref<Invoice[]>([])
  const currentInvoice = ref<Invoice | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const pendingInvoices = computed(() =>
    invoices.value.filter(i => i.status === 'pending')
  )

  const paidInvoices = computed(() =>
    invoices.value.filter(i => i.status === 'paid')
  )

  const todayInvoices = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return invoices.value.filter(i => i.created_at.startsWith(today))
  })

  // Actions
  const loadInvoices = async (filters?: { staffId?: string; startDate?: string; endDate?: string }) => {
    isLoading.value = true
    error.value = null

    try {
      if (DEMO_MODE) {
        let result = [...DEMO_INVOICES]

        if (filters?.staffId) {
          result = result.filter(i => i.staff_id === filters.staffId)
        }

        invoices.value = result
        isLoading.value = false
        return
      }

      let query = supabase
        .from('invoices')
        .select(`
          *,
          items:invoice_items(*, product:products(name))
        `)
        .order('created_at', { ascending: false })

      if (filters?.staffId) {
        query = query.eq('staff_id', filters.staffId)
      }

      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate)
      }

      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate)
      }

      const { data, error: supabaseError } = await query

      if (supabaseError) throw supabaseError

      invoices.value = (data || []).map((invoice: any) => ({
        ...invoice,
        items: invoice.items?.map((item: any) => ({
          ...item,
          product_name: item.product?.name
        }))
      }))
    } catch (err) {
      error.value = 'Không thể tải danh sách hóa đơn'
      console.error('Error loading invoices:', err)
    } finally {
      isLoading.value = false
    }
  }

  const createInvoice = async (invoice: Omit<Invoice, 'id' | 'created_at'>, items: Omit<InvoiceItem, 'id' | 'invoice_id'>[]) => {
    isLoading.value = true
    error.value = null

    try {
      console.log('Creating invoice in store:', invoice)
      console.log('Items:', items)

      // Create invoice
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .insert(invoice)
        .select()
        .single()

      console.log('Invoice insert result:', { data: invoiceData, error: invoiceError })

      if (invoiceError) throw invoiceError

      if (invoiceData) {
        // Create invoice items - exclude subtotal as it has DEFAULT constraint
        const itemsWithInvoiceId = items.map(({ subtotal, ...item }) => ({
          ...item,
          invoice_id: invoiceData.id
        }))

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(itemsWithInvoiceId)

        if (itemsError) throw itemsError

        // Update table status
        await supabase
          .from('cafe_tables')
          .update({ is_occupied: true })
          .eq('id', invoice.table_id)

        invoices.value.unshift(invoiceData)
        return invoiceData
      }
      return null
    } catch (err: any) {
      error.value = 'Không thể tạo hóa đơn'
      console.error('Error creating invoice:', err)
      const errorMsg = err?.message || err?.error?.message || JSON.stringify(err)
      alert('Lỗi tạo hóa đơn: ' + errorMsg)
      return null
    } finally {
      isLoading.value = false
    }
  }

  const updateInvoice = async (id: string, updates: Partial<Invoice>) => {
    isLoading.value = true
    error.value = null

    try {
      console.log('Updating invoice:', id, updates)
      const { data, error: supabaseError } = await supabase
        .from('invoices')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      console.log('Update result:', { data, error: supabaseError })

      if (supabaseError) throw supabaseError

      if (data) {
        const index = invoices.value.findIndex(i => i.id === id)
        if (index !== -1) {
          invoices.value[index] = { ...invoices.value[index], ...data }
        }
        return data
      }
      return null
    } catch (err: any) {
      error.value = 'Không thể cập nhật hóa đơn'
      console.error('Error updating invoice:', err)
      const errorMsg = err?.message || err?.error?.message || JSON.stringify(err)
      alert('Lỗi cập nhật hóa đơn: ' + errorMsg)
      return null
    } finally {
      isLoading.value = false
    }
  }

  const payInvoice = async (id: string, paymentMethod: 'cash' | 'transfer') => {
    console.log('payInvoice called:', id, paymentMethod)

    const result = await updateInvoice(id, {
      status: 'paid',
      payment_method: paymentMethod,
      paid_at: new Date().toISOString()
    })

    console.log('payInvoice result:', result)
    return result
  }

  const getRevenueSummary = (startDate: string, endDate: string, staffId?: string) => {
    const filtered = invoices.value.filter(i => {
      const invoiceDate = new Date(i.created_at)
      const start = new Date(startDate)
      const end = new Date(endDate)

      const dateMatch = invoiceDate >= start && invoiceDate <= end
      const staffMatch = staffId ? i.staff_id === staffId : true

      return dateMatch && staffMatch && i.status === 'paid'
    })

    const cashTotal = filtered
      .filter(i => i.payment_method === 'cash')
      .reduce((sum, i) => sum + i.total_amount, 0)

    const transferTotal = filtered
      .filter(i => i.payment_method === 'transfer')
      .reduce((sum, i) => sum + i.total_amount, 0)

    return {
      total: cashTotal + transferTotal,
      cash: cashTotal,
      transfer: transferTotal,
      count: filtered.length
    }
  }

  return {
    invoices,
    currentInvoice,
    isLoading,
    error,
    pendingInvoices,
    paidInvoices,
    todayInvoices,
    loadInvoices,
    createInvoice,
    updateInvoice,
    payInvoice,
    getRevenueSummary
  }
})
