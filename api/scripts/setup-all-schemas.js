// Setup schemas for all collections
import { databases } from '../config/appwrite.js'
import { COLLECTIONS } from '../config/collections.js'
import dotenv from 'dotenv'

dotenv.config()

// Collection schemas based on COLLECTIONS_SCHEMA.md
const SCHEMAS = {
  [COLLECTIONS.USER_PROFILES]: {
    name: 'user_profiles',
    attributes: [
      { key: 'user_id', type: 'string', size: 100, required: true },
      { key: 'username', type: 'string', size: 50, required: true },
      { key: 'display_name', type: 'string', size: 100, required: false },
      { key: 'email', type: 'string', size: 255, required: true },
      { key: 'avatar_url', type: 'string', size: 500, required: false },
      { key: 'bio', type: 'string', size: 1000, required: false },
      { key: 'location', type: 'string', size: 100, required: false },
      { key: 'website', type: 'string', size: 255, required: false },
      { key: 'is_verified', type: 'boolean', required: false, default: false },
      { key: 'is_active', type: 'boolean', required: false, default: true },
      { key: 'last_login', type: 'datetime', required: false },
      { key: 'join_date', type: 'datetime', required: true }
    ],
    indexes: [
      { key: 'user_id_unique', attributes: ['user_id'], type: 'unique' },
      { key: 'username_unique', attributes: ['username'], type: 'unique' },
      { key: 'email_unique', attributes: ['email'], type: 'unique' },
      { key: 'is_active_idx', attributes: ['is_active'], type: 'key' }
    ]
  },

  [COLLECTIONS.USER_SESSIONS]: {
    name: 'user_sessions',
    attributes: [
      { key: 'user_id', type: 'string', size: 100, required: true },
      { key: 'session_token', type: 'string', size: 255, required: true },
      { key: 'ip_address', type: 'string', size: 45, required: false },
      { key: 'user_agent', type: 'string', size: 500, required: false },
      { key: 'expires_at', type: 'datetime', required: true },
      { key: 'is_active', type: 'boolean', required: false, default: true }
    ],
    indexes: [
      { key: 'session_token_unique', attributes: ['session_token'], type: 'unique' },
      { key: 'user_id_idx', attributes: ['user_id'], type: 'key' },
      { key: 'expires_at_idx', attributes: ['expires_at'], type: 'key' }
    ]
  },

  [COLLECTIONS.USER_ACTIVITIES]: {
    name: 'user_activities',
    attributes: [
      { key: 'user_id', type: 'string', size: 100, required: true },
      { key: 'activity_type', type: 'string', size: 50, required: true },
      { key: 'activity_data', type: 'string', size: 2000, required: false },
      { key: 'ip_address', type: 'string', size: 45, required: false },
      { key: 'user_agent', type: 'string', size: 500, required: false }
    ],
    indexes: [
      { key: 'user_id_idx', attributes: ['user_id'], type: 'key' },
      { key: 'activity_type_idx', attributes: ['activity_type'], type: 'key' },
      { key: 'created_at_idx', attributes: ['$createdAt'], type: 'key' }
    ]
  },

  [COLLECTIONS.MODS]: {
    name: 'mods',
    attributes: [
      { key: 'title', type: 'string', size: 200, required: true },
      { key: 'slug', type: 'string', size: 200, required: true },
      { key: 'description', type: 'string', size: 2000, required: false },
      { key: 'category_id', type: 'string', size: 100, required: true },
      { key: 'developer_id', type: 'string', size: 100, required: false },
      { key: 'author_name', type: 'string', size: 100, required: true },
      { key: 'version', type: 'string', size: 20, required: false },
      { key: 'file_size', type: 'integer', required: false },
      { key: 'download_url', type: 'string', size: 500, required: true },
      { key: 'image_urls', type: 'string', size: 2000, required: false },
      { key: 'tags', type: 'string', size: 500, required: false },
      { key: 'download_count', type: 'integer', required: false, default: 0 },
      { key: 'rating_average', type: 'float', required: false, default: 0 },
      { key: 'rating_count', type: 'integer', required: false, default: 0 },
      { key: 'is_featured', type: 'boolean', required: false, default: false },
      { key: 'is_approved', type: 'boolean', required: false, default: false },
      { key: 'is_active', type: 'boolean', required: false, default: true },
      { key: 'submitted_by', type: 'string', size: 100, required: true },
      { key: 'approved_by', type: 'string', size: 100, required: false },
      { key: 'approved_at', type: 'datetime', required: false }
    ],
    indexes: [
      { key: 'slug_unique', attributes: ['slug'], type: 'unique' },
      { key: 'category_id_idx', attributes: ['category_id'], type: 'key' },
      { key: 'developer_id_idx', attributes: ['developer_id'], type: 'key' },
      { key: 'is_approved_idx', attributes: ['is_approved'], type: 'key' },
      { key: 'is_featured_idx', attributes: ['is_featured'], type: 'key' },
      { key: 'download_count_idx', attributes: ['download_count'], type: 'key' }
    ]
  },

  [COLLECTIONS.MOD_REVIEWS]: {
    name: 'mod_reviews',
    attributes: [
      { key: 'mod_id', type: 'string', size: 100, required: true },
      { key: 'user_id', type: 'string', size: 100, required: true },
      { key: 'rating', type: 'integer', required: true },
      { key: 'review_text', type: 'string', size: 2000, required: false },
      { key: 'is_approved', type: 'boolean', required: false, default: false },
      { key: 'approved_by', type: 'string', size: 100, required: false }
    ],
    indexes: [
      { key: 'mod_user_unique', attributes: ['mod_id', 'user_id'], type: 'unique' },
      { key: 'mod_id_idx', attributes: ['mod_id'], type: 'key' },
      { key: 'user_id_idx', attributes: ['user_id'], type: 'key' },
      { key: 'rating_idx', attributes: ['rating'], type: 'key' }
    ]
  },

  [COLLECTIONS.MOD_DOWNLOADS]: {
    name: 'mod_downloads',
    attributes: [
      { key: 'mod_id', type: 'string', size: 100, required: true },
      { key: 'user_id', type: 'string', size: 100, required: false },
      { key: 'ip_address', type: 'string', size: 45, required: false },
      { key: 'user_agent', type: 'string', size: 500, required: false },
      { key: 'download_date', type: 'datetime', required: true }
    ],
    indexes: [
      { key: 'mod_id_idx', attributes: ['mod_id'], type: 'key' },
      { key: 'user_id_idx', attributes: ['user_id'], type: 'key' },
      { key: 'download_date_idx', attributes: ['download_date'], type: 'key' }
    ]
  },

  [COLLECTIONS.DEVELOPERS]: {
    name: 'developers',
    attributes: [
      { key: 'name', type: 'string', size: 100, required: true },
      { key: 'slug', type: 'string', size: 100, required: true },
      { key: 'description', type: 'string', size: 1000, required: false },
      { key: 'website', type: 'string', size: 255, required: false },
      { key: 'logo_url', type: 'string', size: 500, required: false },
      { key: 'mod_count', type: 'integer', required: false, default: 0 },
      { key: 'is_verified', type: 'boolean', required: false, default: false },
      { key: 'is_active', type: 'boolean', required: false, default: true }
    ],
    indexes: [
      { key: 'slug_unique', attributes: ['slug'], type: 'unique' },
      { key: 'name_idx', attributes: ['name'], type: 'key' },
      { key: 'is_active_idx', attributes: ['is_active'], type: 'key' }
    ]
  },

  [COLLECTIONS.MOD_SUBMISSIONS]: {
    name: 'mod_submissions',
    attributes: [
      { key: 'title', type: 'string', size: 200, required: true },
      { key: 'description', type: 'string', size: 2000, required: false },
      { key: 'category_id', type: 'string', size: 100, required: true },
      { key: 'author_name', type: 'string', size: 100, required: true },
      { key: 'version', type: 'string', size: 20, required: false },
      { key: 'download_url', type: 'string', size: 500, required: true },
      { key: 'image_urls', type: 'string', size: 2000, required: false },
      { key: 'tags', type: 'string', size: 500, required: false },
      { key: 'submitted_by', type: 'string', size: 100, required: true },
      { key: 'status', type: 'string', size: 20, required: false, default: 'pending' },
      { key: 'admin_notes', type: 'string', size: 1000, required: false },
      { key: 'reviewed_by', type: 'string', size: 100, required: false },
      { key: 'reviewed_at', type: 'datetime', required: false }
    ],
    indexes: [
      { key: 'category_id_idx', attributes: ['category_id'], type: 'key' },
      { key: 'submitted_by_idx', attributes: ['submitted_by'], type: 'key' },
      { key: 'status_idx', attributes: ['status'], type: 'key' }
    ]
  },

  [COLLECTIONS.USER_FAVORITES]: {
    name: 'user_favorites',
    attributes: [
      { key: 'user_id', type: 'string', size: 100, required: true },
      { key: 'mod_id', type: 'string', size: 100, required: true }
    ],
    indexes: [
      { key: 'user_mod_unique', attributes: ['user_id', 'mod_id'], type: 'unique' },
      { key: 'user_id_idx', attributes: ['user_id'], type: 'key' },
      { key: 'mod_id_idx', attributes: ['mod_id'], type: 'key' }
    ]
  },

  [COLLECTIONS.NOTIFICATIONS]: {
    name: 'notifications',
    attributes: [
      { key: 'user_id', type: 'string', size: 100, required: true },
      { key: 'type', type: 'string', size: 50, required: true },
      { key: 'title', type: 'string', size: 200, required: true },
      { key: 'message', type: 'string', size: 1000, required: false },
      { key: 'data', type: 'string', size: 2000, required: false },
      { key: 'is_read', type: 'boolean', required: false, default: false },
      { key: 'read_at', type: 'datetime', required: false }
    ],
    indexes: [
      { key: 'user_id_idx', attributes: ['user_id'], type: 'key' },
      { key: 'type_idx', attributes: ['type'], type: 'key' },
      { key: 'is_read_idx', attributes: ['is_read'], type: 'key' }
    ]
  },

  [COLLECTIONS.REPORTS]: {
    name: 'reports',
    attributes: [
      { key: 'reported_item_type', type: 'string', size: 50, required: true },
      { key: 'reported_item_id', type: 'string', size: 100, required: true },
      { key: 'reporter_id', type: 'string', size: 100, required: true },
      { key: 'reason', type: 'string', size: 100, required: true },
      { key: 'description', type: 'string', size: 1000, required: false },
      { key: 'status', type: 'string', size: 20, required: false, default: 'pending' },
      { key: 'admin_notes', type: 'string', size: 1000, required: false },
      { key: 'resolved_by', type: 'string', size: 100, required: false },
      { key: 'resolved_at', type: 'datetime', required: false }
    ],
    indexes: [
      { key: 'reported_item_idx', attributes: ['reported_item_type', 'reported_item_id'], type: 'key' },
      { key: 'reporter_id_idx', attributes: ['reporter_id'], type: 'key' },
      { key: 'status_idx', attributes: ['status'], type: 'key' }
    ]
  }
}

async function setupAllSchemas() {
  try {
    console.log('🔧 Setting up schemas for all collections...\n')
    
    for (const [collectionId, schema] of Object.entries(SCHEMAS)) {
      console.log(`📋 Setting up ${schema.name.toUpperCase()}...`)
      
      try {
        // Create attributes
        for (const attr of schema.attributes) {
          try {
            let result
            
            if (attr.type === 'string') {
              result = await databases.createStringAttribute(
                process.env.APPWRITE_DATABASE_ID,
                collectionId,
                attr.key,
                attr.size,
                attr.required,
                attr.default || null
              )
            } else if (attr.type === 'integer') {
              result = await databases.createIntegerAttribute(
                process.env.APPWRITE_DATABASE_ID,
                collectionId,
                attr.key,
                attr.required,
                null,
                null,
                attr.default || null
              )
            } else if (attr.type === 'float') {
              result = await databases.createFloatAttribute(
                process.env.APPWRITE_DATABASE_ID,
                collectionId,
                attr.key,
                attr.required,
                null,
                null,
                attr.default || null
              )
            } else if (attr.type === 'boolean') {
              result = await databases.createBooleanAttribute(
                process.env.APPWRITE_DATABASE_ID,
                collectionId,
                attr.key,
                attr.required,
                attr.default !== undefined ? attr.default : null
              )
            } else if (attr.type === 'datetime') {
              result = await databases.createDatetimeAttribute(
                process.env.APPWRITE_DATABASE_ID,
                collectionId,
                attr.key,
                attr.required,
                attr.default || null
              )
            }
            
            console.log(`   ✅ ${attr.key} (${attr.type})`)
            await new Promise(resolve => setTimeout(resolve, 500))
            
          } catch (error) {
            if (error.message.includes('already exists')) {
              console.log(`   ⏭️ ${attr.key} (exists)`)
            } else {
              console.log(`   ❌ ${attr.key}: ${error.message}`)
            }
          }
        }
        
        // Create indexes
        for (const index of schema.indexes) {
          try {
            await databases.createIndex(
              process.env.APPWRITE_DATABASE_ID,
              collectionId,
              index.key,
              index.type,
              index.attributes
            )
            console.log(`   🔍 ${index.key}`)
            await new Promise(resolve => setTimeout(resolve, 500))
            
          } catch (error) {
            if (error.message.includes('already exists')) {
              console.log(`   🔍 ${index.key} (exists)`)
            } else {
              console.log(`   ❌ ${index.key}: ${error.message}`)
            }
          }
        }
        
        console.log(`   ✅ ${schema.name} schema completed\n`)
        
      } catch (error) {
        console.log(`   ❌ Error setting up ${schema.name}: ${error.message}\n`)
      }
    }
    
    console.log('⏰ Waiting for all schemas to be ready...')
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    console.log('🎉 All schemas setup completed!')
    console.log('🚀 Ready to populate with initial data!')
    
  } catch (error) {
    console.error('❌ Schema setup failed:', error.message)
  }
}

setupAllSchemas()
