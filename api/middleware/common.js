import { users } from '../config/appwrite.js'

// Error handler middleware
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err)

  // Validation errors
  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: err.details.map(detail => detail.message)
    })
  }

  // Appwrite errors
  if (err.code) {
    const statusCode = err.code === 404 ? 404 : 
                      err.code === 401 ? 401 : 
                      err.code === 400 ? 400 : 500
    
    return res.status(statusCode).json({
      success: false,
      error: err.message || 'Database error'
    })
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  })
}

// Request logging middleware
export const requestLogger = (req, res, next) => {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms - ${req.ip}`)
  })
  
  next()
}

// Admin authentication middleware
export const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      })
    }

    const token = authHeader.substring(7)
    
    // For now, we'll use a simple token check
    // In production, you should implement proper JWT verification
    if (token !== process.env.JWT_SECRET) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      })
    }

    // Add admin user info to request
    req.user = { 
      id: process.env.ADMIN_USER_ID || 'admin', 
      email: process.env.ADMIN_EMAIL || 'admin@fs25modshub.com',
      role: 'admin'
    }
    
    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    res.status(401).json({
      success: false,
      error: 'Authentication failed'
    })
  }
}

// CORS configuration
export const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://localhost:5174'
    ]
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}

// File upload middleware configuration
export const fileUploadConfig = {
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024, // 50MB
  },
  abortOnLimit: true,
  createParentPath: true,
  parseNested: true
}
