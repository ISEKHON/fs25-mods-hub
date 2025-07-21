import { Client, Databases } from 'node-appwrite'
import { config } from 'dotenv'

// Load environment variables
config()

const client = new Client()
const databases = new Databases(client)

client
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY)

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID

async function fixCollectionIssues() {
  console.log('🔧 Fixing collection schema issues...\n')
  
  const MOD_DOWNLOADS_ID = '6879dbf000258b547340'
  const MOD_REPORTS_ID = '6879dbd60008ba363247'
  
  try {
    // Fix MOD_DOWNLOADS - remove download_timestamp requirement
    console.log('📝 Fixing MOD_DOWNLOADS collection...')
    try {
      await databases.deleteAttribute(DATABASE_ID, MOD_DOWNLOADS_ID, 'download_timestamp')
      console.log('  ✅ Removed download_timestamp attribute')
      await new Promise(resolve => setTimeout(resolve, 2000))
    } catch (error) {
      console.log('  ℹ️ download_timestamp attribute may not exist')
    }
    
    // Check MOD_REPORTS status attribute
    console.log('\n📝 Checking MOD_REPORTS collection...')
    try {
      // Try to create status attribute if it doesn't exist
      await databases.createStringAttribute(
        DATABASE_ID,
        MOD_REPORTS_ID,
        'status',
        20,
        false  // Not required so we can set a default
      )
      console.log('  ✅ Added status attribute')
      await new Promise(resolve => setTimeout(resolve, 2000))
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('  ℹ️ Status attribute already exists')
      } else {
        console.log('  ⚠️ Error with status attribute:', error.message)
      }
    }
    
    console.log('\n🎉 Collection fixes completed!')
    
  } catch (error) {
    console.error('❌ Error fixing collections:', error)
  }
}

// Run the fix
fixCollectionIssues()
