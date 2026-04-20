import { getSupabase } from '../db/supabase'

export interface Table {
  id: number
  name: string
  is_occupied: boolean
  is_active: boolean
}

export const TableModel = {
  /**
   * Get all active tables
   */
  async findAll() {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('cafe_tables')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) throw error
    return data as Table[]
  },

  /**
   * Get table by ID with current invoice
   */
  async findById(id: number) {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('cafe_tables')
      .select('*, current_invoice:invoices(*, items:invoice_items(*))')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Create new table
   */
  async create(table: Omit<Table, 'id'>) {
    const supabase = getSupabase()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('cafe_tables') as any)
      .insert(table)
      .select()
      .single()

    if (error) throw error
    return data as Table
  },

  /**
   * Update table
   */
  async update(id: number, updates: Partial<Table>) {
    const supabase = getSupabase()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('cafe_tables') as any)
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Table
  },

  /**
   * Soft delete table
   */
  async delete(id: number) {
    const supabase = getSupabase()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('cafe_tables') as any)
      .update({ is_active: false })
      .eq('id', id)

    if (error) throw error
    return { success: true, message: 'Table deleted' }
  }
}
