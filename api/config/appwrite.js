import { Client, Databases, Storage, Users, Query, ID } from 'node-appwrite'
import dotenv from 'dotenv'

dotenv.config()

const endpoint = process.env.APPWRITE_ENDPOINT
const projectId = process.env.APPWRITE_PROJECT_ID
const apiKey = process.env.APPWRITE_API_KEY
const databaseId = process.env.APPWRITE_DATABASE_ID
const storageBucketId = process.env.APPWRITE_STORAGE_BUCKET_ID

if (!endpoint || !projectId || !apiKey || !databaseId || !storageBucketId) {
  throw new Error('Missing Appwrite environment variables')
}

// Initialize Appwrite client
const client = new Client()
client
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey)

// Export client and services
export { client }
export const databases = new Databases(client)
export const storage = new Storage(client)
export const users = new Users(client)

// Export utilities
export { Query, ID }

// Database and storage IDs
export const DATABASE_ID = databaseId
export const BUCKET_ID = storageBucketId

// Collection IDs (these will be created in Appwrite console)
export const COLLECTIONS = {
  CATEGORIES: 'categories',
  DEVELOPERS: 'developers', 
  MODS: 'mods',
  MOD_SUBMISSIONS: 'mod_submissions',
  MOD_IMAGES: 'mod_images',
  MOD_FEATURES: 'mod_features',
  COMPATIBILITY_TAGS: 'compatibility_tags',
  REVIEWS: 'reviews',
  ADMIN_LOGS: 'admin_logs'
}

// Helper function to handle Appwrite errors
export const handleAppwriteError = (error) => {
  console.error('Appwrite Error:', error)
  
  if (error.code === 404) {
    return { status: 404, message: 'Resource not found' }
  } else if (error.code === 401) {
    return { status: 401, message: 'Unauthorized' }
  } else if (error.code === 400) {
    return { status: 400, message: error.message || 'Bad request' }
  } else {
    return { status: 500, message: 'Internal server error' }
  }
}
