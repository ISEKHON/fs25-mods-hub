// Check schema status for all collections
import { databases } from '../config/appwrite.js'
import { COLLECTIONS } from '../config/collections.js'
import dotenv from 'dotenv'

dotenv.config()

const COLLECTION_NAMES = {
  [COLLECTIONS.USER_PROFILES]: 'user_profiles',
  [COLLECTIONS.USER_SESSIONS]: 'user_sessions',
  [COLLECTIONS.USER_ACTIVITIES]: 'user_activities',
  [COLLECTIONS.MODS]: 'mods',
  [COLLECTIONS.MOD_CATEGORIES]: 'mod_categories',
  [COLLECTIONS.MOD_REVIEWS]: 'mod_reviews',
  [COLLECTIONS.MOD_DOWNLOADS]: 'mod_downloads',
  [COLLECTIONS.DEVELOPERS]: 'developers',
  [COLLECTIONS.MOD_SUBMISSIONS]: 'mod_submissions',
  [COLLECTIONS.USER_FAVORITES]: 'user_favorites',
  [COLLECTIONS.NOTIFICATIONS]: 'notifications',
  [COLLECTIONS.REPORTS]: 'reports'
}

async function checkAllCollections() {
  try {
    console.log('🔍 Checking schema status for all collections...\n')
    
    for (const [collectionId, collectionName] of Object.entries(COLLECTION_NAMES)) {
      try {
        const collection = await databases.getCollection(
          process.env.APPWRITE_DATABASE_ID,
          collectionId
        )
        
        console.log(`📋 ${collectionName.toUpperCase()}`)
        console.log(`   ID: ${collectionId}`)
        console.log(`   Attributes: ${collection.attributes.length}`)
        console.log(`   Indexes: ${collection.indexes.length}`)
        
        // Check if has data
        try {
          const docs = await databases.listDocuments(
            process.env.APPWRITE_DATABASE_ID,
            collectionId,
            []
          )
          console.log(`   Documents: ${docs.total}`)
        } catch (error) {
          console.log(`   Documents: Unable to check (${error.message})`)
        }
        
        if (collection.attributes.length === 0) {
          console.log(`   ❌ NO SCHEMA - Needs setup`)
        } else {
          console.log(`   ✅ Schema configured`)
        }
        console.log('')
        
      } catch (error) {
        console.log(`❌ ${collectionName}: ${error.message}\n`)
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking collections:', error.message)
  }
}

checkAllCollections()
