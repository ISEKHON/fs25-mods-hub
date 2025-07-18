// Test the API endpoints directly
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { databases } from './api/config/appwrite.js'
import { COLLECTIONS } from './api/config/collections.js'
import { Query } from 'node-appwrite'

// Load environment variables
dotenv.config({ path: './api/.env' })

const app = express()
app.use(cors())
app.use(express.json())

console.log('Testing Appwrite connection...')

// Test connection and single mod endpoint
async function testAPI() {
  try {
    // Test listing mods
    console.log('Testing mods list...')
    const listResponse = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.MODS,
      [
        Query.equal('is_approved', true),
        Query.limit(5)
      ]
    )
    
    console.log(`Found ${listResponse.documents.length} approved mods`)
    
    if (listResponse.documents.length > 0) {
      const firstMod = listResponse.documents[0]
      console.log(`Testing single mod: ${firstMod.title} (ID: ${firstMod.$id})`)
      
      // Test single mod fetch (simulating our endpoint)
      try {
        const mod = await databases.getDocument(
          process.env.APPWRITE_DATABASE_ID,
          COLLECTIONS.MODS,
          firstMod.$id
        )
        
        console.log('Single mod fetch successful!')
        console.log('- Title:', mod.title)
        console.log('- File size:', mod.file_size)
        console.log('- Author ID:', mod.author_id)
        console.log('- Author username:', mod.author_username)
        console.log('- Screenshots:', mod.image_urls ? 'Present' : 'Missing')
        console.log('- Tags:', mod.tags ? 'Present' : 'Missing')
        
        // Test author profile fetch
        if (mod.author_id) {
          try {
            const profileResponse = await databases.listDocuments(
              process.env.APPWRITE_DATABASE_ID,
              COLLECTIONS.USER_PROFILES,
              [Query.equal('user_id', mod.author_id)]
            )
            
            if (profileResponse.documents.length > 0) {
              const profile = profileResponse.documents[0]
              console.log('- Author profile found:', profile.display_name || profile.username)
            } else {
              console.log('- No author profile found')
            }
          } catch (profileError) {
            console.log('- Author profile fetch failed:', profileError.message)
          }
        }
        
      } catch (error) {
        console.error('Single mod fetch failed:', error.message)
      }
    }
    
  } catch (error) {
    console.error('API test failed:', error.message)
  }
  
  process.exit(0)
}

testAPI()
