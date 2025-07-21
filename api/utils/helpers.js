import slugify from 'slugify'
import { databases, DATABASE_ID, Query } from '../config/appwrite.js'

// Generate slug from title
export const generateSlug = (title) => {
  return slugify(title, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g
  })
}

// Ensure unique slug
export const ensureUniqueSlug = async (collection, baseSlug, excludeId = null) => {
  let slug = baseSlug
  let counter = 1
  
  while (true) {
    try {
      const queries = [Query.equal('slug', slug)]
      if (excludeId) {
        queries.push(Query.notEqual('$id', excludeId))
      }
      
      const result = await databases.listDocuments(
        DATABASE_ID,
        collection,
        queries
      )
      
      if (result.documents.length === 0) {
        return slug
      }
      
      slug = `${baseSlug}-${counter}`
      counter++
    } catch (error) {
      console.error('Error checking slug uniqueness:', error)
      return `${baseSlug}-${Date.now()}`
    }
  }
}

// Paginate results
export const paginate = (page, limit) => {
  const offset = (page - 1) * limit
  return { offset, limit }
}

// Build query filters for Appwrite
export const buildAppwriteQueries = (filters) => {
  const queries = []
  
  if (filters.category) {
    queries.push(Query.equal('category_id', filters.category))
  }
  
  if (filters.pricing && filters.pricing !== 'all') {
    queries.push(Query.equal('pricing_type', filters.pricing))
  }
  
  if (filters.featured) {
    queries.push(Query.equal('is_featured', true))
  }
  
  if (filters.status) {
    queries.push(Query.equal('status', filters.status))
  }
  
  // Search queries need to be handled differently in Appwrite
  if (filters.search) {
    // Note: Appwrite doesn't support OR queries with different attributes directly
    // You might need to implement search differently or use full-text search
    queries.push(Query.search('title', filters.search))
  }
  
  return queries
}

// Build sort order for Appwrite
export const buildAppwriteSort = (sort) => {
  switch (sort) {
    case 'newest':
      return [Query.orderDesc('$createdAt')]
    case 'oldest':
      return [Query.orderAsc('$createdAt')]
    case 'rating':
      return [Query.orderDesc('rating_average')]
    case 'downloads':
      return [Query.orderDesc('download_count')]
    case 'name':
      return [Query.orderAsc('title')]
    default:
      return [Query.orderDesc('$createdAt')]
  }
}

// Format API response
export const formatResponse = (success, data = null, message = null, meta = null) => {
  const response = { success }
  
  if (data !== null) response.data = data
  if (message !== null) response.message = message
  if (meta !== null) response.meta = meta
  
  return response
}

// Calculate pagination metadata
export const calculatePaginationMeta = (totalCount, page, limit) => {
  const totalPages = Math.ceil(totalCount / limit)
  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1
  
  return {
    currentPage: page,
    totalPages,
    totalCount,
    hasNextPage,
    hasPrevPage,
    limit
  }
}

// Sanitize user input
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input
  
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
}

// Log admin action to Appwrite
export const logAdminAction = async (adminEmail, action, resourceType, resourceId, details = {}, req = null) => {
  try {
    await databases.createDocument(
      DATABASE_ID,
      'admin_logs',
      'unique()',
      {
        admin_email: adminEmail,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        details: JSON.stringify(details),
        ip_address: req?.ip || null,
        user_agent: req?.get('User-Agent') || null
      }
    )
  } catch (error) {
    console.error('Failed to log admin action:', error)
  }
}

// Convert Appwrite document to plain object
export const documentToObject = (document) => {
  if (!document) return null
  
  const obj = { ...document }
  // Convert Appwrite's $id to id for consistency
  if (obj.$id) {
    obj.id = obj.$id
    delete obj.$id
  }
  
  // Convert timestamps
  if (obj.$createdAt) {
    obj.created_at = obj.$createdAt
    delete obj.$createdAt
  }
  
  if (obj.$updatedAt) {
    obj.updated_at = obj.$updatedAt
    delete obj.$updatedAt
  }
  
  return obj
}

// Convert array of Appwrite documents
export const documentsToObjects = (documents) => {
  if (!documents || !Array.isArray(documents)) return []
  return documents.map(documentToObject)
}

// Generate random ID (useful for testing)
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9)
}

// Validate file type
export const validateFileType = (filename, allowedTypes) => {
  const extension = filename.toLowerCase().split('.').pop()
  const mimeTypes = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp',
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed'
  }
  
  const fileMimeType = mimeTypes[extension]
  return allowedTypes.includes(fileMimeType)
}

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Clean empty values from object
export const cleanObject = (obj) => {
  const cleaned = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined && value !== '') {
      cleaned[key] = value
    }
  }
  return cleaned
}

// URL validation utilities
export const validateDownloadUrl = (url) => {
  try {
    const urlObj = new URL(url)
    
    // Check for common file hosting domains
    const allowedDomains = [
      'drive.google.com',
      'docs.google.com',
      'dropbox.com', 
      'dl.dropboxusercontent.com',
      'github.com',
      'raw.githubusercontent.com',
      'mega.nz',
      'mediafire.com',
      'uploadhaven.com',
      'sharemods.com',
      'modhub.us',
      'kingmods.net',
      'fs19mods.com',
      'fs22mods.com',
      'yandex.com',
      'disk.yandex.com'
    ]
    
    const isAllowedDomain = allowedDomains.some(domain => 
      urlObj.hostname.includes(domain)
    )
    
    // Check if URL ends with .zip or contains download-related keywords
    const isZipFile = url.toLowerCase().endsWith('.zip')
    const hasDownloadKeywords = /download|file|attachment|dl\?|dl=/.test(url.toLowerCase())
    
    return {
      isValid: isAllowedDomain || isZipFile || hasDownloadKeywords,
      domain: urlObj.hostname,
      isDirectZip: isZipFile,
      isKnownHost: isAllowedDomain
    }
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid URL format'
    }
  }
}

// Check if image URL is valid
export const validateImageUrl = (url) => {
  try {
    const urlObj = new URL(url)
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp']
    const hasImageExtension = imageExtensions.some(ext => 
      url.toLowerCase().includes(ext)
    )
    
    // Common image hosting services
    const imageHosts = [
      'imgur.com',
      'i.imgur.com', 
      'i.postimg.cc',
      'postimg.cc',
      'drive.google.com',
      'dropbox.com',
      'dl.dropboxusercontent.com',
      'github.com',
      'raw.githubusercontent.com',
      'cdn.discordapp.com',
      'media.discordapp.net'
    ]
    
    const isImageHost = imageHosts.some(host => 
      urlObj.hostname.includes(host)
    )
    
    return {
      isValid: hasImageExtension || isImageHost,
      domain: urlObj.hostname,
      hasImageExtension: hasImageExtension,
      isKnownHost: isImageHost
    }
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid image URL format'
    }
  }
}
