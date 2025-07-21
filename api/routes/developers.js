import express from 'express'
import { Client, Databases, Query } from 'node-appwrite'
import { COLLECTIONS } from '../config/collections.js'
import { formatResponse } from '../utils/helpers.js'
import { getUserAvatar } from '../utils/avatars.js'

const router = express.Router()

// Initialize Appwrite
const client = new Client()
const databases = new Databases(client)

client
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY)

// Get all developers (users who have uploaded mods)
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      sort = 'mods', 
      order = 'desc', 
      page = 1, 
      limit = 20,
      featured
    } = req.query

    // First get all approved mods to find unique uploaders
    const modsQuery = [
      Query.equal('is_approved', true),
      Query.equal('is_active', true),
      Query.limit(1000) // Get more mods to find all developers
    ]

    const modsResponse = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.MODS,
      modsQuery
    )

    // Get all developer profiles from DEVELOPERS collection
    let developerProfiles = {}
    try {
      const developersResponse = await databases.listDocuments(
        process.env.APPWRITE_DATABASE_ID,
        COLLECTIONS.DEVELOPERS,
        [Query.limit(1000)]
      )
      
      developersResponse.documents.forEach(dev => {
        developerProfiles[dev.user_id] = dev
      })
    } catch (error) {
      console.log('No developer profiles found, using calculated data only')
    }

    // Group mods by uploader_id and calculate stats
    const developerStats = {}
    
    modsResponse.documents.forEach(mod => {
      const uploaderId = mod.uploader_id
      if (!developerStats[uploaderId]) {
        developerStats[uploaderId] = {
          uploader_id: uploaderId,
          uploader_name: mod.uploader_name || 'Unknown Developer',
          mods_count: 0,
          total_downloads: 0,
          total_rating: 0,
          rating_count: 0,
          first_mod_date: mod.$createdAt,
          latest_mod_date: mod.$createdAt,
          is_featured: false,
          categories: new Set()
        }
      }

      const stats = developerStats[uploaderId]
      stats.mods_count++
      stats.total_downloads += mod.download_count || 0
      
      if (mod.rating && mod.rating > 0) {
        stats.total_rating += mod.rating
        stats.rating_count++
      }
      
      if (mod.is_featured) {
        stats.is_featured = true
      }
      
      stats.categories.add(mod.category_name || 'Miscellaneous')
      
      if (new Date(mod.$createdAt) < new Date(stats.first_mod_date)) {
        stats.first_mod_date = mod.$createdAt
      }
      if (new Date(mod.$createdAt) > new Date(stats.latest_mod_date)) {
        stats.latest_mod_date = mod.$createdAt
      }
    })

    // Convert to array and calculate additional metrics
    let developers = Object.values(developerStats).map(dev => {
      const yearsActive = Math.max(1, Math.ceil(
        (new Date() - new Date(dev.first_mod_date)) / (365 * 24 * 60 * 60 * 1000)
      ))
      
      // Get developer profile if exists
      const profile = developerProfiles[dev.uploader_id]
      
      return {
        id: dev.uploader_id,
        name: profile?.display_name || dev.uploader_name,
        role: profile?.role || (dev.mods_count >= 10 ? 'Senior Mod Developer' : 
              dev.mods_count >= 5 ? 'Mod Developer' : 'Mod Creator'),
        avatar: profile?.avatar_url || getUserAvatar(dev.uploader_name),
        bio: profile?.bio || `Passionate modder specializing in ${Array.from(dev.categories).slice(0, 3).join(', ')}. Creating quality mods for the FS25 community.`,
        specialties: profile?.specialties || Array.from(dev.categories),
        contact: {
          email: profile?.email || '',
          telegram: profile?.telegram || '',
          discord: profile?.discord || ''
        },
        stats: {
          modsPublished: dev.mods_count,
          totalDownloads: dev.total_downloads.toLocaleString(),
          averageRating: dev.rating_count > 0 ? (dev.total_rating / dev.rating_count).toFixed(1) : '0.0',
          yearsActive: yearsActive
        },
        featured: profile?.is_featured || dev.is_featured,
        joinedDate: dev.first_mod_date,
        lastActivity: dev.latest_mod_date
      }
    })

    // Add developers from DEVELOPERS collection who don't have mods yet
    const usedDeveloperIds = new Set(Object.keys(developerStats))
    Object.values(developerProfiles).forEach(profile => {
      if (!usedDeveloperIds.has(profile.user_id)) {
        developers.push({
          id: profile.user_id,
          name: profile.display_name || profile.name,
          role: profile.role || 'Mod Developer',
          avatar: profile.avatar_url || getUserAvatar(profile.display_name || profile.name),
          bio: profile.bio || 'Talented developer creating quality mods for the FS25 community.',
          specialties: profile.specialties || ['Modding'],
          contact: {
            email: profile.email || '',
            telegram: profile.telegram || '',
            discord: profile.discord || ''
          },
          stats: {
            modsPublished: 0,
            totalDownloads: '0',
            averageRating: '0.0',
            yearsActive: 1
          },
          featured: profile.is_featured || false,
          joinedDate: profile.$createdAt || new Date().toISOString(),
          lastActivity: profile.$updatedAt || profile.$createdAt || new Date().toISOString()
        })
      }
    })

    // Filter by search if provided
    if (search) {
      const searchTerm = search.toLowerCase()
      developers = developers.filter(dev => 
        dev.name.toLowerCase().includes(searchTerm) ||
        dev.specialties.some(specialty => specialty.toLowerCase().includes(searchTerm)) ||
        dev.bio.toLowerCase().includes(searchTerm)
      )
    }

    // Filter by featured if requested
    if (featured === 'true') {
      developers = developers.filter(dev => dev.featured)
    }

    // Sort developers
    developers.sort((a, b) => {
      let aVal, bVal
      
      switch (sort) {
        case 'name':
          aVal = a.name.toLowerCase()
          bVal = b.name.toLowerCase()
          break
        case 'mods':
          aVal = a.stats.modsPublished
          bVal = b.stats.modsPublished
          break
        case 'downloads':
          aVal = parseInt(a.stats.totalDownloads.replace(/,/g, ''))
          bVal = parseInt(b.stats.totalDownloads.replace(/,/g, ''))
          break
        case 'rating':
          aVal = parseFloat(a.stats.averageRating)
          bVal = parseFloat(b.stats.averageRating)
          break
        case 'joined':
          aVal = new Date(a.joinedDate)
          bVal = new Date(b.joinedDate)
          break
        default: // featured first, then by mods count
          if (a.featured !== b.featured) {
            return b.featured - a.featured
          }
          aVal = a.stats.modsPublished
          bVal = b.stats.modsPublished
      }

      if (order === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    // Paginate results
    const startIndex = (parseInt(page) - 1) * parseInt(limit)
    const endIndex = startIndex + parseInt(limit)
    const paginatedDevelopers = developers.slice(startIndex, endIndex)

    res.json(formatResponse(true, {
      developers: paginatedDevelopers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(developers.length / parseInt(limit)),
        totalDevelopers: developers.length,
        hasNextPage: endIndex < developers.length,
        hasPrevPage: parseInt(page) > 1
      }
    }, 'Developers retrieved successfully'))
    
  } catch (error) {
    console.error('Error fetching developers:', error)
    res.status(500).json(formatResponse(false, null, 'Failed to fetch developers'))
  }
})

// Get developer by ID with detailed stats
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    // Get developer profile if exists
    let profile = null
    try {
      const profileResponse = await databases.listDocuments(
        process.env.APPWRITE_DATABASE_ID,
        COLLECTIONS.DEVELOPERS,
        [Query.equal('user_id', id)]
      )
      profile = profileResponse.documents[0] || null
    } catch (error) {
      console.log('No developer profile found for:', id)
    }

    // Get all mods by this developer
    const modsResponse = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.MODS,
      [
        Query.equal('uploader_id', id),
        Query.equal('is_approved', true),
        Query.equal('is_active', true),
        Query.orderDesc('$createdAt')
      ]
    )

    if (modsResponse.documents.length === 0) {
      return res.status(404).json(formatResponse(false, null, 'Developer not found'))
    }

    const mods = modsResponse.documents
    const firstMod = mods[mods.length - 1]
    const latestMod = mods[0]

    // Calculate detailed stats
    const totalDownloads = mods.reduce((sum, mod) => sum + (mod.download_count || 0), 0)
    const ratingsSum = mods.reduce((sum, mod) => sum + (mod.rating || 0), 0)
    const ratingsCount = mods.filter(mod => mod.rating && mod.rating > 0).length
    const categories = [...new Set(mods.map(mod => mod.category_name || 'Miscellaneous'))]
    const isFeatured = mods.some(mod => mod.is_featured)

    const developer = {
      id: id,
      name: profile?.display_name || firstMod.uploader_name || 'Unknown Developer',
      role: profile?.role || (mods.length >= 10 ? 'Senior Mod Developer' : 
            mods.length >= 5 ? 'Mod Developer' : 'Mod Creator'),
      avatar: profile?.avatar_url || getUserAvatar(firstMod.uploader_name),
      bio: profile?.bio || `Passionate modder specializing in ${categories.slice(0, 3).join(', ')}. Creating quality mods for the FS25 community since ${new Date(firstMod.$createdAt).getFullYear()}.`,
      specialties: profile?.specialties || categories,
      contact: {
        email: profile?.email || '',
        telegram: profile?.telegram || '',
        discord: profile?.discord || ''
      },
      stats: {
        modsPublished: mods.length,
        totalDownloads: totalDownloads.toLocaleString(),
        averageRating: ratingsCount > 0 ? (ratingsSum / ratingsCount).toFixed(1) : '0.0',
        yearsActive: Math.max(1, Math.ceil(
          (new Date() - new Date(firstMod.$createdAt)) / (365 * 24 * 60 * 60 * 1000)
        ))
      },
      featured: profile?.is_featured || isFeatured,
      joinedDate: firstMod.$createdAt,
      lastActivity: latestMod.$createdAt,
      recentMods: mods.slice(0, 5).map(mod => ({
        id: mod.$id,
        title: mod.title,
        category: mod.category_name,
        downloads: mod.download_count || 0,
        rating: mod.rating || 0,
        createdAt: mod.$createdAt
      }))
    }

    res.json(formatResponse(true, developer, 'Developer details retrieved successfully'))

  } catch (error) {
    console.error('Error fetching developer details:', error)
    res.status(500).json(formatResponse(false, null, 'Failed to fetch developer details'))
  }
})

// Create or update developer profile
router.post('/profile', async (req, res) => {
  try {
    const {
      user_id,
      display_name,
      role,
      avatar_url,
      bio,
      email,
      telegram,
      discord,
      specialties
    } = req.body

    if (!user_id || !display_name) {
      return res.status(400).json(formatResponse(false, null, 'user_id and display_name are required'))
    }

    // Check if profile already exists
    const existingProfile = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.DEVELOPERS,
      [Query.equal('user_id', user_id)]
    )

    const profileData = {
      user_id,
      display_name,
      role: role || 'Mod Creator',
      avatar_url: avatar_url || '',
      bio: bio || '',
      email: email || '',
      telegram: telegram || '',
      discord: discord || '',
      specialties: specialties || [],
      is_featured: false,
      is_verified: false
    }

    let profile
    if (existingProfile.documents.length > 0) {
      // Update existing profile
      profile = await databases.updateDocument(
        process.env.APPWRITE_DATABASE_ID,
        COLLECTIONS.DEVELOPERS,
        existingProfile.documents[0].$id,
        profileData
      )
      console.log('Updated developer profile for:', user_id)
    } else {
      // Create new profile
      profile = await databases.createDocument(
        process.env.APPWRITE_DATABASE_ID,
        COLLECTIONS.DEVELOPERS,
        'unique()',
        profileData
      )
      console.log('Created developer profile for:', user_id)
    }

    res.json(formatResponse(true, profile, 'Developer profile saved successfully'))

  } catch (error) {
    console.error('Error saving developer profile:', error)
    res.status(500).json(formatResponse(false, null, 'Failed to save developer profile'))
  }
})

export default router