import { Request, Response } from 'express'
import { StaffModel, CreateStaffInput } from '../models/staff.model'

export const StaffController = {
  /**
   * GET /api/staff
   * Get all staff
   */
  async getAll(req: Request, res: Response) {
    try {
      const data = await StaffModel.findAll()
      res.json({ success: true, data })
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message })
    }
  },

  /**
   * POST /api/staff
   * Create new staff
   */
  async create(req: Request, res: Response) {
    try {
      const input: CreateStaffInput = req.body
      const data = await StaffModel.create(input)
      res.json({ success: true, data })
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message })
    }
  },

  /**
   * PUT /api/staff/:id
   * Update staff
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params
      const updates = req.body
      const data = await StaffModel.update(id, updates)
      res.json({ success: true, data })
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message })
    }
  },

  /**
   * PATCH /api/staff/:id/toggle
   * Toggle staff status
   */
  async toggleStatus(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { is_active } = req.body
      const data = await StaffModel.toggleStatus(id, is_active)
      res.json({ success: true, data })
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message })
    }
  }
}
