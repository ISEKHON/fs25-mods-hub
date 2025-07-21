// Setup collection schema for mod_categories
import { databases } from '../config/appwrite.js'
import dotenv from 'dotenv'

dotenv.config()

const MOD_CATEGORIES_COLLECTION_ID = '68776ca90006a668031e'

async function setupModCategoriesSchema() {
  try {
    console.log('🔧 Setting up mod_categories collection schema...')
    
    // Define attributes
    const attributes = [
      { key: 'name', type: 'string', size: 100, required: true },
      { key: 'slug', type: 'string', size: 100, required: true },
      { key: 'description', type: 'string', size: 500, required: false },
      { key: 'icon', type: 'string', size: 20, required: false },
      { key: 'color', type: 'string', size: 10, required: false },
      { key: 'sort_order', type: 'integer', required: false, default: 0 },
      { key: 'mod_count', type: 'integer', required: false, default: 0 },
      { key: 'is_active', type: 'boolean', required: false, default: true }
    ]
    
    console.log('📝 Creating attributes...')
    
    for (const attr of attributes) {
      try {
        let result
        
        if (attr.type === 'string') {
          result = await databases.createStringAttribute(
            process.env.APPWRITE_DATABASE_ID,
            MOD_CATEGORIES_COLLECTION_ID,
            attr.key,
            attr.size,
            attr.required,
            attr.default || null
          )
        } else if (attr.type === 'integer') {
          result = await databases.createIntegerAttribute(
            process.env.APPWRITE_DATABASE_ID,
            MOD_CATEGORIES_COLLECTION_ID,
            attr.key,
            attr.required,
            null, // min
            null, // max
            attr.default || null
          )
        } else if (attr.type === 'boolean') {
          result = await databases.createBooleanAttribute(
            process.env.APPWRITE_DATABASE_ID,
            MOD_CATEGORIES_COLLECTION_ID,
            attr.key,
            attr.required,
            attr.default !== undefined ? attr.default : null
          )
        }
        
        console.log(`✅ Created attribute: ${attr.key} (${attr.type})`)
        
        // Wait a bit between attribute creation
        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`⏭️ Attribute already exists: ${attr.key}`)
        } else {
          console.error(`❌ Error creating attribute ${attr.key}:`, error.message)
        }
      }
    }
    
    console.log('\n🔍 Creating indexes...')
    
    // Create indexes
    const indexes = [
      { key: 'slug_unique', attributes: ['slug'], type: 'unique' },
      { key: 'sort_order_idx', attributes: ['sort_order'], type: 'key' },
      { key: 'is_active_idx', attributes: ['is_active'], type: 'key' }
    ]
    
    for (const index of indexes) {
      try {
        await databases.createIndex(
          process.env.APPWRITE_DATABASE_ID,
          MOD_CATEGORIES_COLLECTION_ID,
          index.key,
          index.type,
          index.attributes
        )
        console.log(`✅ Created index: ${index.key}`)
        
        // Wait between index creation
        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`⏭️ Index already exists: ${index.key}`)
        } else {
          console.error(`❌ Error creating index ${index.key}:`, error.message)
        }
      }
    }
    
    console.log('\n⏰ Waiting for schema to be ready...')
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Verify schema creation
    try {
      const collection = await databases.getCollection(
        process.env.APPWRITE_DATABASE_ID,
        MOD_CATEGORIES_COLLECTION_ID
      )
      
      console.log('\n✅ Schema setup completed!')
      console.log(`📊 Collection now has ${collection.attributes.length} attributes`)
      console.log(`🔍 Collection has ${collection.indexes.length} indexes`)
      
      console.log('\n🚀 Ready to run seeding script!')
      console.log('Run: node scripts/seed-database.js')
      
    } catch (error) {
      console.error('❌ Error verifying schema:', error.message)
    }
    
  } catch (error) {
    console.error('❌ Schema setup failed:', error.message)
  }
}

setupModCategoriesSchema()
