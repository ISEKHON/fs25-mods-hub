async function quickTest() {
  try {
    console.log('🔍 Testing API...');
    
    // Test mods list
    const response = await fetch('http://localhost:3001/api/mods');
    const data = await response.json();
    
    if (data.success && data.data.mods.length > 0) {
      const mod = data.data.mods[0];
      console.log(`✅ Found mod: ${mod.title}`);
      console.log(`🖼️ Images in list: ${mod.images ? mod.images.length : 0}`);
      
      // Test single mod
      const singleResponse = await fetch(`http://localhost:3001/api/mods/${mod.id}`);
      if (singleResponse.ok) {
        const singleData = await singleResponse.json();
        if (singleData.success) {
          console.log(`✅ Single mod fetch works`);
          console.log(`🖼️ Images in single: ${singleData.data.images ? singleData.data.images.length : 0}`);
          if (singleData.data.images && singleData.data.images.length > 0) {
            singleData.data.images.forEach((img, i) => {
              console.log(`  ${i+1}. ${img.type}: ${img.url}`);
            });
          }
        } else {
          console.log(`❌ Single mod API error: ${singleData.message}`);
        }
      } else {
        console.log(`❌ Single mod fetch failed: ${singleResponse.status}`);
      }
    } else {
      console.log('❌ No mods found in list');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

quickTest();
