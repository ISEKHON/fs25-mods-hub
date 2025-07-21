import jwt from 'jsonwebtoken'
import { Client, Databases, Query } from 'node-appwrite'
import { formatResponse } from '../utils/helpers.js'
import { COLLECTIONS } from '../config/collections.js'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'

// Initialize Appwrite
const client = new Client()
client
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY)

const databases = new Databases(client)

// Enhanced middleware to verify JWT token with database lookup
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

    if (!token) {
      return res.status(401).json(formatResponse(false, null, 'Access token required'))
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET)
    
    // Get user profile from database for enhanced security
    try {
      const profile = await databases.getDocument(
        process.env.APPWRITE_DATABASE_ID,
        COLLECTIONS.USER_PROFILES,
        decoded.profileId
      )

      // Check if user is still active
      if (!profile.is_active) {
        return res.status(403).json(formatResponse(false, null, 'Account is suspended'))
      }

      req.user = {
        id: decoded.userId,
        email: decoded.email,
        username: decoded.username,
        role: decoded.role,
        profileId: decoded.profileId,
        sessionId: decoded.sessionId,
        profile: profile
      }
    } catch (dbError) {
      // Fallback to token data if database lookup fails
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        username: decoded.username,
        role: decoded.role,
        profileId: decoded.profileId,
        sessionId: decoded.sessionId
      }
    }

    next()
  } catch (error) {
    console.error('Authentication error:', error)
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json(formatResponse(false, null, 'Invalid token'))
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json(formatResponse(false, null, 'Token expired'))
    }
    
    return res.status(500).json(formatResponse(false, null, 'Authentication failed'))
  }
}

// Optional authentication middleware - doesn't require token but adds user if present
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      // No token provided, continue without user
      req.user = null
      return next()
    }

    // Try to verify token
    try {
      const decoded = jwt.verify(token, JWT_SECRET)
      
      // Get user profile from database
      try {
        const profile = await databases.getDocument(
          process.env.APPWRITE_DATABASE_ID,
          'user_profiles',
          decoded.profileId
        )

        if (profile.is_active) {
          req.user = {
            id: decoded.userId,
            email: decoded.email,
            username: decoded.username,
            role: decoded.role,
            profileId: decoded.profileId,
            sessionId: decoded.sessionId,
            profile: profile
          }
        } else {
          req.user = null
        }
      } catch (dbError) {
        req.user = null
      }
    } catch (tokenError) {
      req.user = null
    }

    next()
  } catch (error) {
    console.error('Optional auth error:', error)
    req.user = null
    next()
  }
}

// Middleware to check if user is admin
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json(formatResponse(false, null, 'Authentication required'))
  }

  // Check if user has admin privileges using the isAdmin field
  if (!req.user.profile?.isAdmin) {
    return res.status(403).json(formatResponse(false, null, 'Admin access required'))
  }

  next()
}

// Middleware to check if email is verified
export const requireEmailVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json(formatResponse(false, null, 'Authentication required'))
  }

  if (!req.user.emailVerification) {
    return res.status(403).json(formatResponse(false, null, 'Email verification required'))
  }

  next()
}
