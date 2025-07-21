// Check collection schema and attributes
import { databases } from '../config/appwrite.js'
import dotenv from 'dotenv'

dotenv.config()

async function checkSchema() {
  try {
    console.log('🔍 Checking mod_categories collection schema...')
    
    // Get collection details
    const collection = await databases.getCollection(
      process.env.APPWRITE_DATABASE_ID,
      '68776ca90006a668031e' // mod_categories collection ID
    )
    
    console.log('\n📋 Collection Details:')
    console.log(`Name: ${collection.name}`)
    console.log(`ID: ${collection.$id}`)
    console.log(`Documents Count: ${collection.documentSecurity ? 'Document-level security' : 'Collection-level security'}`)
    
    console.log('\n📊 Available Attributes:')
    console.log('='.repeat(50))
    
    if (collection.attributes && collection.attributes.length > 0) {
      collection.attributes.forEach((attr, index) => {
        console.log(`${index + 1}. ${attr.key} (${attr.type})${attr.required ? ' *required' : ''}`)
        if (attr.default !== undefined) {
          console.log(`   Default: ${attr.default}`)
        }
      })
    } else {
      console.log('❌ No attributes found in collection')
    }
    
    console.log('\n📝 Indexes:')
    console.log('='.repeat(50))
    
    if (collection.indexes && collection.indexes.length > 0) {
      collection.indexes.forEach((index, i) => {
        console.log(`${i + 1}. ${index.key} - ${index.attributes.join(', ')}`)
      })
    } else {
      console.log('ℹ️ No indexes configured')
    }

    // Try to list documents to see actual data structure
    console.log('\n📄 Sample Documents:')
    console.log('='.repeat(50))
    
    try {
      const docs = await databases.listDocuments(
        process.env.APPWRITE_DATABASE_ID,
        '68776ca90006a668031e',
        []
      )
      
      if (docs.total > 0) {
        console.log(`Found ${docs.total} existing documents:`)
        docs.documents.slice(0, 3).forEach((doc, index) => {
          console.log(`\nDocument ${index + 1}:`)
          Object.keys(doc).forEach(key => {
            if (!key.startsWith('$')) {
              console.log(`  ${key}: ${doc[key]}`)
            }
          })
        })
      } else {
        console.log('✅ Collection is empty - ready for seeding')
      }
    } catch (error) {
      console.log('❌ Cannot read documents:', error.message)
    }
    
  } catch (error) {
    console.error('❌ Error checking schema:', error.message)
  }
}

checkSchema()
