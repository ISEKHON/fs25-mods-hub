// List all collections in your Appwrite database
import { databases } from '../config/appwrite.js'
import dotenv from 'dotenv'

dotenv.config()

async function listCollections() {
  try {
    console.log('🔍 Checking database collections...')
    console.log('📍 Database ID:', process.env.APPWRITE_DATABASE_ID)
    console.log('📍 Project ID:', process.env.APPWRITE_PROJECT_ID)
    
    // List all collections in the database
    const collections = await databases.list()
    
    console.log('\n📋 Available Collections:')
    console.log('='.repeat(50))
    
    if (collections.databases.length === 0) {
      console.log('❌ No databases found')
      return
    }
    
    // Find our specific database
    const ourDatabase = collections.databases.find(db => db.$id === process.env.APPWRITE_DATABASE_ID)
    
    if (!ourDatabase) {
      console.log('❌ Database not found with ID:', process.env.APPWRITE_DATABASE_ID)
      console.log('\n📋 Available Databases:')
      collections.databases.forEach(db => {
        console.log(`   - ${db.name} (ID: ${db.$id})`)
      })
      return
    }
    
    console.log(`✅ Database found: ${ourDatabase.name}`)
    
    // List collections in the database
    try {
      const dbCollections = await databases.listCollections(process.env.APPWRITE_DATABASE_ID)
      
      if (dbCollections.collections.length === 0) {
        console.log('❌ No collections found in this database')
        return
      }
      
      console.log(`\n📊 Collections in "${ourDatabase.name}":`)
      dbCollections.collections.forEach((collection, index) => {
        console.log(`   ${index + 1}. ${collection.name} (ID: ${collection.$id})`)
      })
      
      // Try to query mod_categories specifically
      console.log('\n🎯 Testing mod_categories collection...')
      try {
        const testQuery = await databases.listDocuments(
          process.env.APPWRITE_DATABASE_ID,
          'mod_categories',
          []
        )
        console.log(`✅ mod_categories collection accessible - ${testQuery.total} documents found`)
        
        if (testQuery.total > 0) {
          console.log('📄 Sample documents:')
          testQuery.documents.slice(0, 3).forEach(doc => {
            console.log(`   - ${doc.name || doc.title || doc.$id}`)
          })
        }
      } catch (error) {
        console.error('❌ Cannot access mod_categories:', error.message)
        
        // Suggest alternatives
        console.log('\n💡 Possible solutions:')
        console.log('1. Collection might have a different name')
        console.log('2. Check collection permissions')
        console.log('3. Verify collection ID is correct')
      }
      
    } catch (error) {
      console.error('❌ Error listing collections:', error.message)
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.log('\n🔧 Troubleshooting:')
    console.log('1. Check your .env file has correct values')
    console.log('2. Verify API key has database permissions')
    console.log('3. Ensure database exists in Appwrite Console')
  }
}

listCollections()
