import express from 'express'
import { Client, Databases, Query, ID } from 'node-appwrite'
import { authenticateToken } from '../middleware/auth.js'
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

// Report types
const REPORT_TYPES = {
  INAPPROPRIATE_CONTENT: 'inappropriate_content',
  COPYRIGHT_VIOLATION: 'copyright_violation',
  MALWARE_VIRUS: 'malware_virus',
  BROKEN_DOWNLOAD: 'broken_download',
  MISLEADING_DESCRIPTION: 'misleading_description',
  SPAM: 'spam',
  OTHER: 'other'
}

// Submit a report for a mod
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { mod_id, report_type, description, additional_info } = req.body

    // Validate input
    if (!mod_id || !report_type || !description) {
      return res.status(400).json(formatResponse(false, null, 'mod_id, report_type, and description are required'))
    }

    if (!Object.values(REPORT_TYPES).includes(report_type)) {
      return res.status(400).json(formatResponse(false, null, 'Invalid report type'))
    }

    // Check if mod exists
    try {
      await databases.getDocument(
        process.env.APPWRITE_DATABASE_ID,
        COLLECTIONS.MODS,
        mod_id
      )
    } catch (error) {
      return res.status(404).json(formatResponse(false, null, 'Mod not found'))
    }

    // Check if user already reported this mod for the same reason
    const existingReports = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.MOD_REPORTS,
      [
        Query.equal('mod_id', mod_id),
        Query.equal('reporter_id', req.user.id),
        Query.equal('report_type', report_type),
        Query.equal('status', 'pending')
      ]
    )

    if (existingReports.documents.length > 0) {
      return res.status(400).json(formatResponse(false, null, 'You have already reported this mod for this reason'))
    }

    // Create report
    const reportData = {
      mod_id,
      reporter_id: req.user.id,
      reporter_email: req.user.email,
      report_type,
      description,
      additional_info: additional_info || '',
      status: 'pending'
    }

    const report = await databases.createDocument(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.MOD_REPORTS,
      ID.unique(),
      reportData
    )

    res.status(201).json(formatResponse(
      true,
      {
        id: report.$id,
        report_type: report.report_type,
        status: report.status,
        created_at: report.$createdAt
      },
      'Report submitted successfully'
    ))
    
  } catch (error) {
    console.error('Error submitting report:', error)
    res.status(500).json(formatResponse(false, null, 'Failed to submit report'))
  }
})

// Get reports for a mod (admin only)
router.get('/mod/:modId', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin (you can implement this check based on your auth system)
    if (!req.user.isAdmin) {
      return res.status(403).json(formatResponse(false, null, 'Admin access required'))
    }

    const { modId } = req.params
    const { status = 'all', page = 1, limit = 10 } = req.query

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const offset = (pageNum - 1) * limitNum

    // Build query
    let queries = [
      Query.equal('mod_id', modId),
      Query.limit(limitNum),
      Query.offset(offset),
      Query.orderDesc('$createdAt')
    ]

    if (status !== 'all') {
      queries.push(Query.equal('status', status))
    }

    const response = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.MOD_REPORTS,
      queries
    )

    const reports = response.documents.map(report => ({
      id: report.$id,
      report_type: report.report_type,
      description: report.description,
      additional_info: report.additional_info,
      reporter_email: report.reporter_email,
      status: report.status,
      created_at: report.$createdAt,
      updated_at: report.$updatedAt
    }))

    res.json(formatResponse(true, {
      reports,
      pagination: {
        current_page: pageNum,
        total: response.total,
        per_page: limitNum,
        total_pages: Math.ceil(response.total / limitNum)
      }
    }, 'Reports retrieved successfully'))
    
  } catch (error) {
    console.error('Error fetching reports:', error)
    res.status(500).json(formatResponse(false, null, 'Failed to fetch reports'))
  }
})

// Update report status (admin only)
router.patch('/:reportId', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json(formatResponse(false, null, 'Admin access required'))
    }

    const { reportId } = req.params
    const { status, admin_notes } = req.body

    if (!['pending', 'reviewed', 'resolved', 'dismissed'].includes(status)) {
      return res.status(400).json(formatResponse(false, null, 'Invalid status'))
    }

    const updateData = {
      status
    }

    if (admin_notes) {
      updateData.admin_notes = admin_notes
    }

    const updatedReport = await databases.updateDocument(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.MOD_REPORTS,
      reportId,
      updateData
    )

    res.json(formatResponse(true, {
      id: updatedReport.$id,
      status: updatedReport.status,
      updated_at: updatedReport.$updatedAt
    }, 'Report status updated successfully'))
    
  } catch (error) {
    console.error('Error updating report:', error)
    res.status(500).json(formatResponse(false, null, 'Failed to update report'))
  }
})

// Get all reports (admin only)
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json(formatResponse(false, null, 'Admin access required'))
    }

    const { status = 'all', report_type = 'all', page = 1, limit = 20 } = req.query

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const offset = (pageNum - 1) * limitNum

    // Build query
    let queries = [
      Query.limit(limitNum),
      Query.offset(offset),
      Query.orderDesc('$createdAt')
    ]

    if (status !== 'all') {
      queries.push(Query.equal('status', status))
    }

    if (report_type !== 'all') {
      queries.push(Query.equal('report_type', report_type))
    }

    const response = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.MOD_REPORTS,
      queries
    )

    const reports = response.documents.map(report => ({
      id: report.$id,
      mod_id: report.mod_id,
      report_type: report.report_type,
      description: report.description,
      reporter_email: report.reporter_email,
      status: report.status,
      created_at: report.$createdAt,
      updated_at: report.$updatedAt
    }))

    res.json(formatResponse(true, {
      reports,
      pagination: {
        current_page: pageNum,
        total: response.total,
        per_page: limitNum,
        total_pages: Math.ceil(response.total / limitNum)
      }
    }, 'Reports retrieved successfully'))
    
  } catch (error) {
    console.error('Error fetching reports:', error)
    res.status(500).json(formatResponse(false, null, 'Failed to fetch reports'))
  }
})

// Get report types
router.get('/types', (req, res) => {
  res.json(formatResponse(true, {
    report_types: Object.entries(REPORT_TYPES).map(([key, value]) => ({
      key,
      value,
      label: key.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ')
    }))
  }, 'Report types retrieved successfully'))
})

export default router
