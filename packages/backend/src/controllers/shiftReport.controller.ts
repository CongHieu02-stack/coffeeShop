import { Request, Response } from 'express'
import { ShiftReportModel, ShiftReport } from '../models/shiftReport.model'

export const ShiftReportController = {
  /**
   * GET /api/shift-reports
   * Get all shift reports
   */
  async getAll(req: Request, res: Response) {
    try {
      const { staffId, startDate, endDate } = req.query
      const data = await ShiftReportModel.findAll({
        staffId: staffId as string,
        startDate: startDate as string,
        endDate: endDate as string
      })
      res.json({ success: true, data })
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message })
    }
  },

  /**
   * GET /api/shift-reports/:id
   * Get shift report by ID
   */
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const data = await ShiftReportModel.findById(id)
      res.json({ success: true, data })
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message })
    }
  },

  /**
   * POST /api/shift-reports
   * Create shift report
   */
  async create(req: Request, res: Response) {
    try {
      const report: Omit<ShiftReport, 'id' | 'created_at'> = req.body
      const data = await ShiftReportModel.create(report)
      res.json({ success: true, data })
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message })
    }
  }
}
