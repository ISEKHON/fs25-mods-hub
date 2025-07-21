import { Client, Databases, ID, Permission, Role } from 'node-appwrite'
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

async function setupDevelopersSchema() {
  try {
    console.log('🔧 Setting up DEVELOPERS collection schema...')
    
    const databaseId = process.env.APPWRITE_DATABASE_ID
    const collectionId = COLLECTIONS.DEVELOPERS

    // Define all attributes for the developers collection
    const attributes = [
      {
        key: 'user_id',
        type: 'string',
        size: 255,
        required: true,
        array: false,
        xdefault: null
      },
      {
        key: 'display_name',
        type: 'string',
        size: 255,
        required: true,
        array: false,
        xdefault: null
      },
      {
        key: 'role',
        type: 'string',
        size: 255,
        required: false,
        array: false,
        xdefault: 'Mod Creator'
      },
      {
        key: 'avatar_url',
        type: 'string',
        size: 500,
        required: false,
        array: false,
        xdefault: null
      },
      {
        key: 'bio',
        type: 'string',
        size: 1000,
        required: false,
        array: false,
        xdefault: null
      },
      {
        key: 'email',
        type: 'string',
        size: 255,
        required: false,
        array: false,
        xdefault: null
      },
      {
        key: 'telegram',
        type: 'string',
        size: 255,
        required: false,
        array: false,
        xdefault: null
      },
      {
        key: 'discord',
        type: 'string',
        size: 255,
        required: false,
        array: false,
        xdefault: null
      },
      {
        key: 'specialties',
        type: 'string',
        size: 100,
        required: false,
        array: true,
        xdefault: null
      },
      {
        key: 'is_featured',
        type: 'boolean',
        required: false,
        array: false,
        xdefault: false
      },
      {
        key: 'is_verified',
        type: 'boolean',
        required: false,
        array: false,
        xdefault: false
      }
    ]

    // Check if collection exists and get current attributes
    let existingAttributes = []
    try {
      const collection = await databases.getCollection(databaseId, collectionId)
      existingAttributes = collection.attributes.map(attr => attr.key)
      console.log('✅ Collection exists. Current attributes:', existingAttributes)
    } catch (error) {
      console.log('❌ Collection does not exist or cannot be accessed')
      return
    }

    // Create missing attributes
    for (const attr of attributes) {
      if (!existingAttributes.includes(attr.key)) {
        try {
          console.log(`➕ Creating attribute: ${attr.key}`)
          
          if (attr.type === 'string') {
            await databases.createStringAttribute(
              databaseId,
              collectionId,
              attr.key,
              attr.size,
              attr.required,
              attr.xdefault,
              attr.array
            )
          } else if (attr.type === 'boolean') {
            await databases.createBooleanAttribute(
              databaseId,
              collectionId,
              attr.key,
              attr.required,
              attr.xdefault,
              attr.array
            )
          }
          
          console.log(`✅ Created attribute: ${attr.key}`)
          
          // Wait a bit between attribute creations
          await new Promise(resolve => setTimeout(resolve, 1000))
          
        } catch (error) {
          console.error(`❌ Error creating attribute ${attr.key}:`, error.message)
        }
      } else {
        console.log(`⏭️  Attribute ${attr.key} already exists`)
      }
    }

    // Create indexes for better performance
    const indexes = [
      {
        key: 'user_id_index',
        type: 'key',
        attributes: ['user_id'],
        orders: ['ASC']
      },
      {
        key: 'featured_index',
        type: 'key',
        attributes: ['is_featured'],
        orders: ['DESC']
      },
      {
        key: 'display_name_index',
        type: 'key',
        attributes: ['display_name'],
        orders: ['ASC']
      },
      {
        key: 'search_index',
        type: 'fulltext',
        attributes: ['display_name', 'bio'],
        orders: []
      }
    ]

    // Get existing indexes
    let existingIndexes = []
    try {
      const collection = await databases.getCollection(databaseId, collectionId)
      existingIndexes = collection.indexes.map(index => index.key)
    } catch (error) {
      console.log('Could not get existing indexes')
    }

    // Create missing indexes
    for (const index of indexes) {
      if (!existingIndexes.includes(index.key)) {
        try {
          console.log(`➕ Creating index: ${index.key}`)
          await databases.createIndex(
            databaseId,
            collectionId,
            index.key,
            index.type,
            index.attributes,
            index.orders
          )
          console.log(`✅ Created index: ${index.key}`)
          
          // Wait between index creations
          await new Promise(resolve => setTimeout(resolve, 2000))
          
        } catch (error) {
          console.error(`❌ Error creating index ${index.key}:`, error.message)
        }
      } else {
        console.log(`⏭️  Index ${index.key} already exists`)
      }
    }

    console.log('\n🎉 DEVELOPERS collection schema setup completed!')
    console.log('\n📋 Collection Structure:')
    console.log('   • user_id (string) - User ID from auth system')
    console.log('   • display_name (string) - Developer display name')
    console.log('   • role (string) - Developer role/title')
    console.log('   • avatar_url (string) - Custom avatar URL')
    console.log('   • bio (string) - Developer biography')
    console.log('   • email (string) - Contact email')
    console.log('   • telegram (string) - Telegram handle')
    console.log('   • discord (string) - Discord handle')
    console.log('   • specialties (array) - Array of specialties')
    console.log('   • is_featured (boolean) - Featured developer flag')
    console.log('   • is_verified (boolean) - Verified developer flag')

  } catch (error) {
    console.error('❌ Setup failed:', error)
  }
}

// Run the setup
setupDevelopersSchema()
