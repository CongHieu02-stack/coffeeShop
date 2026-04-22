/**
 * Voucher Service - Xử lý nghiệp vụ voucher
 * Data Access Layer
 */
import { supabase } from './supabaseClient'
import { Voucher } from '@/models'

export class VoucherService {
  /**
   * Lấy tất cả voucher đang hoạt động
   */
  static async getAll(): Promise<Voucher[]> {
    const { data, error } = await supabase
      .from('vouchers')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return (data || []).map(v => Voucher.fromJSON(v))
  }

  /**
   * Lấy voucher theo code
   */
  static async getByCode(code: string): Promise<Voucher | null> {
    const { data, error } = await supabase
      .from('vouchers')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single()

    if (error || !data) return null

    return Voucher.fromJSON(data)
  }

  /**
   * Tạo voucher mới
   */
  static async create(voucherData: Omit<Voucher, 'id' | 'usageCount' | 'createdAt'>): Promise<Voucher> {
    const { data, error } = await supabase
      .from('vouchers')
      .insert({
        code: voucherData.code,
        discount_percent: voucherData.discountPercent,
        max_discount: voucherData.maxDiscount,
        min_order_amount: voucherData.minOrderAmount,
        start_date: voucherData.startDate.toISOString(),
        end_date: voucherData.endDate.toISOString(),
        is_active: voucherData.isActive,
        usage_limit: voucherData.usageLimit,
        usage_count: 0
      })
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return Voucher.fromJSON(data)
  }

  /**
   * Cập nhật voucher
   */
  static async update(id: number, updates: Partial<Voucher>): Promise<Voucher> {
    const updateData: Record<string, unknown> = {}

    if (updates.code !== undefined) updateData.code = updates.code
    if (updates.discountPercent !== undefined) updateData.discount_percent = updates.discountPercent
    if (updates.maxDiscount !== undefined) updateData.max_discount = updates.maxDiscount
    if (updates.minOrderAmount !== undefined) updateData.min_order_amount = updates.minOrderAmount
    if (updates.startDate !== undefined) updateData.start_date = updates.startDate.toISOString()
    if (updates.endDate !== undefined) updateData.end_date = updates.endDate.toISOString()
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive
    if (updates.usageLimit !== undefined) updateData.usage_limit = updates.usageLimit

    const { data, error } = await supabase
      .from('vouchers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return Voucher.fromJSON(data)
  }

  /**
   * Tăng số lần sử dụng voucher
   */
  static async incrementUsage(id: number): Promise<void> {
    const { data } = await supabase
      .from('vouchers')
      .select('usage_count')
      .eq('id', id)
      .single()

    const currentCount = (data?.usage_count as number) || 0

    const { error } = await supabase
      .from('vouchers')
      .update({ usage_count: currentCount + 1 })
      .eq('id', id)

    if (error) {
      throw new Error(error.message)
    }
  }

  /**
   * Xóa voucher (soft delete)
   */
  static async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('vouchers')
      .update({ is_active: false })
      .eq('id', id)

    if (error) {
      throw new Error(error.message)
    }
  }
}
