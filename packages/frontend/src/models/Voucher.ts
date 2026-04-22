/**
 * Voucher Model - Lớp đối tượng Mã giảm giá
 * Theo mẫu OOP
 */

export class Voucher {
  id: number
  code: string
  discountPercent: number
  maxDiscount: number
  minOrderAmount: number
  startDate: Date
  endDate: Date
  isActive: boolean
  usageLimit?: number
  usageCount: number

  constructor(data: {
    id: number
    code: string
    discount_percent: number
    max_discount: number
    min_order_amount?: number
    start_date: string
    end_date: string
    is_active?: boolean
    usage_limit?: number
    usage_count?: number
  }) {
    this.id = data.id
    this.code = data.code.toUpperCase()
    this.discountPercent = data.discount_percent
    this.maxDiscount = data.max_discount
    this.minOrderAmount = data.min_order_amount || 0
    this.startDate = new Date(data.start_date)
    this.endDate = new Date(data.end_date)
    this.isActive = data.is_active ?? true
    this.usageLimit = data.usage_limit
    this.usageCount = data.usage_count || 0
  }

  /**
   * Kiểm tra voucher còn hiệu lực không
   */
  isValid(): boolean {
    const now = new Date()
    return this.isActive &&
           now >= this.startDate &&
           now <= this.endDate &&
           (this.usageLimit === undefined || this.usageCount < this.usageLimit)
  }

  /**
   * Kiểm tra đơn hàng đủ điều kiện áp dụng voucher
   */
  isApplicable(orderAmount: number): boolean {
    return this.isValid() && orderAmount >= this.minOrderAmount
  }

  /**
   * Tính số tiền giảm được
   */
  calculateDiscount(orderAmount: number): number {
    if (!this.isApplicable(orderAmount)) {
      return 0
    }

    const discount = Math.round(orderAmount * this.discountPercent / 100)
    return Math.min(discount, this.maxDiscount)
  }

  /**
   * Tính giá sau khi giảm
   */
  calculateFinalAmount(orderAmount: number): number {
    return orderAmount - this.calculateDiscount(orderAmount)
  }

  /**
   * Tăng số lần sử dụng
   */
  incrementUsage(): void {
    this.usageCount++
  }

  /**
   * Chuyển đổi từ plain object
   */
  static fromJSON(data: Record<string, unknown>): Voucher {
    return new Voucher({
      id: data.id as number,
      code: data.code as string,
      discount_percent: data.discount_percent as number,
      max_discount: data.max_discount as number,
      min_order_amount: data.min_order_amount as number,
      start_date: data.start_date as string,
      end_date: data.end_date as string,
      is_active: data.is_active as boolean,
      usage_limit: data.usage_limit as number,
      usage_count: data.usage_count as number
    })
  }

  /**
   * Chuyển đổi sang plain object
   */
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      code: this.code,
      discount_percent: this.discountPercent,
      max_discount: this.maxDiscount,
      min_order_amount: this.minOrderAmount,
      start_date: this.startDate.toISOString(),
      end_date: this.endDate.toISOString(),
      is_active: this.isActive,
      usage_limit: this.usageLimit,
      usage_count: this.usageCount
    }
  }
}
