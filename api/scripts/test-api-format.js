// Test API response format
async function testAPI() {
  try {
    const response = await fetch('http://localhost:3001/api/developers')
    const data = await response.json()
    
    console.log('=== API RESPONSE FORMAT ===')
    console.log('Status:', response.status)
    console.log('Response keys:', Object.keys(data))
    console.log('Success:', data.success)
    
    if (data.data) {
      console.log('Data keys:', Object.keys(data.data))
      if (data.data.developers) {
        console.log('Developers count:', data.data.developers.length)
        console.log('First developer:', JSON.stringify(data.data.developers[0], null, 2))
      }
    }
    
    console.log('\n=== FULL RESPONSE ===')
    console.log(JSON.stringify(data, null, 2))
    
  } catch (error) {
    console.error('API Test Error:', error.message)
  }
}

testAPI()
