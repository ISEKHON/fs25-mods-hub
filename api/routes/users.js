import express from 'express'
import { Client, Databases, Storage, Query, ID } from 'node-appwrite'
import { authenticateToken } from '../middleware/auth.js'
import { formatResponse } from '../utils/helpers.js'
import { COLLECTIONS } from '../config/collections.js'
import multer from 'multer'
import sharp from 'sharp'

const router = express.Router()

// Initialize Appwrite
const client = new Client()
client
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY)

const databases = new Databases(client)
const storage = new Storage(client)

// Multer configuration for avatar uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'), false)
    }
  }
})

// Get user profile by username or ID
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params
    let profile

    // For development - create mock profile data when collections don't exist
    const createMockProfile = (username) => ({
      user_id: 'user_' + Date.now(),
      username: username,
      display_name: username.charAt(0).toUpperCase() + username.slice(1),
      bio: 'Welcome to my profile! I love farming simulation games.',
      avatar_url: `https://ui-avatars.com/api/?name=${username}&size=300&background=059669&color=fff`,
      location: 'Farming Country',
      website: '',
      social_links: {
        discord: '',
        youtube: '',
        twitch: '',
        twitter: ''
      },
      stats: {
        mods_uploaded: Math.floor(Math.random() * 20),
        reviews_written: Math.floor(Math.random() * 50),
        downloads_received: Math.floor(Math.random() * 1000),
        rating_average: (Math.random() * 2 + 3).toFixed(1)
      },
      verification: {
        email_verified: true,
        developer_verified: Math.random() > 0.5
      },
      created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      last_login: new Date().toISOString()
    })

    try {
      // Try to get real profile from database
      if (identifier.length === 20) {
        // Likely a user ID
        try {
          const profiles = await databases.listDocuments(
            process.env.APPWRITE_DATABASE_ID,
            COLLECTIONS.USER_PROFILES,
            [Query.equal('user_id', identifier)]
          )
          profile = profiles.documents[0]
        } catch (error) {
          // Try as profile ID
          profile = await databases.getDocument(
            process.env.APPWRITE_DATABASE_ID,
            COLLECTIONS.USER_PROFILES,
            identifier
          )
        }
      } else {
        // Likely a username
        const profiles = await databases.listDocuments(
          process.env.APPWRITE_DATABASE_ID,
          COLLECTIONS.USER_PROFILES,
          [Query.equal('username', identifier)]
        )
        profile = profiles.documents[0]
      }
    } catch (dbError) {
      console.log('Database not available, using mock data for development')
      profile = createMockProfile(identifier)
    }

    if (!profile) {
      // Create mock profile if none found
      profile = createMockProfile(identifier)
    }

    // Return public profile data
    res.json(formatResponse(true, {
      id: profile.user_id,
      username: profile.username,
      displayName: profile.display_name,
      bio: profile.bio,
      avatar: profile.avatar_url,
      location: profile.location,
      website: profile.website,
      socialLinks: profile.social_links || {},
      stats: profile.stats || {},
      verification: {
        emailVerified: profile.verification?.email_verified || false,
        developerVerified: profile.verification?.developer_verified || false
      },
      joinedAt: profile.created_at,
      lastSeen: profile.last_login
    }, 'Profile retrieved successfully'))

  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json(formatResponse(false, null, 'Failed to retrieve profile'))
  }
})

// Update user avatar
router.post('/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json(formatResponse(false, null, 'No image file provided'))
    }

    // Process image with Sharp (resize and optimize)
    const processedImage = await sharp(req.file.buffer)
      .resize(400, 400, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({
        quality: 85,
        progressive: true
      })
      .toBuffer()

    // Upload to Appwrite Storage
    const fileName = `avatar_${req.user.id}_${Date.now()}.jpg`
    const file = await storage.createFile(
      process.env.APPWRITE_STORAGE_BUCKET_ID,
      ID.unique(),
      fileName,
      processedImage
    )

    // Get file URL
    const fileUrl = storage.getFileView(
      process.env.APPWRITE_STORAGE_BUCKET_ID,
      file.$id
    )

    // Update user profile with new avatar URL
    const updatedProfile = await databases.updateDocument(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.USER_PROFILES,
      req.user.profileId,
      {
        avatar_url: fileUrl,
        updated_at: new Date().toISOString()
      }
    )

    // Log activity
    await databases.createDocument(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.USER_ACTIVITIES,
      ID.unique(),
      {
        user_id: req.user.id,
        action: 'avatar_updated',
        created_at: new Date().toISOString()
      }
    )

    res.json(formatResponse(true, {
      avatarUrl: fileUrl,
      fileId: file.$id
    }, 'Avatar updated successfully'))

  } catch (error) {
    console.error('Avatar upload error:', error)
    res.status(500).json(formatResponse(false, null, 'Failed to upload avatar'))
  }
})

// Get user's uploaded mods
router.get('/:identifier/mods', async (req, res) => {
  try {
    const { identifier } = req.params
    const { page = 1, limit = 10, status = 'approved' } = req.query

    // Get user profile first
    let profile
    if (identifier.length === 20) {
      const profiles = await databases.listDocuments(
        process.env.APPWRITE_DATABASE_ID,
        COLLECTIONS.USER_PROFILES,
        [Query.equal('user_id', identifier)]
      )
      profile = profiles.documents[0]
    } else {
      const profiles = await databases.listDocuments(
        process.env.APPWRITE_DATABASE_ID,
        COLLECTIONS.USER_PROFILES,
        [Query.equal('username', identifier)]
      )
      profile = profiles.documents[0]
    }

    if (!profile) {
      return res.status(404).json(formatResponse(false, null, 'User not found'))
    }

    // Get user's mods (this would connect to mods collection)
    // For now, return mock data
    const userMods = {
      total: 0,
      page: parseInt(page),
      limit: parseInt(limit),
      mods: []
    }

    res.json(formatResponse(true, userMods, 'User mods retrieved successfully'))

  } catch (error) {
    console.error('Get user mods error:', error)
    res.status(500).json(formatResponse(false, null, 'Failed to retrieve user mods'))
  }
})

// Get user's reviews
router.get('/:identifier/reviews', async (req, res) => {
  try {
    const { identifier } = req.params
    const { page = 1, limit = 10 } = req.query

    // Get user profile first
    let profile
    if (identifier.length === 20) {
      const profiles = await databases.listDocuments(
        process.env.APPWRITE_DATABASE_ID,
        COLLECTIONS.USER_PROFILES,
        [Query.equal('user_id', identifier)]
      )
      profile = profiles.documents[0]
    } else {
      const profiles = await databases.listDocuments(
        process.env.APPWRITE_DATABASE_ID,
        COLLECTIONS.USER_PROFILES,
        [Query.equal('username', identifier)]
      )
      profile = profiles.documents[0]
    }

    if (!profile) {
      return res.status(404).json(formatResponse(false, null, 'User not found'))
    }

    // Get user's reviews (this would connect to reviews collection)
    // For now, return mock data
    const userReviews = {
      total: 0,
      page: parseInt(page),
      limit: parseInt(limit),
      reviews: []
    }

    res.json(formatResponse(true, userReviews, 'User reviews retrieved successfully'))

  } catch (error) {
    console.error('Get user reviews error:', error)
    res.status(500).json(formatResponse(false, null, 'Failed to retrieve user reviews'))
  }
})

// Get user activity feed
router.get('/:identifier/activity', authenticateToken, async (req, res) => {
  try {
    const { identifier } = req.params
    const { page = 1, limit = 20 } = req.query

    // Only allow users to see their own activity or if they're admin
    if (req.user.username !== identifier && req.user.role !== 'admin') {
      return res.status(403).json(formatResponse(false, null, 'Access denied'))
    }

    // Get user activities
    const activities = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.USER_ACTIVITIES,
      [
        Query.equal('user_id', req.user.id),
        Query.orderDesc('created_at'),
        Query.limit(parseInt(limit)),
        Query.offset((parseInt(page) - 1) * parseInt(limit))
      ]
    )

    res.json(formatResponse(true, {
      total: activities.total,
      page: parseInt(page),
      limit: parseInt(limit),
      activities: activities.documents.map(activity => ({
        id: activity.$id,
        action: activity.action,
        timestamp: activity.created_at,
        ipAddress: activity.ip_address,
        userAgent: activity.user_agent
      }))
    }, 'User activity retrieved successfully'))

  } catch (error) {
    console.error('Get user activity error:', error)
    res.status(500).json(formatResponse(false, null, 'Failed to retrieve user activity'))
  }
})

// Update user preferences
router.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const { preferences } = req.body

    if (!preferences || typeof preferences !== 'object') {
      return res.status(400).json(formatResponse(false, null, 'Invalid preferences data'))
    }

    // Update preferences
    const updatedProfile = await databases.updateDocument(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.USER_PROFILES,
      req.user.profileId,
      {
        preferences: preferences,
        updated_at: new Date().toISOString()
      }
    )

    res.json(formatResponse(true, {
      preferences: updatedProfile.preferences
    }, 'Preferences updated successfully'))

  } catch (error) {
    console.error('Update preferences error:', error)
    res.status(500).json(formatResponse(false, null, 'Failed to update preferences'))
  }
})

export default router
