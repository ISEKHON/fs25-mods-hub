import { Client, Databases, IndexType } from 'node-appwrite'
import { COLLECTIONS } from '../config/collections.js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Initialize Appwrite client
const client = new Client()
const databases = new Databases(client)

client
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY)

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID

async function addSearchIndex() {
  try {
    console.log('🔍 Adding fulltext search index for developers...')

    // Add fulltext index for display_name to enable search
    const searchIndex = await databases.createIndex(
      DATABASE_ID,
      COLLECTIONS.DEVELOPERS,
      'search_index',
      IndexType.Fulltext,
      ['display_name', 'bio', 'specialties']
    )

    console.log('✅ Created fulltext search index for display_name, bio, and specialties')
    console.log('🎉 Search functionality is now enabled!')

  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️ Search index already exists')
    } else {
      console.error('❌ Error creating search index:', error.message)
    }
  }
}

addSearchIndex()
