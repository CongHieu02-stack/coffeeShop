import { Request, Response } from 'express'
import { InvoiceModel, Invoice } from '../models/invoice.model'
import { TableModel } from '../models/table.model'

export const InvoiceController = {
  /**
   * GET /api/invoices
   * Get all invoices with filters
   */
  async getAll(req: Request, res: Response) {
    try {
      const { staffId, status, startDate, endDate } = req.query
      const data = await InvoiceModel.findAll({
        staffId: staffId as string,
        status: status as string,
        startDate: startDate as string,
        endDate: endDate as string
      })
      res.json({ success: true, data })
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message })
    }
  },

  /**
   * GET /api/invoices/:id
   * Get invoice by ID
   */
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const data = await InvoiceModel.findById(id)
      res.json({ success: true, data })
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message })
    }
  },

  /**
   * POST /api/invoices
   * Create new invoice
   */
  async create(req: Request, res: Response) {
    try {
      const { invoice, items } = req.body
      const newInvoice = await InvoiceModel.create(invoice, items || [])
      
      // Update table status to occupied
      if (invoice.table_id) {
        await TableModel.update(invoice.table_id, { is_occupied: true })
      }
      
      res.json({ success: true, data: newInvoice })
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message })
    }
  },

  /**
   * PUT /api/invoices/:id
   * Update invoice (payment)
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params
      const updates: Partial<Invoice> = req.body
      
      const data = await InvoiceModel.update(id, updates)
      
      // If paid, update table to not occupied
      if (updates.status === 'paid' && data.table_id) {
        await TableModel.update(data.table_id, { is_occupied: false })
      }
      
      res.json({ success: true, data })
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message })
    }
  },

  /**
   * GET /api/invoices/summary/revenue
   * Get revenue summary
   */
  async getRevenueSummary(req: Request, res: Response) {
    try {
      const { startDate, endDate, staffId } = req.query
      const summary = await InvoiceModel.getRevenueSummary({
        startDate: startDate as string,
        endDate: endDate as string,
        staffId: staffId as string
      })
      res.json({ success: true, summary })
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message })
    }
  }
}
