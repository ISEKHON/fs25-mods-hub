import express from 'express'
import { Client, Databases, Query, ID } from 'node-appwrite'
import { COLLECTIONS } from '../config/collections.js'
import { formatResponse } from '../utils/helpers.js'
import { getUserAvatar } from '../utils/avatars.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Initialize Appwrite
const client = new Client()
const databases = new Databases(client)

client
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY)

// Get all mods with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      search, 
      sort = 'created_at', 
      order = 'desc', 
      page = 1, 
      limit = 20,
      status = 'approved',
      featured
    } = req.query

    const queries = [
      Query.equal('is_approved', status === 'approved'),
      Query.equal('is_active', true),
      Query.orderDesc('$createdAt'),
      Query.limit(parseInt(limit)),
      Query.offset((parseInt(page) - 1) * parseInt(limit))
    ]

    if (category) {
      queries.push(Query.equal('category_id', category))
    }

    if (search) {
      queries.push(Query.search('title', search))
    }

    if (featured === 'true') {
      queries.push(Query.equal('is_featured', true))
    }

    if (sort === 'downloads') {
      queries[2] = order === 'asc' ? Query.orderAsc('download_count') : Query.orderDesc('download_count')
    } else if (sort === 'rating') {
      queries[2] = order === 'asc' ? Query.orderAsc('rating_average') : Query.orderDesc('rating_average')
    } else if (sort === 'title') {
      queries[2] = order === 'asc' ? Query.orderAsc('title') : Query.orderDesc('title')
    }

    const response = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.MODS,
      queries
    )

    // Get all categories for name resolution
    const categoriesResponse = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.MOD_CATEGORIES,
      [Query.limit(100)]
    )
    const categoriesMap = {}
    categoriesResponse.documents.forEach(cat => {
      categoriesMap[cat.$id] = cat.name
    })

    const modsWithDetails = await Promise.all(response.documents.map(async (mod) => {
      // Get author profile information with global avatar system
      let authorInfo = {
        id: mod.submitted_by || '',
        name: mod.author_name || 'Unknown',
        username: mod.author_name || 'unknown',
        avatar: null,
        isVerified: false
      }

      // Try to fetch detailed author profile and avatar using submitted_by
      if (mod.submitted_by) {
        try {
          const profileResponse = await databases.listDocuments(
            process.env.APPWRITE_DATABASE_ID,
            COLLECTIONS.USER_PROFILES,
            [Query.equal('user_id', mod.submitted_by)]
          )
          
          if (profileResponse.documents.length > 0) {
            const profile = profileResponse.documents[0]
            // Use global avatar system with username fallback
            const userAvatar = await getUserAvatar(profile.user_id, profile.username)
            
            authorInfo = {
              id: profile.user_id,
              name: profile.display_name || profile.username,
              username: profile.username,
              avatar: userAvatar,
              isVerified: profile.verification?.email_verified || false
            }
          } else {
            // No profile found, but we have submitted_by - generate fallback avatar
            const userAvatar = await getUserAvatar(mod.submitted_by, mod.author_name)
            authorInfo.avatar = userAvatar
          }
        } catch (profileError) {
          console.log('Failed to fetch author profile:', profileError)
        }
      }

      // Parse screenshots from image_urls if it's a JSON string
      let screenshots = []
      let images = []
      if (mod.image_urls) {
        try {
          const imageUrls = typeof mod.image_urls === 'string' ? JSON.parse(mod.image_urls) : mod.image_urls
          screenshots = Array.isArray(imageUrls) ? imageUrls : []
          // Convert to ModImage format for frontend
          images = screenshots.map(url => ({
            type: 'image',
            url: url
          }))
        } catch (error) {
          console.log('Failed to parse image_urls:', error)
          screenshots = []
          images = []
        }
      }

      // Parse tags if it's a JSON string
      let tags = []
      if (mod.tags) {
        try {
          tags = typeof mod.tags === 'string' ? JSON.parse(mod.tags) : mod.tags
          if (!Array.isArray(tags)) tags = []
        } catch (error) {
          console.log('Failed to parse tags:', error)
          tags = []
        }
      }

      // Parse modData for additional information
      let modData = {}
      if (mod.modData) {
        try {
          modData = typeof mod.modData === 'string' ? JSON.parse(mod.modData) : mod.modData
        } catch (error) {
          console.log('Failed to parse modData:', error)
          modData = {}
        }
      }

      return {
        id: mod.$id,
        title: mod.title,
        slug: mod.slug || mod.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: mod.description,
        category: categoriesMap[mod.category_id] || 'Unknown Category',
        category_id: mod.category_id,
        version: mod.version,
        author: authorInfo,
        downloads: mod.download_count || 0,
        rating: mod.rating_average || 0,
        rating_count: mod.rating_count || 0,
        thumbnail: screenshots.length > 0 ? screenshots[0] : null,
        screenshots: screenshots,
        images: images, // ModImage format for frontend compatibility
        tags: tags,
        file_size: mod.file_size,
        featured: mod.is_featured || false,
        video_url: modData.video_link || '', // Add video URL from modData
        pricing: {
          type: modData.pricing_type || 'free',
          price: modData.price || 0,
          currency: modData.currency || 'USD'
        },
        created_at: mod.$createdAt,
        updated_at: mod.$updatedAt
      }
    }))

    res.json(formatResponse(true, {
      mods: modsWithDetails,
      pagination: {
        current_page: parseInt(page),
        total: response.total,
        per_page: parseInt(limit),
        total_pages: Math.ceil(response.total / parseInt(limit))
      }
    }, 'Mods retrieved successfully'))
  } catch (error) {
    console.error('Error fetching mods:', error)
    res.status(500).json(formatResponse(false, null, 'Failed to fetch mods'))
  }
})

// Get single mod by slug or ID
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params
    
    let mod
    try {
      // Try to get by ID first
      mod = await databases.getDocument(
        process.env.APPWRITE_DATABASE_ID,
        COLLECTIONS.MODS,
        identifier
      )
      
      // Check if mod is approved
      if (!mod.is_approved) {
        return res.status(404).json(formatResponse(false, null, 'Mod not found'))
      }
    } catch (error) {
      // If not found by ID, try by slug
      const response = await databases.listDocuments(
        process.env.APPWRITE_DATABASE_ID,
        COLLECTIONS.MODS,
        [
          Query.equal('slug', identifier),
          Query.equal('is_approved', true)
        ]
      )
      
      if (response.documents.length === 0) {
        return res.status(404).json(formatResponse(false, null, 'Mod not found'))
      }
      
      mod = response.documents[0]
    }

    // Get category name
    let categoryName = 'Unknown Category'
    try {
      const category = await databases.getDocument(
        process.env.APPWRITE_DATABASE_ID,
        COLLECTIONS.MOD_CATEGORIES,
        mod.category_id
      )
      categoryName = category.name
    } catch (error) {
      console.log('Could not resolve category name:', error.message)
    }

    // Get author profile information
    let authorInfo = {
      id: mod.submitted_by || '',
      name: mod.author_name || 'Unknown',
      username: mod.author_name || 'unknown',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(mod.author_name || 'Unknown')}&size=128&background=27ae60&color=fff`,
      isVerified: false
    }

    // Try to fetch detailed author profile using submitted_by
    if (mod.submitted_by) {
      try {
        const profileResponse = await databases.listDocuments(
          process.env.APPWRITE_DATABASE_ID,
          COLLECTIONS.USER_PROFILES,
          [Query.equal('user_id', mod.submitted_by)]
        )
        
        if (profileResponse.documents.length > 0) {
          const profile = profileResponse.documents[0]
          authorInfo = {
            id: profile.user_id,
            name: profile.display_name || profile.username,
            username: profile.username,
            avatar: profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.display_name || profile.username)}&size=128&background=27ae60&color=fff`,
            isVerified: profile.verification?.email_verified || false
          }
        }
      } catch (profileError) {
        console.log('Failed to fetch author profile:', profileError)
      }
    }

    // Get mod reviews
    const reviewsResponse = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.MOD_REVIEWS,
      [
        Query.equal('mod_id', mod.$id),
        Query.limit(10)
      ]
    )

    // Parse screenshots from image_urls if it's a JSON string
    let screenshots = []
    let images = []
    if (mod.image_urls) {
      try {
        const imageUrls = typeof mod.image_urls === 'string' ? JSON.parse(mod.image_urls) : mod.image_urls
        screenshots = Array.isArray(imageUrls) ? imageUrls : []
        // Convert to ModImage format for frontend
        images = screenshots.map(url => ({
          type: 'image',
          url: url
        }))
      } catch (error) {
        console.log('Failed to parse image_urls:', error)
        screenshots = []
        images = []
      }
    }

    // Parse tags if it's a JSON string
    let tags = []
    if (mod.tags) {
      try {
        tags = typeof mod.tags === 'string' ? JSON.parse(mod.tags) : mod.tags
        if (!Array.isArray(tags)) tags = []
      } catch (error) {
        console.log('Failed to parse tags:', error)
        tags = []
      }
    }

    // Parse modData if it exists (contains additional mod information)
    let modData = {}
    if (mod.modData) {
      try {
        modData = typeof mod.modData === 'string' ? JSON.parse(mod.modData) : mod.modData
      } catch (error) {
        console.log('Failed to parse modData:', error)
        modData = {}
      }
    }

    // Format file size
    const formatFileSize = (bytes) => {
      if (!bytes) return 'Unknown'
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      if (bytes === 0) return '0 Bytes'
      const i = Math.floor(Math.log(bytes) / Math.log(1024))
      return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
    }

    const modDetails = {
      id: mod.$id,
      title: mod.title,
      slug: mod.slug || mod.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: mod.description,
      category: categoryName,
      category_id: mod.category_id,
      version: mod.version,
      author: authorInfo,
      downloads: mod.download_count || 0,
      rating: mod.rating_average || 0,
      rating_count: mod.rating_count || 0,
      ratingCount: mod.rating_count || 0, // Alias for frontend compatibility
      thumbnail: screenshots.length > 0 ? screenshots[0] : null,
      screenshots: screenshots,
      images: images, // ModImage format for frontend compatibility
      tags: tags,
      file_size: mod.file_size,
      size: formatFileSize(mod.file_size), // Formatted size for display
      download_url: mod.download_url,
      featured: mod.is_featured || false,
      compatibility: modData.compatibility || mod.compatibility || [],
      requirements: {
        min: modData.minimum_requirements || mod.minimum_requirements || '',
        recommended: modData.recommended_requirements || mod.recommended_requirements || ''
      },
      installation_notes: modData.installation_notes || mod.installation_notes || '',
      changelog: modData.changelog || mod.changelog || '',
      video_url: modData.video_link || '',
      known_issues: modData.known_issues || '',
      credits: modData.credits || '',
      created_at: mod.$createdAt,
      updated_at: mod.$updatedAt,
      updatedAt: mod.$updatedAt, // Alias for frontend compatibility
      pricing: {
        type: modData.pricing_type || 'free',
        price: modData.price || 0,
        currency: modData.currency || 'USD',
        originalPrice: modData.original_price || null,
        discountPercentage: modData.discount_percentage || 0,
        saleEndDate: modData.sale_end_date || null
      },
      reviews: reviewsResponse.documents.map(review => ({
        id: review.$id,
        userId: review.user_id || '',
        userName: review.username,
        userAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(review.username)}&size=48&background=27ae60&color=fff`,
        rating: review.rating,
        title: '', // Reviews don't have titles in our schema
        comment: review.review_text,
        createdAt: review.$createdAt,
        helpful: review.helpful_count || 0,
        notHelpful: 0, // We don't track this yet
        verified: false, // We don't track this yet
        version: '1.0.0' // Default version
      }))
    }
    
    res.json(formatResponse(true, modDetails, 'Mod retrieved successfully'))
  } catch (error) {
    console.error('Error fetching mod:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      type: error.type
    })
    res.status(500).json(formatResponse(false, null, 'Failed to fetch mod'))
  }
})

// Download mod (increment download counter)
router.post('/:id/download', async (req, res) => {
  try {
    const { id } = req.params
    const userAgent = req.get('User-Agent')
    const ipAddress = req.ip
    const userId = req.user?.id

    // Get mod details
    const mod = await databases.getDocument(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.MODS,
      id
    )

    if (!mod || !mod.is_approved) {
      return res.status(404).json(formatResponse(false, null, 'Mod not found'))
    }

    // Log download with rate limiting to prevent spam
    try {
      // Check for recent downloads from same IP/user to prevent spam
      const recentDownloads = await databases.listDocuments(
        process.env.APPWRITE_DATABASE_ID,
        COLLECTIONS.MOD_DOWNLOADS,
        [
          Query.equal('mod_id', id),
          Query.equal('ip_address', ipAddress),
          Query.greaterThan('$createdAt', new Date(Date.now() - 60000).toISOString()) // Last minute
        ]
      )

      if (recentDownloads.documents.length === 0) {
        await databases.createDocument(
          process.env.APPWRITE_DATABASE_ID,
          COLLECTIONS.MOD_DOWNLOADS,
          ID.unique(),
          {
            mod_id: id,
            user_id: userId || null,
            ip_address: ipAddress,
            user_agent: userAgent
          }
        )

        // Update download count only if new download is logged
        await databases.updateDocument(
          process.env.APPWRITE_DATABASE_ID,
          COLLECTIONS.MODS,
          id,
          {
            download_count: (mod.download_count || 0) + 1
          }
        )
      }
    } catch (downloadLogError) {
      console.warn('Failed to log download, but continuing:', downloadLogError.message)
    }

    res.json(formatResponse(true, {
      download_url: mod.download_url,
      title: mod.title,
      version: mod.version,
      file_size: mod.file_size || null,
      redirect_message: 'Redirecting to external download link...'
    }, 'Download link retrieved successfully'))
  } catch (error) {
    console.error('Error processing download:', error)
    res.status(500).json(formatResponse(false, null, 'Failed to process download'))
  }
})

// Add review to mod
router.post('/:id/reviews', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { rating, review_text } = req.body
    const userId = req.user.id

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json(formatResponse(false, null, 'Rating must be between 1 and 5'))
    }

    // Check if user already reviewed this mod
    const existingReview = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.MOD_REVIEWS,
      [
        Query.equal('mod_id', id),
        Query.equal('user_id', userId)
      ]
    )

    if (existingReview.documents.length > 0) {
      return res.status(400).json(formatResponse(false, null, 'You have already reviewed this mod'))
    }

    // Get user profile for username
    const userProfile = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      'user_profiles',
      [Query.equal('user_id', userId)]
    )

    const username = userProfile.documents[0]?.username || 'Anonymous'

    // Create review
    const review = await databases.createDocument(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.MOD_REVIEWS,
      'unique()',
      {
        mod_id: id,
        user_id: userId,
        username: username,
        rating: parseInt(rating),
        review_text: review_text || '',
        status: 'approved' // Auto-approve for now
      }
    )

    // Recalculate mod rating
    const allReviews = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.MOD_REVIEWS,
      [
        Query.equal('mod_id', id)
      ]
    )

    const totalRating = allReviews.documents.reduce((sum, r) => sum + r.rating, 0)
    const averageRating = totalRating / allReviews.documents.length

    await databases.updateDocument(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.MODS,
      id,
      {
        rating_average: averageRating,
        rating_count: allReviews.documents.length
      }
    )

    res.json(formatResponse(true, {
      id: review.$id,
      rating: review.rating,
      review_text: review.review_text,
      username: review.username,
      created_at: review.$createdAt
    }, 'Review added successfully'))
  } catch (error) {
    console.error('Error adding review:', error)
    res.status(500).json(formatResponse(false, null, 'Failed to add review'))
  }
})

// Toggle favorite mod
router.post('/:id/favorite', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    // Check if already favorited
    const existing = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      'user_favorites',
      [
        Query.equal('user_id', userId),
        Query.equal('mod_id', id)
      ]
    )

    if (existing.documents.length > 0) {
      // Remove favorite
      await databases.deleteDocument(
        process.env.APPWRITE_DATABASE_ID,
        'user_favorites',
        existing.documents[0].$id
      )
      
      res.json(formatResponse(true, { favorited: false }, 'Mod removed from favorites'))
    } else {
      // Add favorite
      await databases.createDocument(
        process.env.APPWRITE_DATABASE_ID,
        'user_favorites',
        'unique()',
        {
          user_id: userId,
          mod_id: id
        }
      )
      
      res.json(formatResponse(true, { favorited: true }, 'Mod added to favorites'))
    }
  } catch (error) {
    console.error('Error toggling favorite:', error)
    res.status(500).json(formatResponse(false, null, 'Failed to toggle favorite'))
  }
})

// Report mod
router.post('/:id/report', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { reason, description } = req.body
    const userId = req.user.id

    if (!reason) {
      return res.status(400).json(formatResponse(false, null, 'Report reason is required'))
    }

    await databases.createDocument(
      process.env.APPWRITE_DATABASE_ID,
      'reports',
      'unique()',
      {
        reporter_id: userId,
        reported_item_type: 'mod',
        reported_item_id: id,
        reason: reason,
        description: description || '',
        status: 'pending'
      }
    )

    res.json(formatResponse(true, null, 'Report submitted successfully'))
  } catch (error) {
    console.error('Error submitting report:', error)
    res.status(500).json(formatResponse(false, null, 'Failed to submit report'))
  }
})

export default router
