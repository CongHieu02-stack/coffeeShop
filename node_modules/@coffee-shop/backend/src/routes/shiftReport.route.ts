import { Router } from 'express'
import { ShiftReportController } from '../controllers/shiftReport.controller'

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
 *         description: List of shift reports
 *       400:
 *         description: Error
 */
router.get('/', ShiftReportController.getAll)

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
router.get('/:id', ShiftReportController.getById)

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
 *               staff_id: { type: string }
 *               total_cash: { type: integer }
 *               total_transfer: { type: integer }
 *               total_amount: { type: integer }
 *               invoice_count: { type: integer }
 *               note: { type: string }
 *     responses:
 *       200:
 *         description: Shift report created
 *       400:
 *         description: Error
 */
router.post('/', ShiftReportController.create)

export { router as shiftReportsRouter }
