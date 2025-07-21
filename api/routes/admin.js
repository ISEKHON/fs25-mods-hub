import express from 'express'
import { databases, Query, ID } from '../config/appwrite.js'
import { COLLECTIONS } from '../config/collections.js'
import { formatResponse } from '../utils/helpers.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Middleware to check admin role
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(403).json(formatResponse(false, null, 'Admin access required'))
    }

    // Get user profile to check admin status
    const userProfile = await databases.getDocument(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.USER_PROFILES,
      req.user.profileId
    )

    // Check if user is admin (either by role field or hardcoded admin list)
    const adminEmails = [
      'working@fs25hub.com',
      'test123@gmail.com'  // Add your admin emails here
    ]

    const isAdmin = userProfile.role === 'admin' || 
                   userProfile.is_admin === true || 
                   adminEmails.includes(userProfile.email)

    if (!isAdmin) {
      return res.status(403).json(formatResponse(false, null, 'Admin privileges required'))
    }

    // Add admin info to request
    req.admin = {
      id: userProfile.$id,
      email: userProfile.email,
      username: userProfile.username
    }

    next()
  } catch (error) {
    console.error('Admin check error:', error)
    res.status(403).json(formatResponse(false, null, 'Admin access verification failed'))
  }
}

// Apply authentication and admin check to all routes
router.use(authenticateToken)
router.use(requireAdmin)

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    // Get total mods
    const modsResponse = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.MODS,
      [Query.limit(1)]
    )

    // Get pending submissions
    const pendingSubmissions = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.MOD_SUBMISSIONS,
      [Query.equal('status', 'pending'), Query.limit(1)]
    )

    // Get approved submissions
    const approvedSubmissions = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.MOD_SUBMISSIONS,
      [Query.equal('status', 'approved'), Query.limit(1)]
    )

    // Get rejected submissions
    const rejectedSubmissions = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.MOD_SUBMISSIONS,
      [Query.equal('status', 'rejected'), Query.limit(1)]
    )

    // Get total reviews (all reviews are published when submitted)
    const totalReviews = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.MOD_REVIEWS,
      [Query.limit(1)]
    )

    // Get total categories
    const categoriesResponse = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.MOD_CATEGORIES,
      [Query.limit(1)]
    )

    // Get total users
    const usersResponse = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.USER_PROFILES,
      [Query.limit(1)]
    )

    const stats = {
      total_mods: modsResponse.total,
      pending_submissions: pendingSubmissions.total,
      approved_submissions: approvedSubmissions.total,
      rejected_submissions: rejectedSubmissions.total,
      total_reviews: totalReviews.total,
      total_categories: categoriesResponse.total,
      total_users: usersResponse.total,
      // Admin info
      admin_info: {
        username: req.admin.username,
        email: req.admin.email
      }
    }

    res.json(formatResponse(true, stats, 'Admin stats retrieved'))
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    res.status(500).json(formatResponse(false, null, 'Failed to fetch statistics'))
  }
})

// Get pending submissions
router.get('/submissions/pending', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query

    const response = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.MOD_SUBMISSIONS,
      [
        Query.equal('status', 'pending'),
        Query.orderDesc('$createdAt'),
        Query.limit(parseInt(limit)),
        Query.offset((parseInt(page) - 1) * parseInt(limit))
      ]
    )

    const submissions = response.documents.map(submission => ({
      id: submission.$id,
      title: submission.title,
      description: submission.description,
      submitter_id: submission.submitted_by,
      category_id: submission.category_id,
      author_name: submission.author_name || 'Unknown',
      contact_email: submission.contact_email || '',
      contact_discord: submission.contact_discord || '',
      version: submission.version,
      download_url: submission.download_url || '',
      image_urls: submission.image_urls || '',
      tags: submission.tags || '',
      submitted_at: submission.$createdAt,
      submission_notes: submission.submission_notes
    }))

    res.json(formatResponse(true, {
      submissions,
      pagination: {
        current_page: parseInt(page),
        total: response.total,
        per_page: parseInt(limit),
        total_pages: Math.ceil(response.total / parseInt(limit))
      }
    }, 'Pending submissions retrieved'))
  } catch (error) {
    console.error('Error fetching pending submissions:', error)
    res.status(500).json(formatResponse(false, null, 'Failed to fetch submissions'))
  }
})

// Approve submission
router.post('/submissions/:id/approve', async (req, res) => {
  try {
    const { id } = req.params
    const { admin_notes } = req.body
    const adminId = req.user.id

    // Get submission details
    const submission = await databases.getDocument(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.MOD_SUBMISSIONS,
      id
    )

    // Get category details - handle invalid category IDs gracefully
    let category = null
    let categoryId = submission.category_id
    let categoryName = 'Miscellaneous' // Default category
    
    try {
      // First try to get the category as-is
      category = await databases.getDocument(
        process.env.APPWRITE_DATABASE_ID,
        COLLECTIONS.MOD_CATEGORIES,
        submission.category_id
      )
      categoryName = category.name
    } catch (error) {
      console.log('Category not found, looking for matching category by name:', submission.category_id)
      
      // If direct lookup fails, try to find category by name
      try {
        const categories = await databases.listDocuments(
          process.env.APPWRITE_DATABASE_ID,
          COLLECTIONS.MOD_CATEGORIES,
          [Query.limit(100)]
        )
        
        // Look for a category that matches by name (case-insensitive)
        const matchingCategory = categories.documents.find(cat => {
          const categoryName = cat.name.toLowerCase()
          const submissionCategory = submission.category_id.toLowerCase()
          
          // Smart category mapping for common terms
          if (submissionCategory.includes('cultivator') || submissionCategory.includes('tool') || 
              submissionCategory.includes('equipment') || submissionCategory.includes('implement')) {
            return categoryName.includes('tools')
          }
          if (submissionCategory.includes('vehicle') || submissionCategory.includes('tractor') || 
              submissionCategory.includes('truck') || submissionCategory.includes('car')) {
            return categoryName.includes('vehicles')
          }
          if (submissionCategory.includes('map') || submissionCategory.includes('terrain') || 
              submissionCategory.includes('field')) {
            return categoryName.includes('maps')
          }
          if (submissionCategory.includes('script') || submissionCategory.includes('mod') || 
              submissionCategory.includes('gameplay') || submissionCategory.includes('function')) {
            return categoryName.includes('scripts')
          }
          
          // Direct name match
          return categoryName.includes(submissionCategory) || cat.slug.toLowerCase().includes(submissionCategory)
        })
        
        if (matchingCategory) {
          category = matchingCategory
          categoryId = matchingCategory.$id
          categoryName = matchingCategory.name
          console.log('Found matching category:', categoryName)
        } else {
          // Use first available category as fallback
          if (categories.documents.length > 0) {
            category = categories.documents[0]
            categoryId = category.$id
            categoryName = category.name
            console.log('Using fallback category:', categoryName)
          }
        }
      } catch (listError) {
        console.log('Could not fetch categories, using default values')
      }
    }

    // Get user profile information for author details
    let authorUsername = 'Unknown'
    let authorId = submission.submitted_by

    if (submission.submitted_by) {
      try {
        const userProfile = await databases.listDocuments(
          process.env.APPWRITE_DATABASE_ID,
          COLLECTIONS.USER_PROFILES,
          [Query.equal('user_id', submission.submitted_by)]
        )
        
        if (userProfile.documents.length > 0) {
          authorUsername = userProfile.documents[0].username
          console.log('Found author username:', authorUsername)
        }
      } catch (profileError) {
        console.log('Could not fetch user profile for author:', profileError)
      }
    }

    // Parse additional data from modData JSON field
    let modData = {}
    try {
      modData = JSON.parse(submission.modData || '{}')
    } catch (error) {
      console.log('Could not parse modData:', error.message)
    }

    // Create mod from submission with comprehensive data
    const mod = await databases.createDocument(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.MODS,
      ID.unique(),
      {
        title: submission.title,
        slug: submission.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: submission.description,
        author_name: submission.author_name || 'Unknown',
        category_id: categoryId,
        version: submission.version,
        download_url: submission.download_url,
        submitted_by: submission.submitted_by,
        is_approved: true,
        approved_by: req.admin.username,
        approved_at: new Date().toISOString(),
        tags: submission.tags || null,
        image_urls: submission.image_urls || null,
        file_size: submission.file_size || null,
        modData: submission.modData || '{}', // Transfer the modData field
        download_count: 0,
        rating_average: 0,
        rating_count: 0
      }
    )

    // Update submission status with comprehensive tracking
    await databases.updateDocument(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.MOD_SUBMISSIONS,
      id,
      {
        status: 'approved',
        admin_notes: admin_notes || 'Approved via admin panel',
        reviewed_at: new Date().toISOString(),
        reviewed_by: req.admin.username
      }
    )

    // Update category mod count (only if we have a valid category)
    if (category && categoryId) {
      try {
        await databases.updateDocument(
          process.env.APPWRITE_DATABASE_ID,
          COLLECTIONS.MOD_CATEGORIES,
          categoryId,
          {
            mod_count: (category.mod_count || 0) + 1
          }
        )
      } catch (error) {
        console.log('Could not update category mod count:', error.message)
      }
    }

    // TODO: Send notification to submitter

    res.json(formatResponse(true, {
      mod_id: mod.$id,
      submission_id: id,
      status: 'approved'
    }, 'Submission approved successfully'))
  } catch (error) {
    console.error('Error approving submission:', error)
    res.status(500).json(formatResponse(false, null, 'Failed to approve submission'))
  }
})

// Reject submission
router.post('/submissions/:id/reject', async (req, res) => {
  try {
    const { id } = req.params
    const { admin_notes, reason } = req.body
    const adminId = req.user.id

    if (!reason) {
      return res.status(400).json(formatResponse(false, null, 'Rejection reason is required'))
    }

    await databases.updateDocument(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.MOD_SUBMISSIONS,
      id,
      {
        status: 'rejected',
        admin_notes: admin_notes || reason,
        reviewed_at: new Date().toISOString(),
        reviewed_by: req.admin.username
      }
    )

    // TODO: Send notification to submitter

    res.json(formatResponse(true, {
      submission_id: id,
      status: 'rejected'
    }, 'Submission rejected'))
  } catch (error) {
    console.error('Error rejecting submission:', error)
    res.status(500).json(formatResponse(false, null, 'Failed to reject submission'))
  }
})

// Get all mods for admin management
router.get('/mods', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query

    const queries = [
      Query.orderDesc('$createdAt'),
      Query.limit(parseInt(limit)),
      Query.offset((parseInt(page) - 1) * parseInt(limit))
    ]

    if (status) {
      if (status === 'approved') {
        queries.push(Query.equal('is_approved', true))
      } else if (status === 'pending' || status === 'rejected') {
        queries.push(Query.equal('is_approved', false))
      }
    }

    const response = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.MODS,
      queries
    )

    const mods = response.documents.map(mod => ({
      id: mod.$id,
      title: mod.title,
      author_username: mod.author_username,
      category_name: mod.category_name,
      version: mod.version,
      status: mod.is_approved ? 'approved' : 'pending',
      download_count: mod.download_count || 0,
      rating_average: mod.rating_average || 0,
      created_at: mod.$createdAt,
      approved_at: mod.approved_at
    }))

    res.json(formatResponse(true, {
      mods,
      pagination: {
        current_page: parseInt(page),
        total: response.total,
        per_page: parseInt(limit),
        total_pages: Math.ceil(response.total / parseInt(limit))
      }
    }, 'Mods retrieved'))
  } catch (error) {
    console.error('Error fetching mods:', error)
    res.status(500).json(formatResponse(false, null, 'Failed to fetch mods'))
  }
})

// Toggle featured status (placeholder - featured field needs to be added to schema)
router.post('/mods/:id/toggle-featured', async (req, res) => {
  try {
    const { id } = req.params

    // TODO: Add featured field to MODS collection schema first
    res.status(501).json(formatResponse(false, null, 'Featured functionality not yet implemented - schema needs featured field'))
  } catch (error) {
    console.error('Error toggling featured status:', error)
    res.status(500).json(formatResponse(false, null, 'Failed to update mod'))
  }
})

// Get all users for admin management
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query

    const queries = [
      Query.orderDesc('$createdAt'),
      Query.limit(parseInt(limit)),
      Query.offset((parseInt(page) - 1) * parseInt(limit))
    ]

    if (search) {
      queries.push(Query.search('username', search))
    }

    const response = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.USER_PROFILES,
      queries
    )

    const users = response.documents.map(user => ({
      id: user.$id,
      username: user.username,
      display_name: user.display_name,
      email: user.email,
      is_verified: user.is_verified || false,
      is_active: user.is_active || false,
      role: user.role || 'user',
      is_admin: user.is_admin || false,
      join_date: user.join_date || user.$createdAt,
      last_login: user.last_login
    }))

    res.json(formatResponse(true, {
      users,
      pagination: {
        current_page: parseInt(page),
        total: response.total,
        per_page: parseInt(limit),
        total_pages: Math.ceil(response.total / parseInt(limit))
      }
    }, 'Users retrieved'))
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json(formatResponse(false, null, 'Failed to fetch users'))
  }
})

// Update user status
router.post('/users/:id/update-status', async (req, res) => {
  try {
    const { id } = req.params
    const { is_active, is_verified } = req.body

    const updateData = {}
    if (typeof is_active === 'boolean') updateData.is_active = is_active
    if (typeof is_verified === 'boolean') updateData.is_verified = is_verified

    await databases.updateDocument(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.USER_PROFILES,
      id,
      updateData
    )

    res.json(formatResponse(true, {
      user_id: id,
      updated_fields: updateData
    }, 'User status updated successfully'))
  } catch (error) {
    console.error('Error updating user status:', error)
    res.status(500).json(formatResponse(false, null, 'Failed to update user'))
  }
})

// Get pending submissions
router.get('/submissions', async (req, res) => {
  try {
    const { status = 'pending', page = 1, limit = 20 } = req.query

    const queries = [
      Query.equal('status', status),
      Query.orderDesc('$createdAt'),
      Query.limit(parseInt(limit)),
      Query.offset((parseInt(page) - 1) * parseInt(limit))
    ]

    const response = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.MOD_SUBMISSIONS,
      queries
    )

    // Get categories for name resolution
    const categoriesResponse = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.MOD_CATEGORIES,
      [Query.limit(100)]
    )
    const categoriesMap = {}
    categoriesResponse.documents.forEach(cat => {
      categoriesMap[cat.$id] = cat.name
    })

    const submissionsWithDetails = response.documents.map(submission => {
      // Parse modData if it exists
      let modData = {}
      if (submission.modData) {
        try {
          modData = typeof submission.modData === 'string' ? JSON.parse(submission.modData) : submission.modData
        } catch (error) {
          console.log('Failed to parse modData:', error)
          modData = {}
        }
      }

      // Parse image URLs
      let screenshots = []
      if (submission.image_urls) {
        try {
          screenshots = typeof submission.image_urls === 'string' ? JSON.parse(submission.image_urls) : submission.image_urls
        } catch (error) {
          screenshots = []
        }
      }

      return {
        id: submission.$id,
        title: submission.title,
        description: submission.description,
        category: categoriesMap[submission.category_id] || 'Unknown Category',
        category_id: submission.category_id,
        version: submission.version,
        author_name: submission.author_name,
        download_url: submission.download_url,
        file_size: submission.file_size,
        screenshots: screenshots,
        video_url: modData.video_link || '',
        changelog: modData.changelog || '',
        status: submission.status,
        submitted_at: submission.$createdAt,
        contact_email: submission.contact_email,
        contact_discord: submission.contact_discord,
        pricing: {
          type: modData.pricing_type || 'free',
          price: modData.price || 0,
          currency: modData.currency || 'USD'
        },
        compatibility: modData.compatibility || [],
        requirements: {
          min: modData.minimum_requirements || '',
          recommended: modData.recommended_requirements || ''
        },
        installation_notes: modData.installation_notes || '',
        known_issues: modData.known_issues || '',
        credits: modData.credits || ''
      }
    })

    res.json(formatResponse(true, {
      submissions: submissionsWithDetails,
      pagination: {
        current_page: parseInt(page),
        total: response.total,
        per_page: parseInt(limit),
        total_pages: Math.ceil(response.total / parseInt(limit))
      }
    }, 'Submissions retrieved successfully'))
  } catch (error) {
    console.error('Error fetching submissions:', error)
    res.status(500).json(formatResponse(false, null, 'Failed to fetch submissions'))
  }
})

// Approve submission and create mod with modData
router.post('/submissions/:id/approve', async (req, res) => {
  try {
    const { id } = req.params
    
    // Get the submission
    const submission = await databases.getDocument(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.MOD_SUBMISSIONS,
      id
    )

    if (!submission) {
      return res.status(404).json(formatResponse(false, null, 'Submission not found'))
    }

    // Create mod from submission
    const modData = {
      title: submission.title,
      description: submission.description,
      category_id: submission.category_id,
      author_name: submission.author_name,
      version: submission.version,
      download_url: submission.download_url,
      file_size: submission.file_size,
      image_urls: submission.image_urls, // Already a JSON string
      tags: submission.tags, // Already a JSON string
      submitted_by: submission.submitted_by,
      is_approved: true,
      is_active: true,
      is_featured: false,
      download_count: 0,
      rating_average: 0,
      rating_count: 0,
      slug: submission.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      modData: submission.modData || '{}' // Transfer the modData field
    }

    // Create the mod
    const newMod = await databases.createDocument(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.MODS,
      ID.unique(),
      modData
    )

    // Update submission status
    await databases.updateDocument(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.MOD_SUBMISSIONS,
      id,
      { status: 'approved' }
    )

    // Log admin activity
    await databases.createDocument(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.ADMIN_LOGS,
      ID.unique(),
      {
        admin_id: req.admin.id,
        action: 'approve_submission',
        details: `Approved submission: ${submission.title}`,
        ip_address: req.ip || ''
      }
    )

    res.json(formatResponse(true, {
      mod_id: newMod.$id,
      submission_id: id,
      title: submission.title
    }, 'Submission approved and mod created successfully'))
  } catch (error) {
    console.error('Error approving submission:', error)
    res.status(500).json(formatResponse(false, null, 'Failed to approve submission'))
  }
})

// Reject submission
router.post('/submissions/:id/reject', async (req, res) => {
  try {
    const { id } = req.params
    const { reason } = req.body

    // Get the submission
    const submission = await databases.getDocument(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.MOD_SUBMISSIONS,
      id
    )

    if (!submission) {
      return res.status(404).json(formatResponse(false, null, 'Submission not found'))
    }

    // Update submission status
    await databases.updateDocument(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.MOD_SUBMISSIONS,
      id,
      { 
        status: 'rejected',
        rejection_reason: reason || 'No reason provided'
      }
    )

    // Log admin activity
    await databases.createDocument(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.ADMIN_LOGS,
      ID.unique(),
      {
        admin_id: req.admin.id,
        action: 'reject_submission',
        details: `Rejected submission: ${submission.title}. Reason: ${reason || 'No reason provided'}`,
        ip_address: req.ip || ''
      }
    )

    res.json(formatResponse(true, {
      submission_id: id,
      title: submission.title
    }, 'Submission rejected successfully'))
  } catch (error) {
    console.error('Error rejecting submission:', error)
    res.status(500).json(formatResponse(false, null, 'Failed to reject submission'))
  }
})

export default router