import { Router } from 'express'
import { StaffController } from '../controllers/staff.controller'

const router = Router()

/**
 * @swagger
 * /api/staff:
 *   get:
 *     summary: Get all staff members
 *     tags: [Staff]
 *     responses:
 *       200:
 *         description: List of staff
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
 *                       full_name: { type: string }
 *                       role: { type: string, enum: [admin, staff] }
 *                       is_active: { type: boolean }
 *       400:
 *         description: Error
 */
router.get('/', StaffController.getAll)

/**
 * @swagger
 * /api/staff:
 *   post:
 *     summary: Create new staff member
 *     tags: [Staff]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, full_name, role]
 *             properties:
 *               email:
 *                 type: string
 *                 example: staff@coffee.shop
 *               password:
 *                 type: string
 *                 example: staff123
 *               full_name:
 *                 type: string
 *                 example: Nguyen Van A
 *               role:
 *                 type: string
 *                 enum: [admin, staff]
 *     responses:
 *       200:
 *         description: Staff created
 *       400:
 *         description: Error
 */
router.post('/', StaffController.create)

/**
 * @swagger
 * /api/staff/{id}:
 *   put:
 *     summary: Update staff member
 *     tags: [Staff]
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
 *               full_name: { type: string }
 *               role: { type: string, enum: [admin, staff] }
 *               is_active: { type: boolean }
 *     responses:
 *       200:
 *         description: Staff updated
 *       400:
 *         description: Error
 */
router.put('/:id', StaffController.update)

/**
 * @swagger
 * /api/staff/{id}/toggle:
 *   patch:
 *     summary: Toggle staff active status
 *     tags: [Staff]
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
 *               is_active: { type: boolean }
 *     responses:
 *       200:
 *         description: Status toggled
 *       400:
 *         description: Error
 */
router.patch('/:id/toggle', StaffController.toggleStatus)

export { router as staffRouter }
