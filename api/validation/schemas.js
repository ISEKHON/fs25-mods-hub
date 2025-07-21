import Joi from 'joi'

// Mod submission validation schema
export const modSubmissionSchema = Joi.object({
  title: Joi.string().trim().min(3).max(255).required(),
  description: Joi.string().trim().min(20).max(5000).required(),
  category_id: Joi.string().trim().required(),
  author_name: Joi.string().trim().min(2).max(255).required(),
  version: Joi.string().trim().min(1).max(50).required(),
  download_url: Joi.string().uri().custom((value, helpers) => {
    // Validate that URL ends with .zip or contains download keywords
    if (!value.toLowerCase().endsWith('.zip') && !value.includes('download') && !value.includes('file')) {
      return helpers.error('any.invalid');
    }
    return value;
  }).required().messages({
    'any.invalid': 'Download URL must point to a ZIP file or valid download link'
  }),
  file_size: Joi.number().integer().positive().optional(), // Optional file size in bytes
  screenshots: Joi.array().items(
    Joi.string().uri().custom((value, helpers) => {
      // Validate each screenshot URL
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
      const hasImageExtension = imageExtensions.some(ext => 
        value.toLowerCase().includes(ext)
      )
      const isImageHost = ['imgur.com', 'i.postimg.cc', 'drive.google.com', 'dropbox.com'].some(host =>
        value.includes(host)
      )
      
      if (!hasImageExtension && !isImageHost) {
        return helpers.error('any.invalid');
      }
      return value;
    }).messages({
      'any.invalid': 'Screenshot URL must be a valid image link or from supported image hosting service'
    })
  ).max(10).optional(),
  video_link: Joi.string().uri().optional().allow(''),
  tags: Joi.array().items(Joi.string().trim().max(50)).max(20).optional(),
  compatibility: Joi.array().items(Joi.string().valid(
    'Multiplayer Compatible',
    'Precision Farming Compatible', 
    'Seasons Mod Compatible',
    'GPS Compatible',
    'Console Friendly',
    'Mod Conflicts Possible'
  )).optional(),
  platform: Joi.string().valid('PC').default('PC').optional(), // PC-only mod site
  pricing_type: Joi.string().valid('free', 'paid').default('free').optional(),
  price: Joi.number().positive().precision(2).optional(),
  currency: Joi.string().valid('USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD').default('USD').optional(),
  original_price: Joi.number().positive().precision(2).optional(),
  discount_percentage: Joi.number().integer().min(0).max(100).optional(),
  sale_end_date: Joi.date().iso().optional(),
  minimum_requirements: Joi.string().trim().max(1000).optional().allow(''),
  recommended_requirements: Joi.string().trim().max(1000).optional().allow(''),
  requirements: Joi.string().trim().max(1000).optional().allow(''),
  installation_notes: Joi.string().trim().max(2000).optional().allow(''),
  changelog: Joi.string().trim().max(2000).optional().allow(''),
  submission_notes: Joi.string().trim().max(1000).optional().allow(''), // Notes for admin
  contact_email: Joi.string().email().required(),
  contact_discord: Joi.string().trim().max(100).optional().allow(''),
  is_original_work: Joi.boolean().valid(true).required(),
  has_permission: Joi.boolean().valid(true).required(),
  agree_to_terms: Joi.boolean().valid(true).required(),
  submitted_by: Joi.string().required()
})

// Review submission validation schema
export const reviewSchema = Joi.object({
  mod_id: Joi.string().required(),
  reviewer_name: Joi.string().trim().min(2).max(255).required(),
  reviewer_email: Joi.string().email().optional(),
  rating: Joi.number().integer().min(1).max(5).required(),
  title: Joi.string().trim().min(3).max(255).optional().allow(''),
  comment: Joi.string().trim().min(10).max(2000).optional().allow('')
})

// Mod update validation schema (for approved mods)
export const modUpdateSchema = Joi.object({
  title: Joi.string().trim().min(3).max(255).optional(),
  description: Joi.string().trim().min(20).max(5000).optional(),
  category_id: Joi.string().optional(),
  version: Joi.string().trim().min(1).max(50).optional(),
  download_link: Joi.string().uri().optional(),
  file_size: Joi.string().trim().max(20).optional(),
  main_image: Joi.string().uri().optional(),
  video_link: Joi.string().uri().optional().allow(''),
  pricing_type: Joi.string().valid('free', 'paid').optional(),
  price: Joi.number().positive().precision(2).optional(),
  currency: Joi.string().length(3).uppercase().optional(),
  original_price: Joi.number().positive().precision(2).optional(),
  discount_percentage: Joi.number().integer().min(0).max(100).optional(),
  sale_end_date: Joi.date().iso().optional(),
  minimum_requirements: Joi.string().trim().max(1000).optional(),
  recommended_requirements: Joi.string().trim().max(1000).optional(),
  changelog: Joi.string().trim().max(2000).optional(),
  installation_notes: Joi.string().trim().max(2000).optional(),
  known_issues: Joi.string().trim().max(1000).optional(),
  credits: Joi.string().trim().max(1000).optional(),
  is_featured: Joi.boolean().optional()
})

// Query parameters validation
export const queryParamsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  category: Joi.string().trim().optional(),
  search: Joi.string().trim().max(255).optional(),
  sort: Joi.string().valid('newest', 'oldest', 'rating', 'downloads', 'name').default('newest'),
  pricing: Joi.string().valid('free', 'paid', 'all').default('all'),
  featured: Joi.boolean().optional()
})

// Admin action validation
export const adminActionSchema = Joi.object({
  action: Joi.string().valid('approve', 'reject', 'archive').required(),
  admin_notes: Joi.string().trim().max(1000).optional(),
  rejection_reason: Joi.string().trim().max(500).when('action', {
    is: 'reject',
    then: Joi.required(),
    otherwise: Joi.optional()
  })
})

// Category validation schema
export const categorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  slug: Joi.string().trim().min(2).max(100).required(),
  description: Joi.string().trim().max(500).optional().allow(''),
  icon: Joi.string().trim().max(50).optional().allow('')
})

// Developer validation schema
export const developerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(255).required(),
  email: Joi.string().email().required(),
  discord_username: Joi.string().trim().max(100).optional().allow(''),
  website: Joi.string().uri().optional().allow(''),
  bio: Joi.string().trim().max(1000).optional().allow(''),
  avatar_url: Joi.string().uri().optional().allow(''),
  is_verified: Joi.boolean().default(false)
})

// Authentication validation schemas
export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
})

export const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(255).required(),
  username: Joi.string().trim().min(3).max(30).alphanum().optional(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]')).required()
    .messages({
      'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'
    }),
  rememberMe: Joi.boolean().optional()
})

export const profileUpdateSchema = Joi.object({
  display_name: Joi.string().trim().min(2).max(255).optional(),
  bio: Joi.string().trim().max(500).allow('').optional(),
  location: Joi.string().trim().max(100).allow('').optional(),
  website: Joi.string().uri().allow('').optional(),
  avatar_url: Joi.string().uri().allow('').optional(),
  social_links: Joi.object({
    discord: Joi.string().trim().max(100).allow('').optional(),
    youtube: Joi.string().uri().allow('').optional(),
    twitch: Joi.string().uri().allow('').optional(),
    twitter: Joi.string().trim().max(100).allow('').optional()
  }).optional(),
  preferences: Joi.object({
    email_notifications: Joi.boolean().optional(),
    mod_updates: Joi.boolean().optional(),
    review_notifications: Joi.boolean().optional(),
    newsletter: Joi.boolean().optional()
  }).optional()
})

export const passwordChangeSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]')).required()
    .messages({
      'string.pattern.base': 'New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'
    })
})

// Validation functions
export const validateLogin = (data) => {
  return loginSchema.validate(data)
}

export const validateRegister = (data) => {
  return registerSchema.validate(data)
}

export const validateProfileUpdate = (data) => {
  return profileUpdateSchema.validate(data)
}

export const validatePasswordChange = (data) => {
  return passwordChangeSchema.validate(data)
}

export const validateModSubmission = (data) => {
  return modSubmissionSchema.validate(data)
}

export const validateReview = (data) => {
  return reviewSchema.validate(data)
}

export const validateModUpdate = (data) => {
  return modUpdateSchema.validate(data)
}

export const validateQueryParams = (data) => {
  return queryParamsSchema.validate(data)
}

export const validateAdminAction = (data) => {
  return adminActionSchema.validate(data)
}

export const validateCategory = (data) => {
  return categorySchema.validate(data)
}

export const validateDeveloper = (data) => {
  return developerSchema.validate(data)
}
