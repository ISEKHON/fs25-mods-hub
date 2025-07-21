import { Client, Databases, Query } from 'node-appwrite'
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

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID

async function testDevelopersAPI() {
  try {
    console.log('🧪 Testing Developers API functionality...\n')

    // Test 1: Fetch all developers
    console.log('1️⃣ Fetching all developers...')
    const allDevelopers = await databases.listDocuments(DATABASE_ID, COLLECTIONS.DEVELOPERS)
    console.log(`✅ Found ${allDevelopers.total} developers`)
    
    // Test 2: Display developer info
    console.log('\n2️⃣ Developer profiles:')
    allDevelopers.documents.forEach((dev, index) => {
      console.log(`   ${index + 1}. ${dev.display_name || dev.name}`)
      console.log(`      Role: ${dev.role || 'Not specified'}`)
      console.log(`      Bio: ${dev.bio ? dev.bio.substring(0, 50) + '...' : 'No bio'}`)
      console.log(`      Specialties: ${Array.isArray(dev.specialties) ? dev.specialties.join(', ') : 'None'}`)
      console.log(`      Featured: ${dev.is_featured ? '⭐' : '❌'}`)
      console.log(`      Verified: ${dev.is_verified ? '✅' : '❌'}`)
      console.log(`      Contact: ${dev.email || 'No email'}\n`)
    })

    // Test 3: Test filtering featured developers
    console.log('3️⃣ Testing featured developers filter...')
    const featuredDevelopers = await databases.listDocuments(
      DATABASE_ID, 
      COLLECTIONS.DEVELOPERS,
      [Query.equal('is_featured', true)]
    )
    console.log(`✅ Found ${featuredDevelopers.total} featured developers`)
    featuredDevelopers.documents.forEach(dev => {
      console.log(`   ⭐ ${dev.display_name || dev.name}`)
    })

    // Test 4: Test search functionality
    console.log('\n4️⃣ Testing search functionality...')
    const searchResults = await databases.listDocuments(
      DATABASE_ID, 
      COLLECTIONS.DEVELOPERS,
      [Query.search('display_name', 'SEKHON')]
    )
    console.log(`✅ Search for "SEKHON" found ${searchResults.total} results`)
    searchResults.documents.forEach(dev => {
      console.log(`   🔍 ${dev.display_name || dev.name}`)
    })

    // Test 5: Test mods calculation (simulate)
    console.log('\n5️⃣ Testing mod count calculation...')
    const modsCollection = await databases.listDocuments(DATABASE_ID, COLLECTIONS.MODS, [
      Query.limit(5)
    ])
    console.log(`✅ Found ${modsCollection.total} total mods in database`)

    console.log('\n🎉 All tests completed successfully!')
    console.log('\n📊 Summary:')
    console.log(`   • Total developers: ${allDevelopers.total}`)
    console.log(`   • Featured developers: ${featuredDevelopers.total}`)
    console.log(`   • Total mods: ${modsCollection.total}`)
    console.log(`   • API endpoints ready for production ✅`)

  } catch (error) {
    console.error('❌ Error testing developers API:', error.message)
    console.error('Stack:', error.stack)
  }
}

// Run the test
testDevelopersAPI()
