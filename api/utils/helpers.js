// Generate slug from title
export const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[-\s]+/g, '-') // Replace spaces and multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

// Ensure unique slug
export const ensureUniqueSlug = async (supabase, table, baseSlug, excludeId = null) => {
  let slug = baseSlug
  let counter = 1
  
  while (true) {
    let query = supabase
      .from(table)
      .select('id')
      .eq('slug', slug)
    
    if (excludeId) {
      query = query.neq('id', excludeId)
    }
    
    const { data, error } = await query
    
    if (error) {
      throw error
    }
    
    if (data.length === 0) {
      return slug
    }
    
    slug = `${baseSlug}-${counter}`
    counter++
  }
}

// Paginate results
export const paginate = (page, limit) => {
  const offset = (page - 1) * limit
  return { offset, limit }
}

// Build query filters
export const buildQueryFilters = (query, filters) => {
  let modifiedQuery = query
  
  if (filters.category) {
    modifiedQuery = modifiedQuery.eq('category_id', filters.category)
  }
  
  if (filters.search) {
    modifiedQuery = modifiedQuery.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }
  
  if (filters.pricing && filters.pricing !== 'all') {
    modifiedQuery = modifiedQuery.eq('pricing_type', filters.pricing)
  }
  
  if (filters.featured) {
    modifiedQuery = modifiedQuery.eq('is_featured', true)
  }
  
  return modifiedQuery
}

// Build sort order
export const buildSortOrder = (sort) => {
  switch (sort) {
    case 'newest':
      return { column: 'created_at', ascending: false }
    case 'oldest':
      return { column: 'created_at', ascending: true }
    case 'rating':
      return { column: 'rating_average', ascending: false }
    case 'downloads':
      return { column: 'download_count', ascending: false }
    case 'name':
      return { column: 'title', ascending: true }
    default:
      return { column: 'created_at', ascending: false }
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

// Log admin action
export const logAdminAction = async (supabaseAdmin, adminEmail, action, resourceType, resourceId, details = {}, req = null) => {
  try {
    await supabaseAdmin
      .from('admin_logs')
      .insert({
        admin_email: adminEmail,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        details,
        ip_address: req?.ip || null,
        user_agent: req?.get('User-Agent') || null
      })
  } catch (error) {
    console.error('Failed to log admin action:', error)
  }
}
