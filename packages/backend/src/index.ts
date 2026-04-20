import './config/env'

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import swaggerUi from 'swagger-ui-express'
import swaggerJsdoc from 'swagger-jsdoc'

import { productsRouter } from './routes/product.route'
import { staffRouter } from './routes/staff.route'
import { tablesRouter } from './routes/table.route'
import { authRouter } from './routes/auth.route'
import { invoicesRouter } from './routes/invoice.route'
import { shiftReportsRouter } from './routes/shiftReport.route'

const app = express()
const PORT = process.env.PORT || 3000

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Coffee Shop API',
      version: '1.0.0',
      description: 'API documentation for Coffee Shop Management System',
      contact: {
        name: 'API Support',
        email: 'support@coffee.shop'
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server'
      }
    ],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Products', description: 'Product management' },
      { name: 'Invoices', description: 'Invoice and order management' },
      { name: 'Staff', description: 'Staff management' },
      { name: 'Tables', description: 'Table management' },
      { name: 'Shift Reports', description: 'Shift report management' },
      { name: 'Health', description: 'Health check' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token from login response'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.ts', './dist/routes/*.js'] // Path to the API routes
}

const swaggerSpec = swaggerJsdoc(swaggerOptions)

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json())

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Coffee Shop API Docs'
}))

// Routes
app.use('/api/auth', authRouter)
app.use('/api/products', productsRouter)
app.use('/api/staff', staffRouter)
app.use('/api/tables', tablesRouter)
app.use('/api/invoices', invoicesRouter)
app.use('/api/shift-reports', shiftReportsRouter)

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: 'ok' }
 *                 timestamp: { type: string, format: date-time }
 */
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📚 API Docs available at http://localhost:${PORT}/api-docs`)
})
