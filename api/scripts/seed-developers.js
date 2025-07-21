import { Client, Databases, ID, Query } from 'node-appwrite'
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

async function seedDevelopers() {
  try {
    console.log('🌱 Seeding DEVELOPERS collection with sample data...')
    
    const databaseId = process.env.APPWRITE_DATABASE_ID
    const collectionId = COLLECTIONS.DEVELOPERS

    // Sample developer profiles (matching the original mock data)
    const developers = [
      {
        // Required old fields
        name: 'SEKHON',
        slug: 'sekhon',
        description: 'Passionate mod creator specializing in detailed vehicle modifications and realistic farming equipment for FS25. Platform owner and lead developer of FS25 Mods Hub.',
        website: 'https://fs25modshub.com',
        logo_url: 'https://cdn.discordapp.com/avatars/442551893638512660/565c937ec6f47af7e5cc553d274f4a90.webp',
        mod_count: 0,
        is_active: true,
        // New user profile fields
        user_id: 'sekhon_001',
        display_name: 'SEKHON',
        role: 'Platform Owner & Lead Developer',
        avatar_url: 'https://cdn.discordapp.com/avatars/442551893638512660/565c937ec6f47af7e5cc553d274f4a90.webp',
        bio: 'Passionate mod creator specializing in detailed vehicle modifications and realistic farming equipment for FS25. Platform owner and lead developer of FS25 Mods Hub.',
        email: 'jagdeepsekhon101@gmail.com',
        telegram: '@MrCode403',
        discord: 'FS25ModsHub#0001',
        specialties: ['Platform Development', 'Mod Creator', 'Community Management', 'Vehicle Mods', 'Scripting'],
        is_featured: true,
        is_verified: true
      },
      {
        // Required old fields
        name: 'Dhillxn',
        slug: 'dhillxn',
        description: 'Modding enthusiast with a passion for community engagement. Specializes in mod conversions and community management.',
        website: '',
        logo_url: 'https://i.ibb.co/GQXHq1f0/dhillon.png',
        mod_count: 0,
        is_active: true,
        // New user profile fields
        user_id: 'dhillxn_001',
        display_name: 'Dhillxn',
        role: 'Modder & Community Manager',
        avatar_url: 'https://i.ibb.co/GQXHq1f0/dhillon.png',
        bio: 'Modding enthusiast with a passion for community engagement. Specializes in mod conversions and community management.',
        email: 'maps@cropmaster.dev',
        telegram: '',
        discord: 'CropMaster#5678',
        specialties: ['Mod Converter', 'Community Management', 'Map Editing'],
        is_featured: true,
        is_verified: true
      },
      {
        // Required old fields
        name: 'FarmTech Pro',
        slug: 'farmtech-pro',
        description: 'Experienced modder focusing on agricultural machinery and advanced farming techniques. Creating high-quality mods for over 5 years.',
        website: 'https://farmtechpro.dev',
        logo_url: 'https://ui-avatars.com/api/?name=FarmTech+Pro&size=300&background=059669&color=fff',
        mod_count: 0,
        is_active: true,
        // New user profile fields
        user_id: 'mod_creator_001',
        display_name: 'FarmTech Pro',
        role: 'Senior Mod Developer',
        avatar_url: 'https://ui-avatars.com/api/?name=FarmTech+Pro&size=300&background=059669&color=fff',
        bio: 'Experienced modder focusing on agricultural machinery and advanced farming techniques. Creating high-quality mods for over 5 years.',
        email: 'contact@farmtechpro.dev',
        telegram: '@FarmTechPro',
        discord: 'FarmTechPro#1234',
        specialties: ['Agricultural Machinery', 'Advanced Scripting', 'Performance Optimization'],
        is_featured: false,
        is_verified: true
      },
      {
        // Required old fields
        name: 'VehicleMaster',
        slug: 'vehiclemaster',
        description: 'Dedicated to creating the most realistic and detailed vehicle mods. From tractors to harvesters, bringing authentic farming experience to FS25.',
        website: '',
        logo_url: 'https://ui-avatars.com/api/?name=VehicleMaster&size=300&background=3b82f6&color=fff',
        mod_count: 0,
        is_active: true,
        // New user profile fields
        user_id: 'vehicle_expert_001',
        display_name: 'VehicleMaster',
        role: 'Vehicle Specialist',
        avatar_url: 'https://ui-avatars.com/api/?name=VehicleMaster&size=300&background=3b82f6&color=fff',
        bio: 'Dedicated to creating the most realistic and detailed vehicle mods. From tractors to harvesters, bringing authentic farming experience to FS25.',
        email: '',
        telegram: '',
        discord: 'VehicleMaster#5678',
        specialties: ['Vehicle Modeling', '3D Design', 'Texture Work', 'Sound Design'],
        is_featured: false,
        is_verified: false
      },
      {
        // Required old fields
        name: 'TerrainCrafter',
        slug: 'terraincrafter',
        description: 'Creating immersive and realistic farming landscapes. Specializing in European-style farms and detailed terrain work.',
        website: 'https://crafter.dev',
        logo_url: 'https://ui-avatars.com/api/?name=TerrainCrafter&size=300&background=16a34a&color=fff',
        mod_count: 0,
        is_active: true,
        // New user profile fields
        user_id: 'map_builder_001',
        display_name: 'TerrainCrafter',
        role: 'Map Designer',
        avatar_url: 'https://ui-avatars.com/api/?name=TerrainCrafter&size=300&background=16a34a&color=fff',
        bio: 'Creating immersive and realistic farming landscapes. Specializing in European-style farms and detailed terrain work.',
        email: 'terrain@crafter.dev',
        telegram: '@TerrainCrafter',
        discord: '',
        specialties: ['Map Design', 'Terrain Modeling', 'Landscape Architecture', 'Environmental Design'],
        is_featured: false,
        is_verified: true
      }
    ]

    // Insert each developer
    for (const developer of developers) {
      try {
        // Check if developer already exists
        const existing = await databases.listDocuments(
          databaseId,
          collectionId,
          [Query.equal('user_id', developer.user_id)]
        )

        if (existing.documents.length > 0) {
          console.log(`⏭️  Developer ${developer.display_name} already exists`)
          continue
        }

        await databases.createDocument(
          databaseId,
          collectionId,
          ID.unique(),
          developer
        )
        
        console.log(`✅ Created developer: ${developer.display_name}`)
        
        // Wait between insertions
        await new Promise(resolve => setTimeout(resolve, 500))
        
      } catch (error) {
        console.error(`❌ Error creating developer ${developer.display_name}:`, error.message)
      }
    }

    console.log('\n🎉 Developer seeding completed!')
    console.log('\n📊 Summary:')
    console.log(`   • ${developers.length} developers defined`)
    console.log(`   • ${developers.filter(d => d.is_featured).length} featured developers`)
    console.log(`   • ${developers.filter(d => d.is_verified).length} verified developers`)
    console.log('\n💡 These developers will now appear on the developers page')
    console.log('   with their custom profiles mixed with calculated mod statistics.')

  } catch (error) {
    console.error('❌ Seeding failed:', error)
  }
}

// Run the seeding
seedDevelopers()
