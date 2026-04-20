import { Router } from 'express'
import { InvoiceController } from '../controllers/invoice.controller'

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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, paid]
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of invoices
 *       400:
 *         description: Error
 */
router.get('/', InvoiceController.getAll)

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
 *     responses:
 *       200:
 *         description: Invoice details
 *       400:
 *         description: Error
 */
router.get('/:id', InvoiceController.getById)

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
router.post('/', InvoiceController.create)

/**
 * @swagger
 * /api/invoices/{id}:
 *   put:
 *     summary: Update invoice (payment)
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string, enum: [pending, paid] }
 *               payment_method: { type: string, enum: [cash, transfer] }
 *               paid_at: { type: string }
 *     responses:
 *       200:
 *         description: Invoice updated
 *       400:
 *         description: Error
 */
router.put('/:id', InvoiceController.update)

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
 *       400:
 *         description: Error
 */
router.get('/summary/revenue', InvoiceController.getRevenueSummary)

export { router as invoicesRouter }
