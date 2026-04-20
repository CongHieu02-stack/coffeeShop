import { Router } from 'express'
import { getSupabase } from '../db/supabase'

const router = Router()

/**
 * @swagger
 * /api/invoices:
 *   get:
 *     summary: Get all invoices with filters
 *     tags: [Invoices]
 *     parameters:
 *       - in: query
 *         name: staffId
 *         schema:
 *           type: string
 *         description: Filter by staff ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, paid]
 *         description: Filter by status
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
 *         description: List of invoices
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
 *                       table_id: { type: integer }
 *                       total_amount: { type: integer }
 *                       status: { type: string, enum: [pending, paid] }
 *                       payment_method: { type: string, enum: [cash, transfer] }
 *                       items:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id: { type: integer }
 *                             product_id: { type: integer }
 *                             quantity: { type: integer }
 *                             unit_price: { type: integer }
 *                             product:
 *                               type: object
 *                               properties:
 *                                 name: { type: string }
 *       400:
 *         description: Error
 */
router.get('/', async (req, res) => {
  try {
    const { staffId, startDate, endDate, status } = req.query
    const supabase = getSupabase()

    let query = supabase
      .from('invoices')
      .select(`
        *,
        items:invoice_items(*, product:products(name))
      `)
      .order('created_at', { ascending: false })

    if (staffId) query = query.eq('staff_id', staffId)
    if (status) query = query.eq('status', status)
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
 * /api/invoices/{id}:
 *   get:
 *     summary: Get invoice by ID
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Invoice ID
 *     responses:
 *       200:
 *         description: Invoice details
 *       400:
 *         description: Error
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        items:invoice_items(*, product:products(name))
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
 * /api/invoices:
 *   post:
 *     summary: Create new invoice with items
 *     tags: [Invoices]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               invoice:
 *                 type: object
 *                 properties:
 *                   staff_id: { type: string }
 *                   table_id: { type: integer }
 *                   total_amount: { type: integer }
 *                   status: { type: string }
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product_id: { type: integer }
 *                     quantity: { type: integer }
 *                     unit_price: { type: integer }
 *     responses:
 *       200:
 *         description: Invoice created
 *       400:
 *         description: Error
 */
router.post('/', async (req, res) => {
  try {
    const { invoice, items } = req.body
    const supabase = getSupabase()

    // Create invoice
    const { data: invoiceData, error: invoiceError } = await supabase
      .from('invoices')
      .insert(invoice)
      .select()
      .single()

    if (invoiceError) throw invoiceError

    // Create invoice items
    const itemsWithInvoiceId = items.map((item: any) => ({
      ...item,
      invoice_id: invoiceData.id
    }))

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(itemsWithInvoiceId)

    if (itemsError) throw itemsError

    // Update table status
    const supabase2 = getSupabase()
    await supabase2
      .from('cafe_tables')
      .update({ is_occupied: true })
      .eq('id', invoice.table_id)

    res.json({
      success: true,
      data: invoiceData
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
 * /api/invoices/{id}:
 *   put:
 *     summary: Update invoice (payment or status)
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string, enum: [pending, paid] }
 *               payment_method: { type: string, enum: [cash, transfer] }
 *               paid_at: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Invoice updated
 *       400:
 *         description: Error
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { status, payment_method, paid_at } = req.body
    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('invoices')
      .update({ status, payment_method, paid_at })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // If paid, free up the table
    if (status === 'paid') {
      const supabase2 = getSupabase()
      await supabase2
        .from('cafe_tables')
        .update({ is_occupied: false })
        .eq('id', data.table_id)
    }

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
 * /api/invoices/summary/revenue:
 *   get:
 *     summary: Get revenue summary
 *     tags: [Invoices]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: staffId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Revenue summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 summary:
 *                   type: object
 *                   properties:
 *                     total: { type: integer }
 *                     cash: { type: integer }
 *                     transfer: { type: integer }
 *                     count: { type: integer }
 *       400:
 *         description: Error
 */
router.get('/summary/revenue', async (req, res) => {
  try {
    const { startDate, endDate, staffId } = req.query
    const supabase = getSupabase()

    let query = supabase
      .from('invoices')
      .select('*')
      .eq('status', 'paid')

    if (staffId) query = query.eq('staff_id', staffId)
    if (startDate) query = query.gte('created_at', startDate)
    if (endDate) query = query.lte('created_at', endDate)

    const { data, error } = await query

    if (error) throw error

    const cash = data
      ?.filter((i: any) => i.payment_method === 'cash')
      .reduce((sum: number, i: any) => sum + i.total_amount, 0) || 0

    const transfer = data
      ?.filter((i: any) => i.payment_method === 'transfer')
      .reduce((sum: number, i: any) => sum + i.total_amount, 0) || 0

    res.json({
      success: true,
      summary: {
        total: cash + transfer,
        cash,
        transfer,
        count: data?.length || 0
      }
    })
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message
    })
  }
})

export { router as invoicesRouter }
