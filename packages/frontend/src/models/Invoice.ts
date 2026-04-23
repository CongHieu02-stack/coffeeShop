/**
 * Invoice & InvoiceItem Models - Lớp đối tượng Hóa đơn và Chi tiết hóa đơn
 * Theo mẫu OOP
 */

export class InvoiceItem {
  id: number
  invoiceId: string
  productId: number
  productName: string
  quantity: number
  unitPrice: number

  constructor(data: {
    id: number
    invoice_id: string
    product_id: number
    product_name?: string
    quantity: number
    unit_price: number
  }) {
    this.id = data.id
    this.invoiceId = data.invoice_id
    this.productId = data.product_id
    this.productName = data.product_name || ''
    this.quantity = data.quantity
    this.unitPrice = data.unit_price
  }

  /**
   * Tính thành tiền của item
   */
  getSubtotal(): number {
    return this.quantity * this.unitPrice
  }

  /**
   * Chuyển đổi từ plain object
   */
  static fromJSON(data: Record<string, unknown>): InvoiceItem {
    return new InvoiceItem({
      id: data.id as number,
      invoice_id: data.invoice_id as string,
      product_id: data.product_id as number,
      product_name: data.product_name as string,
      quantity: data.quantity as number,
      unit_price: data.unit_price as number
    })
  }
}

export class Invoice {
  id: string
  staffId: string
  tableId: number
  totalAmount: number
  status: 'pending' | 'paid'
  paymentMethod?: 'cash' | 'transfer'
  paidAt?: Date
  createdAt: Date
  items: InvoiceItem[]
  staffName?: string
  tableName?: string
  note?: string

  constructor(data: {
    id: string
    staff_id: string
    table_id: number
    total_amount?: number
    status?: 'pending' | 'paid'
    payment_method?: 'cash' | 'transfer'
    paid_at?: string
    created_at?: string
    items?: InvoiceItem[]
    staff_name?: string
    table_name?: string
    note?: string
  }) {
    this.id = data.id
    this.staffId = data.staff_id
    this.tableId = data.table_id
    this.totalAmount = data.total_amount || 0
    this.status = data.status || 'pending'
    this.paymentMethod = data.payment_method
    this.paidAt = data.paid_at ? new Date(data.paid_at) : undefined
    this.createdAt = data.created_at ? new Date(data.created_at) : new Date()
    this.items = data.items || []
    this.staffName = data.staff_name
    this.tableName = data.table_name
    this.note = data.note
  }

  /**
   * Kiểm tra hóa đơn đã thanh toán chưa
   */
  isPaid(): boolean {
    return this.status === 'paid'
  }

  /**
   * Tính tổng tiền từ các items
   */
  calculateTotal(): number {
    return this.items.reduce((sum, item) => sum + item.getSubtotal(), 0)
  }

  /**
   * Thêm item vào hóa đơn
   */
  addItem(item: InvoiceItem): void {
    this.items.push(item)
    this.totalAmount = this.calculateTotal()
  }

  /**
   * Xóa item khỏi hóa đơn
   */
  removeItem(itemId: number): void {
    this.items = this.items.filter(item => item.id !== itemId)
    this.totalAmount = this.calculateTotal()
  }

  /**
   * Đánh dấu đã thanh toán
   */
  markAsPaid(method: 'cash' | 'transfer'): void {
    this.status = 'paid'
    this.paymentMethod = method
    this.paidAt = new Date()
  }

  /**
   * Format giá tiền VND
   */
  getFormattedTotal(): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(this.totalAmount)
  }

  /**
   * Chuyển đổi từ plain object
   */
  static fromJSON(data: Record<string, unknown>): Invoice {
    const items = (data.items as Record<string, unknown>[] || [])
      .map(item => InvoiceItem.fromJSON(item))

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
      staff_name: data.staff_name as string,
      table_name: data.table_name as string,
      note: data.note as string
    })
  }
}
