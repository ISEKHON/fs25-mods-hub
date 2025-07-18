// Simple API connection test
const PORT = process.env.PORT || 3000

console.log('Testing API connection...')

// Test if server is running
fetch(`http://localhost:${PORT}/api/mods`)
  .then(response => {
    console.log(`API server responding on port ${PORT}:`, response.status)
    return response.json()
  })
  .then(data => {
    console.log('Mods list response:', {
      success: data.success,
      modsCount: data.data?.mods?.length || 0,
      pagination: data.data?.pagination
    })
    
    // Test single mod endpoint if we have mods
    if (data.data?.mods?.length > 0) {
      const firstModId = data.data.mods[0].id
      console.log(`Testing single mod endpoint with ID: ${firstModId}`)
      
      return fetch(`http://localhost:${PORT}/api/mods/${firstModId}`)
    }
  })
  .then(response => {
    if (response) {
      console.log('Single mod response status:', response.status)
      return response.json()
    }
  })
  .then(data => {
    if (data) {
      console.log('Single mod data structure:', {
        success: data.success,
        hasAuthor: !!data.data?.author,
        hasScreenshots: !!data.data?.screenshots,
        hasSize: !!data.data?.size,
        authorName: data.data?.author?.name,
        screenshotsCount: data.data?.screenshots?.length || 0
      })
    }
  })
  .catch(error => {
    console.error('API test failed:', error.message)
  })
