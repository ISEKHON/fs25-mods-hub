import { Client, Databases, ID } from 'node-appwrite'
import dotenv from 'dotenv'

dotenv.config()

const client = new Client()
const databases = new Databases(client)

client
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY)

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID

// Collection schemas
const schemas = {
  mod_reviews: {
    name: 'mod_reviews',
    attributes: [
      { key: 'mod_id', type: 'string', size: 36, required: true },
      { key: 'user_id', type: 'string', size: 36, required: true },
      { key: 'username', type: 'string', size: 100, required: true },
      { key: 'rating', type: 'integer', required: true, min: 1, max: 5 },
      { key: 'review_text', type: 'string', size: 2000, required: false },
      { key: 'helpful_count', type: 'integer', required: false, default: 0 },
      { key: 'created_at', type: 'datetime', required: false },
      { key: 'updated_at', type: 'datetime', required: false }
    ],
    indexes: [
      { key: 'mod_id_index', type: 'key', attributes: ['mod_id'] },
      { key: 'user_id_index', type: 'key', attributes: ['user_id'] },
      { key: 'rating_index', type: 'key', attributes: ['rating'] },
      { key: 'created_at_index', type: 'key', attributes: ['created_at'], orders: ['desc'] }
    ]
  },
  mod_reports: {
    name: 'mod_reports',
    attributes: [
      { key: 'mod_id', type: 'string', size: 36, required: true },
      { key: 'reporter_id', type: 'string', size: 36, required: true },
      { key: 'reporter_email', type: 'email', required: true },
      { key: 'report_type', type: 'string', size: 50, required: true },
      { key: 'description', type: 'string', size: 1000, required: true },
      { key: 'additional_info', type: 'string', size: 500, required: false },
      { key: 'status', type: 'string', size: 20, required: true, default: 'pending' },
      { key: 'admin_notes', type: 'string', size: 1000, required: false },
      { key: 'created_at', type: 'datetime', required: false },
      { key: 'updated_at', type: 'datetime', required: false }
    ],
    indexes: [
      { key: 'mod_id_index', type: 'key', attributes: ['mod_id'] },
      { key: 'reporter_id_index', type: 'key', attributes: ['reporter_id'] },
      { key: 'status_index', type: 'key', attributes: ['status'] },
      { key: 'report_type_index', type: 'key', attributes: ['report_type'] },
      { key: 'created_at_index', type: 'key', attributes: ['created_at'], orders: ['desc'] }
    ]
  },
  mod_downloads: {
    name: 'mod_downloads',
    attributes: [
      { key: 'mod_id', type: 'string', size: 36, required: true },
      { key: 'user_id', type: 'string', size: 36, required: false },
      { key: 'ip_address', type: 'string', size: 45, required: true },
      { key: 'user_agent', type: 'string', size: 500, required: false },
      { key: 'download_timestamp', type: 'datetime', required: true }
    ],
    indexes: [
      { key: 'mod_id_index', type: 'key', attributes: ['mod_id'] },
      { key: 'user_id_index', type: 'key', attributes: ['user_id'] },
      { key: 'ip_address_index', type: 'key', attributes: ['ip_address'] },
      { key: 'download_timestamp_index', type: 'key', attributes: ['download_timestamp'], orders: ['desc'] }
    ]
  }
}

async function createCollection(collectionData) {
  try {
    console.log(`\n📋 Creating collection: ${collectionData.name}`)
    
    // Create collection
    const collection = await databases.createCollection(
      DATABASE_ID,
      ID.unique(),
      collectionData.name,
      []
    )
    
    console.log(`✅ Collection created with ID: ${collection.$id}`)
    
    // Create attributes
    for (const attr of collectionData.attributes) {
      try {
        console.log(`  📝 Creating attribute: ${attr.key}`)
        
        if (attr.type === 'string') {
          await databases.createStringAttribute(
            DATABASE_ID,
            collection.$id,
            attr.key,
            attr.size,
            attr.required,
            attr.default || null
          )
        } else if (attr.type === 'integer') {
          await databases.createIntegerAttribute(
            DATABASE_ID,
            collection.$id,
            attr.key,
            attr.required,
            attr.min || null,
            attr.max || null,
            attr.default || null
          )
        } else if (attr.type === 'datetime') {
          await databases.createDatetimeAttribute(
            DATABASE_ID,
            collection.$id,
            attr.key,
            attr.required,
            attr.default || null
          )
        } else if (attr.type === 'email') {
          await databases.createEmailAttribute(
            DATABASE_ID,
            collection.$id,
            attr.key,
            attr.required,
            attr.default || null
          )
        }
        
        // Wait a bit for attribute to be ready
        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (attrError) {
        console.warn(`  ⚠️ Warning creating attribute ${attr.key}:`, attrError.message)
      }
    }
    
    // Wait for all attributes to be ready before creating indexes
    console.log(`  ⏳ Waiting for attributes to be ready...`)
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    // Create indexes
    for (const index of collectionData.indexes) {
      try {
        console.log(`  🔍 Creating index: ${index.key}`)
        await databases.createIndex(
          DATABASE_ID,
          collection.$id,
          index.key,
          index.type,
          index.attributes,
          index.orders || null
        )
        
        // Wait between index creation
        await new Promise(resolve => setTimeout(resolve, 2000))
        
      } catch (indexError) {
        console.warn(`  ⚠️ Warning creating index ${index.key}:`, indexError.message)
      }
    }
    
    return collection
  } catch (error) {
    console.error(`❌ Error creating collection ${collectionData.name}:`, error.message)
    throw error
  }
}

async function setupCollections() {
  console.log('🚀 Setting up collections for reviews, reports, and downloads...')
  
  try {
    // List existing collections
    const existing = await databases.listCollections(DATABASE_ID)
    console.log(`📊 Found ${existing.collections.length} existing collections`)
    
    for (const [key, schema] of Object.entries(schemas)) {
      // Check if collection already exists
      const existingCollection = existing.collections.find(c => c.name === schema.name)
      
      if (existingCollection) {
        console.log(`✅ Collection '${schema.name}' already exists with ID: ${existingCollection.$id}`)
        continue
      }
      
      // Create new collection
      await createCollection(schema)
    }
    
    console.log('\n🎉 Collection setup completed!')
    console.log('\n📝 Update your COLLECTIONS config with these IDs:')
    
    // List all collections again to show IDs
    const updated = await databases.listCollections(DATABASE_ID)
    for (const collection of updated.collections) {
      if (Object.values(schemas).some(s => s.name === collection.name)) {
        console.log(`${collection.name.toUpperCase()}: '${collection.$id}',`)
      }
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    process.exit(1)
  }
}

// Run setup
setupCollections()
