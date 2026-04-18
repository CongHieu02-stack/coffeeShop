import './config/env'

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'

import { productsRouter } from './routes/products'
import { invoicesRouter } from './routes/invoices'
import { staffRouter } from './routes/staff'
import { tablesRouter } from './routes/tables'
import { authRouter } from './routes/auth'

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/auth', authRouter)
app.use('/api/products', productsRouter)
app.use('/api/invoices', invoicesRouter)
app.use('/api/staff', staffRouter)
app.use('/api/tables', tablesRouter)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
