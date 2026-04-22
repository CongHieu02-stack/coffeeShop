/**
 * Report Service - Thống kê doanh thu và chốt ca (Shift Report)
 * Data Access Layer
 */
import { supabase } from './supabaseClient'

export interface ShiftReportData {
  staffId: string
  totalCash: number
  totalTransfer: number
  totalAmount: number
  invoiceCount: number
  note?: string
}

export interface RevenueSummary {
  total: number
  cash: number
  transfer: number
  invoiceCount: number
}

export interface DailyReport {
  date: string
  totalRevenue: number
  totalOrders: number
}

export class ReportService {
  /**
   * Lấy tổng kết doanh thu theo khoảng thời gian
   */
  static async getRevenueSummary(
    startDate: Date,
    endDate: Date,
    staffId?: string
  ): Promise<RevenueSummary> {
    let query = supabase
      .from('invoices')
      .select('total_amount, payment_method')
      .eq('status', 'paid')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    if (staffId) {
      query = query.eq('staff_id', staffId)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    const summary: RevenueSummary = {
      total: 0,
      cash: 0,
      transfer: 0,
      invoiceCount: data?.length || 0
    }

    data?.forEach((inv: { total_amount: number; payment_method: string }) => {
      summary.total += inv.total_amount || 0
      if (inv.payment_method === 'cash') {
        summary.cash += inv.total_amount || 0
      } else if (inv.payment_method === 'transfer') {
        summary.transfer += inv.total_amount || 0
      }
    })

    return summary
  }

  /**
   * Lấy báo cáo theo ngày
   */
  static async getDailyReport(date: Date, staffId?: string): Promise<DailyReport> {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    let query = supabase
      .from('invoices')
      .select('total_amount, payment_method')
      .eq('status', 'paid')
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString())

    if (staffId) {
      query = query.eq('staff_id', staffId)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    const totalRevenue = data?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0

    return {
      date: date.toISOString().split('T')[0],
      totalRevenue,
      totalOrders: data?.length || 0
    }
  }

  /**
   * Lấy danh sách shift reports
   */
  static async getShiftReports(staffId?: string, limit: number = 50): Promise<unknown[]> {
    let query = supabase
      .from('shift_reports')
      .select(`
        *,
        staff:profiles(full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (staffId) {
      query = query.eq('staff_id', staffId)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    return data || []
  }

  /**
   * Tạo shift report (chốt ca)
   */
  static async createShiftReport(data: ShiftReportData): Promise<unknown> {
    const { data: report, error } = await supabase
      .from('shift_reports')
      .insert({
        staff_id: data.staffId,
        total_cash: data.totalCash,
        total_transfer: data.totalTransfer,
        total_amount: data.totalAmount,
        invoice_count: data.invoiceCount,
        note: data.note
      })
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return report
  }

  /**
   * Lấy thống kê top sản phẩm bán chạy
   */
  static async getTopProducts(startDate: Date, endDate: Date, limit: number = 10): Promise<unknown[]> {
    const { data, error } = await supabase.rpc('get_top_products', {
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      limit_count: limit
    })

    if (error) {
      // Fallback: query manually if RPC not available
      const { data: items, error: itemsError } = await supabase
        .from('invoice_items')
        .select(`
          product_id,
          quantity,
          product:products(name)
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())

      if (itemsError) {
        throw new Error(itemsError.message)
      }

      // Group by product
      const productMap = new Map<number, { name: string; totalQuantity: number }>()

      items?.forEach((item) => {
        const productId = item.product_id as number
        const quantity = item.quantity as number
        const productName = (item.product as { name?: string })?.name || 'Unknown'

        const existing = productMap.get(productId)
        if (existing) {
          existing.totalQuantity += quantity
        } else {
          productMap.set(productId, {
            name: productName,
            totalQuantity: quantity
          })
        }
      })

      return Array.from(productMap.entries())
        .map(([productId, data]) => ({ productId, ...data }))
        .sort((a, b) => b.totalQuantity - a.totalQuantity)
        .slice(0, limit)
    }

    return data || []
  }
}
