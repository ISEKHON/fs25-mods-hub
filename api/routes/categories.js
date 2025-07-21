import express from 'express'
import { databases, Query } from '../config/appwrite.js'
import { COLLECTIONS } from '../config/collections.js'
import { formatResponse } from '../utils/helpers.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Get all categories
router.get('/', async (req, res) => {
  try {
    const { include_count = 'false' } = req.query

    const response = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.MOD_CATEGORIES,
      [
        Query.equal('is_active', true),
        Query.orderAsc('sort_order'),
        Query.orderAsc('name')
      ]
    )

    const categories = []
    
    for (const category of response.documents) {
      const categoryData = {
        id: category.$id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        icon: category.icon,
        color: category.color,
        parent_id: category.parent_id,
        sort_order: category.sort_order
      }

      if (include_count === 'true') {
        // Dynamically count approved mods in this category
        try {
          const modCountResponse = await databases.listDocuments(
            process.env.APPWRITE_DATABASE_ID,
            COLLECTIONS.MODS,
            [
              Query.equal('category_id', category.$id),
              Query.equal('is_approved', true),
              Query.equal('is_active', true),
              Query.limit(1)
            ]
          )
          categoryData.mod_count = modCountResponse.total
        } catch (error) {
          console.log(`Could not count mods for category ${category.name}:`, error.message)
          categoryData.mod_count = category.mod_count || 0
        }
      }

      categories.push(categoryData)
    }

    // Group by parent categories if requested
    const { grouped = 'false' } = req.query
    if (grouped === 'true') {
      const parentCategories = categories.filter(cat => !cat.parent_id)
      const childCategories = categories.filter(cat => cat.parent_id)

      const groupedCategories = parentCategories.map(parent => ({
        ...parent,
        subcategories: childCategories.filter(child => child.parent_id === parent.id)
      }))

      return res.json(formatResponse(true, groupedCategories, 'Categories retrieved successfully'))
    }

    res.json(formatResponse(true, categories, 'Categories retrieved successfully'))
  } catch (error) {
    console.error('Error fetching categories:', error)
    res.status(500).json(formatResponse(false, null, 'Failed to fetch categories'))
  }
})

// Get single category by slug or ID
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params

    let category
    try {
      // Try to get by ID first
      category = await databases.getDocument(
        process.env.APPWRITE_DATABASE_ID,
        COLLECTIONS.MOD_CATEGORIES,
        identifier
      )
    } catch (error) {
      // If not found by ID, try by slug
      const response = await databases.listDocuments(
        process.env.APPWRITE_DATABASE_ID,
        COLLECTIONS.MOD_CATEGORIES,
        [
          Query.equal('slug', identifier),
          Query.equal('is_active', true)
        ]
      )
      
      if (response.documents.length === 0) {
        return res.status(404).json(formatResponse(false, null, 'Category not found'))
      }
      
      category = response.documents[0]
    }

    const categoryData = {
      id: category.$id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      icon: category.icon,
      color: category.color,
      parent_id: category.parent_id,
      sort_order: category.sort_order,
      mod_count: category.mod_count || 0,
      created_at: category.$createdAt,
      updated_at: category.$updatedAt
    }

    res.json(formatResponse(true, categoryData, 'Category retrieved successfully'))
  } catch (error) {
    console.error('Error fetching category:', error)
    res.status(500).json(formatResponse(false, null, 'Failed to fetch category'))
  }
})

// Create new category (Admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    // TODO: Add admin role check
    const { name, slug, description, icon, color, parent_id, sort_order } = req.body

    if (!name || !slug) {
      return res.status(400).json(formatResponse(false, null, 'Name and slug are required'))
    }

    // Check if slug already exists
    const existing = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.MOD_CATEGORIES,
      [Query.equal('slug', slug)]
    )

    if (existing.documents.length > 0) {
      return res.status(400).json(formatResponse(false, null, 'Category slug already exists'))
    }

    const category = await databases.createDocument(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.MOD_CATEGORIES,
      'unique()',
      {
        name,
        slug,
        description: description || '',
        icon: icon || '',
        color: color || '#6B7280',
        parent_id: parent_id || null,
        sort_order: sort_order || 0,
        mod_count: 0,
        is_active: true
      }
    )

    res.status(201).json(formatResponse(true, {
      id: category.$id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      icon: category.icon,
      color: category.color,
      parent_id: category.parent_id,
      sort_order: category.sort_order
    }, 'Category created successfully'))
  } catch (error) {
    console.error('Error creating category:', error)
    res.status(500).json(formatResponse(false, null, 'Failed to create category'))
  }
})

export default router
