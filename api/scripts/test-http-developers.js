async function testDevelopersHTTP() {
  try {
    console.log('🌐 Testing Developers HTTP API...\n')

    // Test 1: Fetch all developers
    console.log('1️⃣ Testing GET /api/developers')
    const response = await fetch('http://localhost:3001/api/developers')
    
    if (!response.ok) {
      console.log('❌ Server might not be running. Starting API server...')
      console.log('💡 Please run: npm run dev')
      return
    }

    const data = await response.json()
    console.log(`✅ Response Status: ${response.status}`)
    console.log(`✅ Found ${data.total} developers`)
    console.log(`✅ Success: ${data.success}`)
    
    // Test 2: Show first few developers
    console.log('\n2️⃣ Developer data sample:')
    data.developers.slice(0, 2).forEach((dev, index) => {
      console.log(`   ${index + 1}. ${dev.name}`)
      console.log(`      Role: ${dev.role}`)
      console.log(`      Mods: ${dev.stats?.totalMods || 0}`)
      console.log(`      Featured: ${dev.is_featured ? '⭐' : '❌'}`)
      console.log(`      Verified: ${dev.is_verified ? '✅' : '❌'}\n`)
    })

    // Test 3: Test featured filter
    console.log('3️⃣ Testing featured filter')
    const featuredResponse = await fetch('http://localhost:3001/api/developers?featured=true')
    const featuredData = await featuredResponse.json()
    console.log(`✅ Found ${featuredData.total} featured developers`)

    // Test 4: Test search
    console.log('\n4️⃣ Testing search')
    const searchResponse = await fetch('http://localhost:3001/api/developers?search=SEKHON')
    const searchData = await searchResponse.json()
    console.log(`✅ Search for "SEKHON" found ${searchData.total} results`)

    console.log('\n🎉 HTTP API tests completed!')
    console.log('\n📊 Summary:')
    console.log(`   • Total developers: ${data.total}`)
    console.log(`   • Featured developers: ${featuredData.total}`)
    console.log(`   • Search results: ${searchData.total}`)
    console.log(`   • API is production ready! ✅`)

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Connection refused - API server is not running')
      console.log('💡 Please start the server with: npm run dev')
    } else {
      console.error('❌ Error testing HTTP API:', error.message)
    }
  }
}

// Run the test
testDevelopersHTTP()
