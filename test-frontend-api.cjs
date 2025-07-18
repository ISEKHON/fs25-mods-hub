async function testFrontendApi() {
  try {
    console.log('🔍 Testing frontend API integration...');
    
    // Test what the frontend gets when calling the API
    const response = await fetch('http://localhost:5173/api/mods/6879c8a4002b8b795f84');
    if (!response.ok) {
      console.log('❌ Frontend proxy failed, testing direct API...');
      const directResponse = await fetch('http://localhost:3001/api/mods/6879c8a4002b8b795f84');
      if (directResponse.ok) {
        const data = await directResponse.json();
        console.log('✅ Direct API works');
        console.log('🖼️ Images:', JSON.stringify(data.data.images, null, 2));
      } else {
        console.log('❌ Direct API also failed');
      }
    } else {
      const data = await response.json();
      console.log('✅ Frontend proxy works');
      console.log('🖼️ Images:', JSON.stringify(data.data.images, null, 2));
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testFrontendApi();
