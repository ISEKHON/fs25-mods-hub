import express from 'express'
import { databases, Query } from '../config/appwrite.js'
import { COLLECTIONS } from '../config/collections.js'

const router = express.Router()

// Test endpoint - no auth required
router.get('/test-submissions', async (req, res) => {
  try {
    console.log('🔍 Testing submissions endpoint...')
    
    const response = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.MOD_SUBMISSIONS,
      [
        Query.equal('status', 'pending'),
        Query.orderDesc('$createdAt'),
        Query.limit(10)
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

    console.log('✅ Test submissions data:', JSON.stringify(submissions, null, 2))

    res.json({
      success: true,
      data: {
        submissions,
        total: response.total
      },
      message: 'Test submissions retrieved'
    })
  } catch (error) {
    console.error('❌ Test submissions error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get test submissions',
      error: error.message
    })
  }
})

export default router
