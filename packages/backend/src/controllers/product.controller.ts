import { Request, Response } from 'express'
import { ProductModel, Product } from '../models/product.model'

export const ProductController = {
  /**
   * GET /api/products
   * Get all products
   */
  async getAll(req: Request, res: Response) {
    try {
      const data = await ProductModel.findAll()
      res.json({ success: true, data })
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message })
    }
  },

  /**
   * GET /api/products/:id
   * Get product by ID
   */
  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      const data = await ProductModel.findById(id)
      res.json({ success: true, data })
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message })
    }
  },

  /**
   * POST /api/products
   * Create new product
   */
  async create(req: Request, res: Response) {
    try {
      const product: Omit<Product, 'id'> = req.body
      const data = await ProductModel.create(product)
      res.json({ success: true, data })
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message })
    }
  },

  /**
   * PUT /api/products/:id
   * Update product
   */
  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      const updates: Partial<Product> = req.body
      const data = await ProductModel.update(id, updates)
      res.json({ success: true, data })
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message })
    }
  },

  /**
   * DELETE /api/products/:id
   * Delete product (soft delete)
   */
  async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      const result = await ProductModel.delete(id)
      res.json(result)
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message })
    }
  }
}
