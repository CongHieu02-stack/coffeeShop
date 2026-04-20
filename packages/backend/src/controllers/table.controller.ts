import { Request, Response } from 'express'
import { TableModel, Table } from '../models/table.model'

export const TableController = {
  /**
   * GET /api/tables
   * Get all tables
   */
  async getAll(req: Request, res: Response) {
    try {
      const data = await TableModel.findAll()
      res.json({ success: true, data })
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message })
    }
  },

  /**
   * GET /api/tables/:id
   * Get table by ID
   */
  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      const data = await TableModel.findById(id)
      res.json({ success: true, data })
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message })
    }
  },

  /**
   * POST /api/tables
   * Create new table
   */
  async create(req: Request, res: Response) {
    try {
      const table: Omit<Table, 'id'> = req.body
      const data = await TableModel.create(table)
      res.json({ success: true, data })
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message })
    }
  },

  /**
   * PUT /api/tables/:id
   * Update table
   */
  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      const updates = req.body
      const data = await TableModel.update(id, updates)
      res.json({ success: true, data })
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message })
    }
  },

  /**
   * DELETE /api/tables/:id
   * Delete table
   */
  async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      const result = await TableModel.delete(id)
      res.json(result)
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message })
    }
  }
}
