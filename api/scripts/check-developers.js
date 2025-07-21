import { Client, Databases } from 'node-appwrite'
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

async function checkDevelopersCollection() {
  try {
    console.log('🔍 Checking DEVELOPERS collection...')
    
    const databaseId = process.env.APPWRITE_DATABASE_ID
    const collectionId = COLLECTIONS.DEVELOPERS

    console.log(`📍 Database ID: ${databaseId}`)
    console.log(`📍 Collection ID: ${collectionId}`)

    // Get collection details
    const collection = await databases.getCollection(databaseId, collectionId)
    
    console.log('\n📋 Collection Details:')
    console.log(`Name: ${collection.name}`)
    console.log(`ID: ${collection.$id}`)
    console.log(`Documents Count: ${collection.documentsCount}`)
    
    console.log('\n📊 Available Attributes:')
    console.log('==================================================')
    collection.attributes.forEach((attr, index) => {
      const required = attr.required ? ' *required' : ''
      const array = attr.array ? ' (array)' : ''
      console.log(`${index + 1}. ${attr.key} (${attr.type})${array}${required}`)
      if (attr.default !== undefined) {
        console.log(`   Default: ${attr.default}`)
      }
    })

    console.log('\n📝 Indexes:')
    console.log('==================================================')
    collection.indexes.forEach((index, i) => {
      console.log(`${i + 1}. ${index.key} - ${index.attributes.join(', ')}`)
    })

    // Get sample documents
    console.log('\n📄 Sample Documents:')
    console.log('==================================================')
    const documents = await databases.listDocuments(databaseId, collectionId)
    
    if (documents.documents.length === 0) {
      console.log('No documents found in collection.')
    } else {
      console.log(`Found ${documents.documents.length} existing documents:`)
      documents.documents.slice(0, 3).forEach((doc, index) => {
        console.log(`\nDocument ${index + 1}:`)
        Object.keys(doc).forEach(key => {
          if (!key.startsWith('$')) {
            console.log(`  ${key}: ${doc[key]}`)
          }
        })
      })
    }

  } catch (error) {
    console.error('❌ Error checking collection:', error.message)
  }
}

// Run the check
checkDevelopersCollection()
