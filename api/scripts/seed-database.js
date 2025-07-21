// Database Seeding Script for FS25 Mods Hub
// Run this script to populate your Appwrite database with initial data

import { databases, Query, ID } from '../config/appwrite.js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Default mod categories - Updated to 4 core categories
const defaultCategories = [
  {
    name: 'Vehicles',
    slug: 'vehicles',
    description: 'Tractors, harvesters, trucks and other vehicles',
    icon: '🚜',
    color: '#059669',
    sort_order: 1
  },
  {
    name: 'Maps',
    slug: 'maps',
    description: 'Custom farm maps and terrains',
    icon: '🗺️',
    color: '#0d9488',
    sort_order: 2
  },
  {
    name: 'Tools & Equipment',
    slug: 'tools-equipment',
    description: 'Plows, seeders, mowers and other implements',
    icon: '🔧',
    color: '#7c3aed',
    sort_order: 3
  },
  {
    name: 'Scripts & Gameplay',
    slug: 'scripts-gameplay',
    description: 'Gameplay modifications and script mods',
    icon: '⚙️',
    color: '#4338ca',
    sort_order: 4
  }
]

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...')
    console.log('📍 Database ID:', process.env.APPWRITE_DATABASE_ID)

    // Test database connection first
    try {
      const testQuery = await databases.listDocuments(
        process.env.APPWRITE_DATABASE_ID,
        '68776ca90006a668031e', // mod_categories collection ID
        [Query.limit(1)]
      )
      console.log('✅ Database connection successful')
    } catch (error) {
      console.error('❌ Database connection failed:', error.message)
      return
    }

    // Seed categories
    console.log('\n📂 Seeding mod categories...')
    let created = 0
    let existing = 0

    for (const category of defaultCategories) {
      try {
        // Check if category already exists
        const existingCategories = await databases.listDocuments(
          process.env.APPWRITE_DATABASE_ID,
          '68776ca90006a668031e', // mod_categories collection ID
          [Query.equal('slug', category.slug)]
        )

        if (existingCategories.documents.length === 0) {
          await databases.createDocument(
            process.env.APPWRITE_DATABASE_ID,
            '68776ca90006a668031e', // mod_categories collection ID
            ID.unique(),
            {
              ...category,
              mod_count: 0,
              is_active: true
            }
          )
          console.log(`✅ Created category: ${category.name}`)
          created++
        } else {
          console.log(`⏭️ Category already exists: ${category.name}`)
          existing++
        }
      } catch (error) {
        console.error(`❌ Error creating category ${category.name}:`, error.message)
      }
    }

    console.log('\n🎉 Database seeding completed!')
    console.log(`📊 Results: ${created} created, ${existing} already existed`)
    console.log(`
📋 Next Steps:
1. Create Storage Bucket in Appwrite Console:
   - avatars (for user profile pictures only)

2. Set up proper permissions for each collection
3. Configure indexes for better performance
4. Add real mod content through the submission interface

ℹ️  Note: Users provide direct links for:
   📦 ZIP files (Google Drive, Dropbox, etc.)
   🖼️ Images (Imgur, PostImage, etc.)
   
   No file/image storage needed on your server!

🚀 Your FS25 Mods Hub is ready for production!
    `)

  } catch (error) {
    console.error('❌ Database seeding failed:', error)
    console.error('Full error:', error)
  }
}

// Run seeding if this file is executed directly
seedDatabase()

export { seedDatabase, defaultCategories }
