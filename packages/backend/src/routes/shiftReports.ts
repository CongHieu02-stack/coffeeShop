import { Router } from 'express'
import { getSupabase } from '../db/supabase'

const router = Router()

/**
 * @swagger
 * /api/shift-reports:
 *   get:
 *     summary: Get all shift reports with filters
 *     tags: [Shift Reports]
 *     parameters:
 *       - in: query
 *         name: staffId
 *         schema:
 *           type: string
 *         description: Filter by staff ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date filter
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date filter
 *     responses:
 *       200:
 *         description: List of shift reports
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
 *                       id: { type: string }
 *                       staff_id: { type: string }
 *                       total_cash: { type: integer }
 *                       total_transfer: { type: integer }
 *                       total_amount: { type: integer }
 *                       invoice_count: { type: integer }
 *                       created_at: { type: string }
 *                       staff:
 *                         type: object
 *                         properties:
 *                           id: { type: string }
 *                           email: { type: string }
 *       400:
 *         description: Error
 */
router.get('/', async (req, res) => {
  try {
    const { staffId, startDate, endDate } = req.query
    const supabase = getSupabase()

    let query = supabase
      .from('shift_reports')
      .select(`
        *,
        staff:staff_id(id, email)
      `)
      .order('created_at', { ascending: false })

    if (staffId) query = query.eq('staff_id', staffId)
    if (startDate) query = query.gte('created_at', startDate)
    if (endDate) query = query.lte('created_at', endDate)

    const { data, error } = await query

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
 * /api/shift-reports/{id}:
 *   get:
 *     summary: Get shift report by ID
 *     tags: [Shift Reports]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Shift report details
 *       400:
 *         description: Error
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('shift_reports')
      .select(`
        *,
        staff:staff_id(id, email)
      `)
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
 * /api/shift-reports:
 *   post:
 *     summary: Create new shift report
 *     tags: [Shift Reports]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [staff_id, total_cash, total_transfer, total_amount, invoice_count]
 *             properties:
 *               staff_id:
 *                 type: string
 *               total_cash:
 *                 type: integer
 *                 example: 500000
 *               total_transfer:
 *                 type: integer
 *                 example: 300000
 *               total_amount:
 *                 type: integer
 *                 example: 800000
 *               invoice_count:
 *                 type: integer
 *                 example: 10
 *     responses:
 *       200:
 *         description: Shift report created
 *       400:
 *         description: Error
 */
router.post('/', async (req, res) => {
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('shift_reports')
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

export default router
