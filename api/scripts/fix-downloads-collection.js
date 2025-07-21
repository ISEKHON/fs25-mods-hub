import { Client, Databases } from 'node-appwrite'
import { config } from 'dotenv'

// Load environment variables
config()

const client = new Client()
const databases = new Databases(client)

client
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY)

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID

async function addMissingAttributes() {
  console.log('🔧 Adding missing attributes to MOD_DOWNLOADS collection...\n')
  
  const MOD_DOWNLOADS_ID = '6879dbf000258b547340' // From our previous creation
  
  try {
    // Add the attributes that are missing
    const attributes = [
      { key: 'mod_id', type: 'string', size: 36, required: true },
      { key: 'user_id', type: 'string', size: 36, required: false },
      { key: 'ip_address', type: 'string', size: 45, required: true },
      { key: 'user_agent', type: 'string', size: 500, required: false },
      { key: 'download_timestamp', type: 'datetime', required: true }
    ]
    
    for (const attr of attributes) {
      try {
        console.log(`  📝 Adding attribute: ${attr.key}`)
        
        if (attr.type === 'string') {
          await databases.createStringAttribute(
            DATABASE_ID,
            MOD_DOWNLOADS_ID,
            attr.key,
            attr.size,
            attr.required
          )
        } else if (attr.type === 'datetime') {
          await databases.createDatetimeAttribute(
            DATABASE_ID,
            MOD_DOWNLOADS_ID,
            attr.key,
            attr.required
          )
        }
        
        console.log(`  ✅ Added attribute: ${attr.key}`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (attrError) {
        if (attrError.message.includes('already exists')) {
          console.log(`  ℹ️ Attribute ${attr.key} already exists`)
        } else {
          console.warn(`  ⚠️ Warning creating attribute ${attr.key}:`, attrError.message)
        }
      }
    }
    
    // Wait for attributes to be ready
    console.log(`\n⏳ Waiting for attributes to be ready...`)
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    // Create indexes
    console.log(`\n🔍 Creating indexes...`)
    const indexes = [
      { key: 'mod_id_index', type: 'key', attributes: ['mod_id'] },
      { key: 'user_id_index', type: 'key', attributes: ['user_id'] },
      { key: 'ip_address_index', type: 'key', attributes: ['ip_address'] },
      { key: 'download_timestamp_index', type: 'key', attributes: ['download_timestamp'], orders: ['desc'] }
    ]
    
    for (const index of indexes) {
      try {
        console.log(`  🔍 Creating index: ${index.key}`)
        await databases.createIndex(
          DATABASE_ID,
          MOD_DOWNLOADS_ID,
          index.key,
          index.type,
          index.attributes,
          index.orders || ['asc']
        )
        console.log(`  ✅ Created index: ${index.key}`)
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (indexError) {
        if (indexError.message.includes('already exists')) {
          console.log(`  ℹ️ Index ${index.key} already exists`)
        } else {
          console.warn(`  ⚠️ Warning creating index ${index.key}:`, indexError.message)
        }
      }
    }
    
    console.log('\n🎉 MOD_DOWNLOADS collection setup completed!')
    
  } catch (error) {
    console.error('❌ Error setting up MOD_DOWNLOADS collection:', error)
  }
}

// Run the setup
addMissingAttributes()
