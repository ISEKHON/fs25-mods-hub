import express from 'express'
import { formatResponse } from '../utils/helpers.js'

const router = express.Router()

// Get general statistics
router.get('/', async (req, res) => {
  try {
    const stats = {
      overview: {
        total_mods: 0,
        total_developers: 0,
        total_categories: 3,
        total_reviews: 0,
        total_downloads: 0,
        average_rating: 0
      },
      admin: {
        pending_submissions: 0,
        featured_mods: 0
      }
    }
    
    res.json(formatResponse(true, stats, 'Statistics retrieved successfully'))
  } catch (error) {
    console.error('Error fetching statistics:', error)
    res.status(500).json(formatResponse(false, null, 'Failed to fetch statistics'))
  }
})

export default router
