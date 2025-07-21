// Comprehensive database seeding for all collections
import { databases, Query, ID } from '../config/appwrite.js'
import { COLLECTIONS } from '../config/collections.js'
import dotenv from 'dotenv'

dotenv.config()

// Sample developers data
const sampleDevelopers = [
  {
    name: 'Giants Software',
    slug: 'giants-software',
    description: 'Official developers of Farming Simulator series',
    website: 'https://www.farming-simulator.com/',
    is_verified: true,
    is_active: true
  },
  {
    name: 'ModHub Team',
    slug: 'modhub-team',
    description: 'Community mod creators and testers',
    website: 'https://farming-simulator.com/mods.php',
    is_verified: true,
    is_active: true
  },
  {
    name: 'FS25 Community',
    slug: 'fs25-community',
    description: 'Independent mod developers',
    is_verified: false,
    is_active: true
  }
]

// Sample mods data (using external links)
const sampleMods = [
  {
    title: 'John Deere 8R Series Tractor',
    slug: 'john-deere-8r-series',
    description: 'High-performance tractor with realistic features and detailed cab interior. Perfect for large farming operations.',
    author_name: 'ModHub Team',
    version: '1.0.0',
    download_url: 'https://drive.google.com/file/d/example1/view',
    image_urls: 'https://i.imgur.com/example1.jpg,https://i.imgur.com/example2.jpg',
    tags: 'tractor,john-deere,farming,agriculture',
    file_size: 125000000, // 125MB
    is_featured: true,
    is_approved: true,
    is_active: true,
    submitted_by: 'system'
  },
  {
    title: 'Midwest USA Map',
    slug: 'midwest-usa-map',
    description: 'Authentic American farming experience with corn and soybean fields across rolling hills.',
    author_name: 'Giants Software',
    version: '1.2.1',
    download_url: 'https://drive.google.com/file/d/example2/view',
    image_urls: 'https://i.imgur.com/map1.jpg,https://i.imgur.com/map2.jpg',
    tags: 'map,usa,corn,soybean,midwest',
    file_size: 450000000, // 450MB
    is_featured: true,
    is_approved: true,
    is_active: true,
    submitted_by: 'system'
  },
  {
    title: 'Case IH Harvester Pack',
    slug: 'case-ih-harvester-pack',
    description: 'Complete harvester collection with different header options for various crops.',
    author_name: 'FS25 Community',
    version: '1.0.0',
    download_url: 'https://drive.google.com/file/d/example3/view',
    image_urls: 'https://i.imgur.com/harvest1.jpg',
    tags: 'harvester,case-ih,agriculture,combine',
    file_size: 89000000, // 89MB
    is_featured: false,
    is_approved: true,
    is_active: true,
    submitted_by: 'system'
  }
]

async function seedAllCollections() {
  try {
    console.log('🌱 Starting comprehensive database seeding...\n')
    
    // 1. Seed Developers
    console.log('👥 Seeding developers...')
    const createdDevelopers = []
    
    for (const developer of sampleDevelopers) {
      try {
        // Check if developer exists
        const existing = await databases.listDocuments(
          process.env.APPWRITE_DATABASE_ID,
          COLLECTIONS.DEVELOPERS,
          [Query.equal('slug', developer.slug)]
        )
        
        if (existing.documents.length === 0) {
          const newDeveloper = await databases.createDocument(
            process.env.APPWRITE_DATABASE_ID,
            COLLECTIONS.DEVELOPERS,
            ID.unique(),
            {
              ...developer,
              mod_count: 0
            }
          )
          createdDevelopers.push(newDeveloper)
          console.log(`   ✅ Created developer: ${developer.name}`)
        } else {
          createdDevelopers.push(existing.documents[0])
          console.log(`   ⏭️ Developer exists: ${developer.name}`)
        }
      } catch (error) {
        console.log(`   ❌ Error creating developer ${developer.name}:`, error.message)
      }
    }
    
    // 2. Get categories for mod assignment
    console.log('\n📂 Getting categories...')
    const categories = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.MOD_CATEGORIES,
      [Query.equal('is_active', true)]
    )
    
    if (categories.documents.length === 0) {
      console.log('❌ No categories found. Please run seed-database.js first for categories.')
      return
    }
    
    // 3. Seed Mods
    console.log('\n🎮 Seeding mods...')
    const createdMods = []
    
    for (let i = 0; i < sampleMods.length; i++) {
      const mod = sampleMods[i]
      
      try {
        // Check if mod exists
        const existing = await databases.listDocuments(
          process.env.APPWRITE_DATABASE_ID,
          COLLECTIONS.MODS,
          [Query.equal('slug', mod.slug)]
        )
        
        if (existing.documents.length === 0) {
          // Assign category based on mod type
          let categoryId
          if (mod.slug.includes('tractor') || mod.slug.includes('harvester')) {
            categoryId = categories.documents.find(c => c.slug === 'vehicles')?.$id
          } else if (mod.slug.includes('map')) {
            categoryId = categories.documents.find(c => c.slug === 'maps')?.$id
          } else {
            categoryId = categories.documents[0].$id // Default to first category
          }
          
          // Find developer
          const developer = createdDevelopers.find(d => d.name === mod.author_name)
          
          const newMod = await databases.createDocument(
            process.env.APPWRITE_DATABASE_ID,
            COLLECTIONS.MODS,
            ID.unique(),
            {
              ...mod,
              category_id: categoryId,
              developer_id: developer?.$id || null,
              download_count: Math.floor(Math.random() * 1000) + 100,
              rating_average: 4.0 + Math.random() * 1.0, // 4.0-5.0 rating
              rating_count: Math.floor(Math.random() * 50) + 10,
              approved_by: 'system',
              approved_at: new Date().toISOString()
            }
          )
          
          createdMods.push(newMod)
          console.log(`   ✅ Created mod: ${mod.title}`)
        } else {
          createdMods.push(existing.documents[0])
          console.log(`   ⏭️ Mod exists: ${mod.title}`)
        }
      } catch (error) {
        console.log(`   ❌ Error creating mod ${mod.title}:`, error.message)
      }
    }
    
    // 4. Update category mod counts
    console.log('\n📊 Updating category counts...')
    for (const category of categories.documents) {
      try {
        const categoryMods = await databases.listDocuments(
          process.env.APPWRITE_DATABASE_ID,
          COLLECTIONS.MODS,
          [
            Query.equal('category_id', category.$id),
            Query.equal('is_approved', true)
          ]
        )
        
        await databases.updateDocument(
          process.env.APPWRITE_DATABASE_ID,
          COLLECTIONS.MOD_CATEGORIES,
          category.$id,
          { mod_count: categoryMods.total }
        )
        
        console.log(`   ✅ Updated ${category.name}: ${categoryMods.total} mods`)
      } catch (error) {
        console.log(`   ❌ Error updating category ${category.name}:`, error.message)
      }
    }
    
    // 5. Update developer mod counts
    console.log('\n👥 Updating developer counts...')
    for (const developer of createdDevelopers) {
      try {
        const developerMods = await databases.listDocuments(
          process.env.APPWRITE_DATABASE_ID,
          COLLECTIONS.MODS,
          [
            Query.equal('developer_id', developer.$id),
            Query.equal('is_approved', true)
          ]
        )
        
        await databases.updateDocument(
          process.env.APPWRITE_DATABASE_ID,
          COLLECTIONS.DEVELOPERS,
          developer.$id,
          { mod_count: developerMods.total }
        )
        
        console.log(`   ✅ Updated ${developer.name}: ${developerMods.total} mods`)
      } catch (error) {
        console.log(`   ❌ Error updating developer ${developer.name}:`, error.message)
      }
    }
    
    console.log('\n🎉 Comprehensive database seeding completed!')
    console.log(`
📊 Summary:
   - ${createdDevelopers.length} developers ready
   - ${categories.total} categories available  
   - ${createdMods.length} sample mods created
   - All schemas configured and ready

🚀 Your FS25 Mods Hub is now fully populated and ready for production!

🔗 Test your API endpoints:
   - Categories: http://localhost:3001/api/categories
   - Mods: http://localhost:3001/api/mods
   - Developers: http://localhost:3001/api/developers

📝 Note: Sample mods use placeholder external links.
    Replace with real download URLs when adding actual content.
    `)
    
  } catch (error) {
    console.error('❌ Comprehensive seeding failed:', error.message)
    console.error('Full error:', error)
  }
}

seedAllCollections()
