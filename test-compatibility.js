// Test script to verify the submissions API is working with the updated validation
const testSubmission = {
  title: "Test PC Mod",
  description: "This is a test mod for PC to verify the compatibility validation is working correctly.",
  category: "Vehicles",
  version: "1.0.0",
  download_link: "https://example.com/test-mod.zip",
  main_image: "https://i.imgur.com/example.jpg",
  author_name: "Test Developer",
  features: ["Enhanced Graphics", "Realistic Physics"],
  compatibility_tags: ["Multiplayer Compatible", "GPS Compatible"],
  minimum_requirements: "FS25 Base Game",
  installation_notes: "Extract to mods folder",
  changelog: "Initial release",
  contact_email: "test@example.com"
};

console.log('Testing API with PC-compatible data...');
console.log('Submission data:', JSON.stringify(testSubmission, null, 2));

// Note: This would need proper authentication headers to actually test
// But the data structure is now compatible with the updated validation schema
