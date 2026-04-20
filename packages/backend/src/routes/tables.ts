import { Router } from 'express'
import { getSupabase } from '../db/supabase'

const router = Router()

/**
 * @swagger
 * /api/tables:
 *   get:
 *     summary: Get all tables
 *     tags: [Tables]
 *     responses:
 *       200:
 *         description: List of tables
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: integer }
 *                       name: { type: string }
 *                       is_occupied: { type: boolean }
 *                       is_active: { type: boolean }
 *       400:
 *         description: Error
 */
router.get('/', async (_req, res) => {
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('cafe_tables')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) throw error

    res.json({
      success: true,
      data
    })
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message
    })
  }
})

/**
 * @swagger
 * /api/tables/{id}:
 *   get:
 *     summary: Get table by ID with current invoice
 *     tags: [Tables]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Table details with invoice
 *       400:
 *         description: Error
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('cafe_tables')
      .select('*, current_invoice:invoices(*, items:invoice_items(*))')
      .eq('id', id)
      .single()

    if (error) throw error

    res.json({
      success: true,
      data
    })
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message
    })
  }
})

/**
 * @swagger
 * /api/tables:
 *   post:
 *     summary: Create new table
 *     tags: [Tables]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, example: 'Bàn 1' }
 *               is_occupied: { type: boolean, default: false }
 *     responses:
 *       200:
 *         description: Table created
 *       400:
 *         description: Error
 */
router.post('/', async (req, res) => {
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('cafe_tables')
      .insert(req.body)
      .select()
      .single()

    if (error) throw error

    res.json({
      success: true,
      data
    })
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message
    })
  }
})

/**
 * @swagger
 * /api/tables/{id}:
 *   put:
 *     summary: Update table
 *     tags: [Tables]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               is_occupied: { type: boolean }
 *     responses:
 *       200:
 *         description: Table updated
 *       400:
 *         description: Error
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('cafe_tables')
      .update(req.body)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    res.json({
      success: true,
      data
    })
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message
    })
  }
})

/**
 * @swagger
 * /api/tables/{id}:
 *   delete:
 *     summary: Delete table (soft delete)
 *     tags: [Tables]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Table deleted
 *       400:
 *         description: Error
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const supabase = getSupabase()
    const { error } = await supabase
      .from('cafe_tables')
      .update({ is_active: false })
      .eq('id', id)

    if (error) throw error

    res.json({
      success: true,
      message: 'Table deleted'
    })
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message
    })
  }
})

export { router as tablesRouter }
