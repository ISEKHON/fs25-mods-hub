// Collection IDs for FS25 Mods Hub Database
// Generated from your Appwrite database: 68774db300155aa6599d

export const COLLECTIONS = {
  USER_PROFILES: '68776bbd00288ffb2a73',
  USER_SESSIONS: '68776bc7002c0724e512', 
  USER_ACTIVITIES: '68776bd2000bb8de8122',
  MODS: '68776c9f002485cdf793',
  MOD_CATEGORIES: '68776ca90006a668031e',
  MOD_REVIEWS: '6879dbbe003495ae40fe',
  MOD_DOWNLOADS: '6879dbf000258b547340',
  MOD_REPORTS: '6879dbd60008ba363247',
  DEVELOPERS: '68776cca0037273ca0d9',
  MOD_SUBMISSIONS: '68776cd3000a7a75f47b',
  USER_FAVORITES: '68776cdc001bd2e9ea11',
  NOTIFICATIONS: '68776cf8003e1a3169b4'
}

// For easy reference in your API routes
export const DB_ID = process.env.APPWRITE_DATABASE_ID || '68774db300155aa6599d'

// Helper function to get collection ID by name
export function getCollectionId(collectionName) {
  const mapping = {
    'user_profiles': COLLECTIONS.USER_PROFILES,
    'user_sessions': COLLECTIONS.USER_SESSIONS,
    'user_activities': COLLECTIONS.USER_ACTIVITIES,
    'mods': COLLECTIONS.MODS,
    'mod_categories': COLLECTIONS.MOD_CATEGORIES,
    'mod_reviews': COLLECTIONS.MOD_REVIEWS,
    'mod_downloads': COLLECTIONS.MOD_DOWNLOADS,
    'developers': COLLECTIONS.DEVELOPERS,
    'mod_submissions': COLLECTIONS.MOD_SUBMISSIONS,
    'user_favorites': COLLECTIONS.USER_FAVORITES,
    'notifications': COLLECTIONS.NOTIFICATIONS,
    'reports': COLLECTIONS.REPORTS
  }
  
  return mapping[collectionName] || collectionName
}
