import express from 'express'
import { databases, Query, ID } from '../config/appwrite.js'
import { validateModSubmission } from '../validation/schemas.js'
import { submissionLimiter } from '../middleware/rateLimiter.js'
import { authenticateToken } from '../middleware/auth.js'
import { formatResponse } from '../utils/helpers.js'
import { COLLECTIONS } from '../config/collections.js'

const router = express.Router()

// Submit new mod for review (requires authentication)
router.post('/submit', authenticateToken, submissionLimiter, async (req, res) => {
  try {
    const userId = req.user.id
    
    // Get user profile for username
    const userProfile = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.USER_PROFILES,
      [Query.equal('user_id', userId)]
    )

    if (userProfile.documents.length === 0) {
      return res.status(400).json(formatResponse(false, null, 'User profile not found'))
    }

    const username = userProfile.documents[0].username
    const displayName = userProfile.documents[0].display_name || username

    // Map frontend data to validation schema format (only database fields)
    const submissionData = {
      title: req.body.title,
      description: req.body.description,
      category_id: req.body.category_id,
      author_name: displayName, // Use profile display name or username automatically
      version: req.body.version,
      download_url: req.body.download_url,
      file_size: req.body.file_size ? parseInt(req.body.file_size) : undefined,
      screenshots: req.body.screenshots || [],
      tags: req.body.tags || [],
      contact_email: req.body.contact_email,
      contact_discord: req.body.contact_discord || '',
      is_original_work: req.body.is_original_work,
      has_permission: req.body.has_permission,
      agree_to_terms: req.body.agree_to_terms,
      submitted_by: userId
    }

    // Debug logging
    console.log('Received submission data:', {
      agree_to_terms: req.body.agree_to_terms,
      is_original_work: req.body.is_original_work,
      has_permission: req.body.has_permission
    })
    console.log('Mapped submission data:', {
      agree_to_terms: submissionData.agree_to_terms,
      is_original_work: submissionData.is_original_work,
      has_permission: submissionData.has_permission
    })

    // Validate submission data
    const { error, value } = validateModSubmission(submissionData)
    if (error) {
      return res.status(400).json(formatResponse(false, null, error.details[0].message))
    }
    
    // Create submission in database
    const submission = await databases.createDocument(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.MOD_SUBMISSIONS,
      ID.unique(),
      {
        title: value.title,
        description: value.description,
        category_id: value.category_id,
        author_name: value.author_name,
        version: value.version,
        download_url: value.download_url,
        image_urls: JSON.stringify(value.screenshots || []),
        tags: JSON.stringify(value.tags || []),
        contact_email: value.contact_email,
        contact_discord: value.contact_discord || '',
        submitted_by: userId,
        status: 'pending',
        file_size: value.file_size || null,
        // Store additional form data as JSON in modData field
        modData: JSON.stringify({
          video_link: req.body.video_link || '',
          compatibility: req.body.compatibility || [],
          platform: 'PC',
          pricing_type: req.body.pricing_type || 'free',
          price: req.body.price ? parseFloat(req.body.price) : null,
          currency: req.body.currency || 'USD',
          original_price: req.body.original_price ? parseFloat(req.body.original_price) : null,
          discount_percentage: req.body.discount_percentage || 0,
          sale_end_date: req.body.sale_end_date || null,
          minimum_requirements: req.body.minimum_requirements || '',
          recommended_requirements: req.body.recommended_requirements || '',
          installation_notes: req.body.installation_notes || '',
          changelog: req.body.changelog || '',
          known_issues: req.body.known_issues || '',
          credits: req.body.credits || ''
        })
      }
    )

    // Log activity
    try {
      await databases.createDocument(
        process.env.APPWRITE_DATABASE_ID,
        COLLECTIONS.USER_ACTIVITIES,
        ID.unique(),
        {
          user_id: userId,
          activity_type: 'mod_submitted',
          description: `Submitted mod: ${value.title}`,
          ip_address: req.ip || '',
          user_agent: req.headers['user-agent'] || ''
        }
      )
    } catch (activityError) {
      console.log('Failed to log activity:', activityError)
    }
    
    res.status(201).json(formatResponse(
      true,
      { 
        id: submission.$id, 
        status: submission.status,
        title: submission.title,
        submitted_at: submission.$createdAt
      },
      'Mod submitted successfully for review'
    ))
    
  } catch (error) {
    console.error('Error submitting mod:', error)
    res.status(500).json(formatResponse(false, null, 'Failed to submit mod'))
  }
})

// Get submission status (public endpoint)
router.get('/status/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const submission = await databases.getDocument(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.MOD_SUBMISSIONS,
      id
    )

    const submissionData = {
      id: submission.$id,
      title: submission.title,
      description: submission.description,
      status: submission.status,
      submitted_at: submission.$createdAt,
      reviewed_at: submission.reviewed_at || null,
      admin_notes: submission.admin_notes || null
    }
    
    res.json(formatResponse(true, submissionData, 'Submission status retrieved'))
  } catch (error) {
    console.error('Error fetching submission status:', error)
    if (error.code === 404) {
      return res.status(404).json(formatResponse(false, null, 'Submission not found'))
    }
    res.status(500).json(formatResponse(false, null, 'Failed to fetch submission status'))
  }
})

// Get user's submissions (requires authentication)
router.get('/my-submissions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const status = req.query.status // optional filter by status

    const queries = [
      Query.equal('submitted_by', userId),
      Query.orderDesc('$createdAt'),
      Query.limit(limit),
      Query.offset((page - 1) * limit)
    ]

    if (status) {
      queries.push(Query.equal('status', status))
    }

    const response = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.MOD_SUBMISSIONS,
      queries
    )

    const submissions = response.documents.map(submission => ({
      id: submission.$id,
      title: submission.title,
      description: submission.description,
      category_id: submission.category_id,
      author_name: submission.author_name,
      version: submission.version,
      status: submission.status,
      admin_notes: submission.admin_notes,
      reviewed_by: submission.reviewed_by,
      reviewed_at: submission.reviewed_at,
      submitted_at: submission.$createdAt,
      updated_at: submission.$updatedAt
    }))

    res.json(formatResponse(true, {
      submissions,
      pagination: {
        current_page: parseInt(page),
        total: response.total,
        per_page: parseInt(limit),
        total_pages: Math.ceil(response.total / parseInt(limit))
      }
    }, 'Your submissions retrieved successfully'))
  } catch (error) {
    console.error('Error fetching user submissions:', error)
    res.status(500).json(formatResponse(false, null, 'Failed to fetch your submissions'))
  }
})

export default router
