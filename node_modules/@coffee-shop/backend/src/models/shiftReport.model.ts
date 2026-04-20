import { getSupabase } from '../db/supabase'

export interface ShiftReport {
  id: string
  staff_id: string
  total_cash: number
  total_transfer: number
  total_amount: number
  invoice_count: number
  note?: string
  created_at?: string
  staff?: {
    id: string
    email: string
    full_name: string
  }
}

export const ShiftReportModel = {
  /**
   * Get all shift reports with filters
   */
  async findAll(filters?: { staffId?: string; startDate?: string; endDate?: string }) {
    const supabase = getSupabase()
    
    let query = supabase
      .from('shift_reports')
      .select(`
        *,
        staff:profiles(id, email, full_name)
      `)

    if (filters?.staffId) {
      query = query.eq('staff_id', filters.staffId)
    }
    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate)
    }
    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return data as ShiftReport[]
  },

  /**
   * Get shift report by ID
   */
  async findById(id: string) {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('shift_reports')
      .select(`
        *,
        staff:profiles(id, email, full_name)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data as ShiftReport
  },

  /**
   * Create shift report
   */
  async create(report: Omit<ShiftReport, 'id' | 'created_at'>) {
    const supabase = getSupabase()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('shift_reports') as any)
      .insert(report)
      .select()
      .single()

    if (error) throw error
    return data as ShiftReport
  }
}
