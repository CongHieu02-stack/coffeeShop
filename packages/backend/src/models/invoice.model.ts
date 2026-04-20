import { getSupabase } from '../db/supabase'

export interface Invoice {
  id: string
  staff_id: string
  table_id: number
  total_amount: number
  status: 'pending' | 'paid'
  payment_method?: 'cash' | 'transfer'
  paid_at?: string
  created_at?: string
}

export interface InvoiceItem {
  id: number
  invoice_id: string
  product_id: number
  quantity: number
  unit_price: number
}

export const InvoiceModel = {
  /**
   * Get all invoices with optional filters
   */
  async findAll(filters?: { staffId?: string; status?: string; startDate?: string; endDate?: string }) {
    const supabase = getSupabase()
    let query = supabase
      .from('invoices')
      .select(`
        *,
        items:invoice_items(*, product:products(name))
      `)

    if (filters?.staffId) {
      query = query.eq('staff_id', filters.staffId)
    }
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate)
    }
    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  /**
   * Get invoice by ID
   */
  async findById(id: string) {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        items:invoice_items(*, product:products(name))
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Create invoice with items
   */
  async create(invoice: Omit<Invoice, 'id'>, items: Omit<InvoiceItem, 'id' | 'invoice_id'>[]) {
    const supabase = getSupabase()
    
    // Create invoice
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: newInvoice, error: invoiceError } = await (supabase.from('invoices') as any)
      .insert(invoice)
      .select()
      .single()

    if (invoiceError) throw invoiceError

    // Create invoice items
    if (items.length > 0) {
      const itemsWithInvoiceId = items.map(item => ({
        ...item,
        invoice_id: newInvoice.id
      }))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: itemsError } = await (supabase.from('invoice_items') as any)
        .insert(itemsWithInvoiceId)

      if (itemsError) throw itemsError
    }

    return newInvoice
  },

  /**
   * Update invoice
   */
  async update(id: string, updates: Partial<Invoice>) {
    const supabase = getSupabase()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('invoices') as any)
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Get revenue summary
   */
  async getRevenueSummary(filters?: { startDate?: string; endDate?: string; staffId?: string }) {
    const supabase = getSupabase()
    
    let query = supabase
      .from('invoices')
      .select('total_amount, payment_method')
      .eq('status', 'paid')

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate)
    }
    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate)
    }
    if (filters?.staffId) {
      query = query.eq('staff_id', filters.staffId)
    }

    const { data, error } = await query

    if (error) throw error

    // Calculate summary
    const summary = {
      total: 0,
      cash: 0,
      transfer: 0,
      count: data?.length || 0
    }

    data?.forEach((inv: Invoice) => {
      summary.total += inv.total_amount || 0
      if (inv.payment_method === 'cash') {
        summary.cash += inv.total_amount || 0
      } else if (inv.payment_method === 'transfer') {
        summary.transfer += inv.total_amount || 0
      }
    })

    return summary
  }
}
