/**
 * Table Service - Quản lý bàn
 * Data Access Layer
 */
import { supabase } from './supabaseClient'
import { Table } from '@/models'

export class TableService {
  /**
   * Lấy tất cả bàn đang hoạt động
   */
  static async getAll(): Promise<Table[]> {
    const { data, error } = await supabase
      .from('cafe_tables')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) {
      throw new Error(error.message)
    }

    return (data || []).map(t => Table.fromJSON(t))
  }

  /**
   * Lấy bàn theo ID với hóa đơn hiện tại
   */
  static async getById(id: number): Promise<{ table: Table; currentInvoice: Record<string, unknown> | null }> {
    const { data, error } = await supabase
      .from('cafe_tables')
      .select(`
        *,
        current_invoice:invoices(*, items:invoice_items(*))
      `)
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    const table = Table.fromJSON(data)
    const currentInvoice = data.current_invoice || null

    return { table, currentInvoice }
  }

  /**
   * Tạo bàn mới
   */
  static async create(name: string): Promise<Table> {
    const { data, error } = await supabase
      .from('cafe_tables')
      .insert({ name, is_occupied: false, is_active: true })
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return Table.fromJSON(data)
  }

  /**
   * Cập nhật bàn
   */
  static async update(id: number, updates: Partial<Table>): Promise<Table> {
    const updateData: Record<string, unknown> = {}

    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.isOccupied !== undefined) updateData.is_occupied = updates.isOccupied
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive

    const { data, error } = await supabase
      .from('cafe_tables')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return Table.fromJSON(data)
  }

  /**
   * Đánh dấu bàn có khách
   */
  static async occupy(id: number): Promise<void> {
    await this.update(id, { isOccupied: true })
  }

  /**
   * Đánh dấu bàn trống
   */
  static async release(id: number): Promise<void> {
    await this.update(id, { isOccupied: false })
  }

  /**
   * Xóa bàn (soft delete)
   */
  static async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('cafe_tables')
      .update({ is_active: false })
      .eq('id', id)

    if (error) {
      throw new Error(error.message)
    }
  }
}
