import { defineStore } from 'pinia'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { authApi } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const token = ref(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const tokenExpiredMessage = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userName = computed(() => user.value?.username || user.value?.name || '')
  const userEmail = computed(() => user.value?.email || '')
  const userProfile = computed(() => user.value || null)

  // Actions
  const login = async (email: string, password: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await authApi.login(email, password)
      
      // Handle API response structure
      const accessToken = response.tokens?.accessToken || response.token
      token.value = accessToken
      user.value = response.user
      
      // Store in localStorage
      localStorage.setItem('authToken', accessToken)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      return { success: true }
    } catch (err: any) {
      error.value = err.message || 'Login failed'
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const register = async (userData: {
    username: string
    email: string
    password: string
    display_name?: string
  }) => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await authApi.register(userData)
      
      // Handle API response structure
      const accessToken = response.tokens?.accessToken || response.token
      token.value = accessToken
      user.value = response.user
      
      // Store in localStorage
      localStorage.setItem('authToken', accessToken)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      return { success: true }
    } catch (err: any) {
      error.value = err.message || 'Registration failed'
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const logout = async (isTokenExpired = false) => {
    try {
      if (token.value && !isTokenExpired) {
        await authApi.logout()
      }
    } catch (err) {
      console.error('Logout API error:', err)
    } finally {
      // Clear local state regardless of API call result
      token.value = null
      user.value = null
      error.value = null
      
      // Remove from localStorage
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      
      // Set token expired message if applicable
      if (isTokenExpired) {
        tokenExpiredMessage.value = 'Your session has expired. Please log in again.'
      }
    }
  }

  const loadFromStorage = () => {
    const storedToken = localStorage.getItem('authToken')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUser) {
      token.value = storedToken
      try {
        user.value = JSON.parse(storedUser)
      } catch (err) {
        console.error('Error parsing stored user:', err)
        localStorage.removeItem('user')
      }
    }
  }

  const getProfile = async () => {
    if (!token.value) return null
    
    try {
      const profile = await authApi.getProfile()
      user.value = profile
      localStorage.setItem('user', JSON.stringify(profile))
      return profile
    } catch (err) {
      console.error('Error fetching profile:', err)
      return null
    }
  }

  const updateProfile = async (profileData: any) => {
    isLoading.value = true
    error.value = null
    
    try {
      const updatedUser = await authApi.updateProfile(profileData)
      user.value = updatedUser
      localStorage.setItem('user', JSON.stringify(updatedUser))
      return { success: true }
    } catch (err: any) {
      error.value = err.message || 'Profile update failed'
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const clearTokenExpiredMessage = () => {
    tokenExpiredMessage.value = null
  }

  const handleTokenExpired = () => {
    logout(true)
  }

  // Listen for token expiration events
  const setupTokenExpirationListener = () => {
    const handleTokenExpiredEvent = (event: CustomEvent) => {
      handleTokenExpired()
    }

    window.addEventListener('token-expired', handleTokenExpiredEvent as EventListener)
    
    return () => {
      window.removeEventListener('token-expired', handleTokenExpiredEvent as EventListener)
    }
  }

  const getAuthHeaders = () => {
    return token.value ? { Authorization: `Bearer ${token.value}` } : {}
  }

  // Initialize from localStorage and setup listeners
  loadFromStorage()
  const cleanupListener = setupTokenExpirationListener()

  return {
    // State
    user,
    token,
    isLoading,
    error,
    tokenExpiredMessage,
    
    // Getters
    isAuthenticated,
    userName,
    userEmail,
    userProfile,
    
    // Actions
    login,
    register,
    logout,
    loadFromStorage,
    getProfile,
    updateProfile,
    getAuthHeaders,
    clearTokenExpiredMessage,
    handleTokenExpired,
    
    // Cleanup
    cleanup: cleanupListener
  }
})
