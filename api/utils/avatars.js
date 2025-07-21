// Global avatar utility for fetching user avatars from USER_PROFILES
import { databases } from '../config/appwrite.js'
import { COLLECTIONS } from '../config/collections.js'

/**
 * Fetch user avatar from USER_PROFILES collection
 * @param {string} userId - The user ID to fetch avatar for
 * @param {string} username - Optional username for fallback avatar generation
 * @returns {Promise<string|null>} - Avatar URL or null if not found
 */
export async function getUserAvatar(userId, username = null) {
  if (!userId) return null
  
  try {
    const userProfile = await databases.getDocument(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTIONS.USER_PROFILES,
      userId
    )
    return userProfile.avatar_url || null
  } catch (error) {
    // User profile not found - try to generate a fallback avatar if username is provided
    if (username) {
      const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&size=300&background=059669&color=fff`
      return fallbackAvatar
    }
    
    return null
  }
}

/**
 * Fetch multiple user avatars efficiently
 * @param {string[]} userIds - Array of user IDs
 * @param {Object} usernameMap - Optional mapping of userId to username for fallbacks
 * @returns {Promise<Object>} - Object mapping userId to avatar_url
 */
export async function getUserAvatars(userIds, usernameMap = {}) {
  if (!userIds || userIds.length === 0) return {}
  
  const avatarMap = {}
  
  // Use Promise.all for concurrent requests
  await Promise.all(userIds.map(async (userId) => {
    const username = usernameMap[userId]
    avatarMap[userId] = await getUserAvatar(userId, username)
  }))
  
  return avatarMap
}

/**
 * Enrich data objects with user avatars
 * @param {Array} items - Array of objects containing user_id field
 * @param {string} userIdField - Name of the field containing user ID (default: 'user_id')
 * @param {string} avatarField - Name of the field to add avatar to (default: 'user_avatar')
 * @param {string} usernameField - Name of the field containing username for fallback (default: 'username')
 * @returns {Promise<Array>} - Items enriched with avatar data
 */
export async function enrichWithAvatars(items, userIdField = 'user_id', avatarField = 'user_avatar', usernameField = 'username') {
  if (!items || items.length === 0) return items
  
  // Add avatars to items individually to allow for username fallbacks
  return await Promise.all(items.map(async item => {
    const userId = item[userIdField]
    const username = item[usernameField]
    const avatar = await getUserAvatar(userId, username)
    
    return {
      ...item,
      [avatarField]: avatar
    }
  }))
}
