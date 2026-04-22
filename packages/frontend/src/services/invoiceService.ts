/**
 * Invoice Service - Truy vấn lịch sử hóa đơn và tạo hóa đơn mới
 * Data Access Layer
 */
import { supabase } from './supabaseClient'
import { Invoice, InvoiceItem } from '@/models'

export interface CreateInvoiceData {
  staffId: string
  tableId: number
  items: Array<{
    productId: number
    quantity: number
    unitPrice: number
  }>
}

export interface InvoiceFilters {
  staffId?: string
  status?: 'pending' | 'paid'
  startDate?: Date
  endDate?: Date
}

export class InvoiceService {
  /**
   * Lấy tất cả hóa đơn với filter
   */
  static async getAll(filters?: InvoiceFilters): Promise<Invoice[]> {
    let query = supabase
      .from('invoices')
      .select(`
        *,
        items:invoice_items(*, product:products(name)),
        staff:profiles(full_name),
        table:cafe_tables(name)
      `)

    if (filters?.staffId) {
      query = query.eq('staff_id', filters.staffId)
    }
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate.toISOString())
    }
    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate.toISOString())
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return (data || []).map(inv => this.mapToInvoice(inv))
  }

  /**
   * Lấy hóa đơn theo ID
   */
  static async getById(id: string): Promise<Invoice | null> {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        items:invoice_items(*, product:products(name)),
        staff:profiles(full_name),
        table:cafe_tables(name)
      `)
      .eq('id', id)
      .single()

    if (error || !data) return null

    return this.mapToInvoice(data)
  }

  /**
   * Tạo hóa đơn mới
   */
  static async create(data: CreateInvoiceData): Promise<Invoice> {
    const totalAmount = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)

    // Tạo invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        staff_id: data.staffId,
        table_id: data.tableId,
        total_amount: totalAmount,
        status: 'pending'
      })
      .select()
      .single()

    if (invoiceError) {
      throw new Error(invoiceError.message)
    }

    // Tạo invoice items
    const itemsData = data.items.map(item => ({
      invoice_id: invoice.id,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.unitPrice
    }))

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(itemsData)

    if (itemsError) {
      throw new Error(itemsError.message)
    }

    // Cập nhật bàn thành có khách
    await supabase
      .from('cafe_tables')
      .update({ is_occupied: true })
      .eq('id', data.tableId)

    return this.getById(invoice.id) as Promise<Invoice>
  }

  /**
   * Thanh toán hóa đơn
   */
  static async pay(id: string, paymentMethod: 'cash' | 'transfer'): Promise<Invoice> {
    const { data, error } = await supabase
      .from('invoices')
      .update({
        status: 'paid',
        payment_method: paymentMethod,
        paid_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        items:invoice_items(*, product:products(name)),
        staff:profiles(full_name),
        table:cafe_tables(name)
      `)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    // Cập nhật bàn thành trống
    const invoice = this.mapToInvoice(data)
    await supabase
      .from('cafe_tables')
      .update({ is_occupied: false })
      .eq('id', invoice.tableId)

    return invoice
  }

  /**
   * Thêm món vào hóa đơn pending
   */
  static async addItems(invoiceId: string, items: Array<{ productId: number; quantity: number; unitPrice: number }>): Promise<Invoice> {
    const itemsData = items.map(item => ({
      invoice_id: invoiceId,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.unitPrice
    }))

    const { error } = await supabase
      .from('invoice_items')
      .insert(itemsData)

    if (error) {
      throw new Error(error.message)
    }

    // Cập nhật tổng tiền
    const { data: currentItems } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', invoiceId)

    const newTotal = (currentItems || []).reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)

    await supabase
      .from('invoices')
      .update({ total_amount: newTotal })
      .eq('id', invoiceId)

    return this.getById(invoiceId) as Promise<Invoice>
  }

  /**
   * Helper: Map Supabase data to Invoice model
   */
  private static mapToInvoice(data: Record<string, unknown>): Invoice {
    const items = (data.items as Record<string, unknown>[] || [])
      .map(item => new InvoiceItem({
        id: item.id as number,
        invoice_id: item.invoice_id as string,
        product_id: item.product_id as number,
        product_name: (item.product as Record<string, string>)?.name,
        quantity: item.quantity as number,
        unit_price: item.unit_price as number
      }))

    return new Invoice({
      id: data.id as string,
      staff_id: data.staff_id as string,
      table_id: data.table_id as number,
      total_amount: data.total_amount as number,
      status: data.status as 'pending' | 'paid',
      payment_method: data.payment_method as 'cash' | 'transfer',
      paid_at: data.paid_at as string,
      created_at: data.created_at as string,
      items,
      staff_name: (data.staff as Record<string, string>)?.full_name,
      table_name: (data.table as Record<string, string>)?.name
    })
  }
}
