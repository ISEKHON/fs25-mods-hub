import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'

// Import routes
import authRouter from './routes/auth.js'
import usersRouter from './routes/users.js'
import modsRouter from './routes/mods.js'
import submissionsRouter from './routes/submissions.js'
import reviewsRouter from './routes/reviews.js'
import reportsRouter from './routes/reports.js'
import categoriesRouter from './routes/categories.js'
import developersRouter from './routes/developers.js'
import adminRouter from './routes/admin.js'
import statsRouter from './routes/stats.js'

// Import middleware
import { apiLimiter } from './middleware/rateLimiter.js'
import { handleUploadError } from './middleware/upload.js'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Security middleware
app.use(helmet())

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
}))

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Rate limiting
app.use('/api', apiLimiter)

// Trust proxy for rate limiting and IP detection
app.set('trust proxy', 1)

// API routes
app.use('/api/auth', authRouter)
app.use('/api/users', usersRouter)
app.use('/api/mods', modsRouter)
app.use('/api/submissions', submissionsRouter)
app.use('/api/reviews', reviewsRouter)
app.use('/api/reports', reportsRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/developers', developersRouter)
app.use('/api/admin', adminRouter)
app.use('/api/stats', statsRouter)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'FS25 Mods Hub API is running',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  })
})

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  })
})

// Upload error handling
app.use(handleUploadError)

// Global error handling
app.use((error, req, res, next) => {
  console.error('Global error handler:', error)
  
  // Don't send error details in production
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(isDevelopment && { stack: error.stack })
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 FS25 Mods Hub API server running on port ${PORT}`)
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`)
  console.log(`📡 Appwrite Endpoint: ${process.env.APPWRITE_ENDPOINT}`)
})

export default app
