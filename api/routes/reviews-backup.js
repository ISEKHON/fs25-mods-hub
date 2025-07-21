import express from 'express'
import { Client, Databases, Query, ID } from 'node-appwrite'
import { validateReview } from '../validation/schemas.js'
import { reviewLimiter } from '../middleware/rateLimiter.js'
import { authenticateToken, optionalAuth } from '../middleware/auth.js'
import { formatResponse } from '../utils/helpers.js'
import { COLLECTIONS } from '../config/collections.js'

const router = express.Router()

// Initialize Appwrite
const client = new Client()
const databases = new Databases(client)

client
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY)

// Submit review for a mod (requires authentication)
router.post('/', authenticateToken, reviewLimiter, async (req, res) => {
  try {
    const { mod_id, rating, review_text } = req.body

    // Validate input
    if (!mod_id || !rating || rating < 1 || rating > 5) {
      return res.status(400).json(formatResponse(false, null, 'Valid mod_id and rating (1-5) are required'))
    }

    // Check if mod exists and is approved
    try {
      const mod = await databases.getDocument(
        process.env.APPWRITE_DATABASE_ID,
        COLLECTIONS.MODS,
        mod_id
      )
      
      if (!mod.is_approved) {
        return res.status(400).json(formatResponse(false, null, 'Cannot review unapproved mod'))
      }
    } catch (error) {
      return res.status(404).json(formatResponse(false, null, 'Mod not found'))
    }

    // Check if user already reviewed this mod
    const existingReviews = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.MOD_REVIEWS,
      [
        Query.equal('mod_id', mod_id),
        Query.equal('user_id', req.user.id)
      ]
    )

    if (existingReviews.documents.length > 0) {
      return res.status(400).json(formatResponse(false, null, 'You have already reviewed this mod'))
    }

    // Create review
    const reviewData = {
      mod_id,
      user_id: req.user.id,
      username: req.user.name || req.user.email.split('@')[0],
      rating: parseInt(rating),
      review_text: review_text || '',
      helpful_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const review = await databases.createDocument(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.MOD_REVIEWS,
      ID.unique(),
      reviewData
    )

    // Update mod rating statistics
    await updateModRatingStats(mod_id)

    res.status(201).json(formatResponse(
      true,
      {
        id: review.$id,
        rating: review.rating,
        review_text: review.review_text,
        username: review.username,
        created_at: review.created_at
      },
      'Review submitted successfully'
    ))
    
  } catch (error) {
    console.error('Error submitting review:', error)
    res.status(500).json(formatResponse(false, null, 'Failed to submit review'))
  }
})

// Get reviews for a mod
router.get('/mod/:modId', async (req, res) => {
  try {
    const { modId } = req.params
    const { page = 1, limit = 10, sort = 'newest' } = req.query

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const offset = (pageNum - 1) * limitNum

    // Build query
    let queries = [
      Query.equal('mod_id', modId),
      Query.limit(limitNum),
      Query.offset(offset)
    ]

    // Add sorting
    if (sort === 'oldest') {
      queries.push(Query.orderAsc('created_at'))
    } else if (sort === 'highest_rated') {
      queries.push(Query.orderDesc('rating'))
    } else if (sort === 'lowest_rated') {
      queries.push(Query.orderAsc('rating'))
    } else if (sort === 'most_helpful') {
      queries.push(Query.orderDesc('helpful_count'))
    } else {
      // Default: newest first
      queries.push(Query.orderDesc('created_at'))
    }

    const response = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.MOD_REVIEWS,
      queries
    )

    const reviews = response.documents.map(review => ({
      id: review.$id,
      rating: review.rating,
      review_text: review.review_text,
      username: review.username,
      helpful_count: review.helpful_count || 0,
      created_at: review.created_at,
      updated_at: review.updated_at
    }))

    res.json(formatResponse(true, {
      reviews,
      pagination: {
        current_page: pageNum,
        total: response.total,
        per_page: limitNum,
        total_pages: Math.ceil(response.total / limitNum)
      }
    }, 'Reviews retrieved successfully'))
    
  } catch (error) {
    console.error('Error fetching reviews:', error)
    res.status(500).json(formatResponse(false, null, 'Failed to fetch reviews'))
  }
      {
        id: '1',
        mod_id: modId,
        reviewer_name: 'John Doe',
        rating: 5,
        review_text: 'Great mod!',
        created_at: new Date().toISOString()
      }
    ]
    
    res.json(formatResponse(true, reviews, 'Reviews retrieved successfully'))
    
  } catch (error) {
    console.error('Error fetching reviews:', error)
    res.status(500).json(formatResponse(false, null, 'Failed to fetch reviews'))
  }
})

export default router
