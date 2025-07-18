const fetch = require('node-fetch');

async function testModImages() {
  try {
    console.log('🔍 Testing mod images...');
    
    // First get a mod from the list
    const modsResponse = await fetch('http://localhost:3001/api/mods');
    if (!modsResponse.ok) {
      throw new Error(`Mods list failed: ${modsResponse.status}`);
    }
    
    const modsData = await modsResponse.json();
    if (!modsData.success || !modsData.data || modsData.data.length === 0) {
      throw new Error('No mods found in the list');
    }
    
    const firstMod = modsData.data[0];
    console.log(`📋 First mod: ${firstMod.title} (ID: ${firstMod.id})`);
    
    // Now get the specific mod
    const modResponse = await fetch(`http://localhost:3001/api/mods/${firstMod.id}`);
    if (!modResponse.ok) {
      throw new Error(`Mod fetch failed: ${modResponse.status} - ${await modResponse.text()}`);
    }
    
    const modData = await modResponse.json();
    if (!modData.success) {
      throw new Error(`API returned error: ${modData.message}`);
    }
    
    const mod = modData.data;
    console.log(`✅ Mod fetched: ${mod.title}`);
    console.log(`🖼️ Images count: ${mod.images ? mod.images.length : 0}`);
    
    if (mod.images && mod.images.length > 0) {
      console.log('📷 Images:');
      mod.images.forEach((img, index) => {
        console.log(`  ${index + 1}. Type: ${img.type}, URL: ${img.url}`);
      });
    } else {
      console.log('❌ No images found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testModImages();
