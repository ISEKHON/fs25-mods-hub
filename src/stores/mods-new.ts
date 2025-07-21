import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Mod, ModCategory } from '@/types'
import { modsApi, categoriesApi, apiCall } from '@/services/api'

export const useModsStore = defineStore('mods', () => {
  // State
  const mods = ref<Mod[]>([])
  const categories = ref<ModCategory[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const totalPages = ref(1)
  const totalMods = ref(0)

  // Computed
  const featuredMods = computed(() => 
    mods.value.filter(mod => mod.featured)
  )

  const getModsByCategory = computed(() => (categoryId: string) =>
    mods.value.filter(mod => mod.category === categoryId)
  )

  // Actions
  async function fetchCategories() {
    try {
      loading.value = true
      error.value = null
      
      const apiCategories = await categoriesApi.getAll()
      
      // Transform API data to frontend format
      categories.value = apiCategories.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        modCount: cat.mod_count || 0
      }))
      
    } catch (err) {
      error.value = 'Failed to load categories'
      console.error('Error fetching categories:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchMods(params: {
    category?: string
    search?: string
    sort?: string
    order?: string
    page?: number
    limit?: number
  } = {}) {
    try {
      loading.value = true
      error.value = null
      
      const response = await modsApi.getAll({
        ...params,
        status: 'approved' // Only get approved mods for public view
      })
      
      // Transform API data to frontend format - using new API structure
      mods.value = response.mods.map((mod: any) => ({
        id: mod.id,
        title: mod.title,
        description: mod.description,
        category: mod.category,
        downloads: mod.downloads || 0,
        version: mod.version || '1.0.0',
        size: formatFileSize(mod.file_size || 0),
        rating: mod.rating || 0,
        ratingCount: mod.rating_count || 0,
        createdAt: formatDate(mod.created_at),
        updatedAt: formatDate(mod.updated_at),
        images: mod.images || mod.screenshots || [],
        video_url: mod.video_url, // Add video URL field
        author: mod.author || {
          id: 'unknown',
          name: 'Unknown',
          avatar: '/default-avatar.png',
          isVerified: false
        },
        features: Array.isArray(mod.tags) ? mod.tags : [],
        changelog: [],
        pricing: {
          type: 'free' as const
        },
        reviews: [],
        featured: mod.featured || false,
        downloadUrl: mod.download_url,
        installationNotes: mod.installation_notes,
        compatibility: mod.compatibility || [],
        modData: mod.modData // Add modData field as well
      }))
      
      // Update pagination
      if (response.pagination) {
        currentPage.value = response.pagination.page || 1
        totalPages.value = response.pagination.pages || 1
        totalMods.value = response.pagination.total || 0
      }
      
    } catch (err) {
      error.value = 'Failed to load mods'
      console.error('Error fetching mods:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchModById(id: string): Promise<Mod | null> {
    try {
      const response = await modsApi.getById(id)
      const mod = response.data || response // Handle both response formats
      
      // Fetch reviews for this mod using apiCall
      let reviews = []
      try {
        const reviewsData = await apiCall(`/reviews/mod/${id}`) as any
        if (reviewsData && reviewsData.reviews) {
          reviews = reviewsData.reviews.map((review: any) => ({
            id: review.id,
            userId: review.user_id || 'user-' + review.id,
            userName: review.username || 'Anonymous',
            userAvatar: review.user_avatar || '/default-avatar.svg',
            rating: review.rating,
            title: '', // Backend doesn't store title
            comment: review.review_text || '',
            createdAt: review.created_at,
            updatedAt: review.updated_at,
            helpful: review.helpful_count || 0,
            notHelpful: 0, // Backend doesn't track this separately
            verified: true,
            version: '1.0.0'
          }))
        }
      } catch (reviewError) {
        console.error('Error fetching reviews:', reviewError)
      }
      
      // Transform and return single mod - using new API structure
      const transformedMod = {
        id: mod.id,
        title: mod.title,
        description: mod.description,
        category: mod.category,
        downloads: mod.downloads || 0,
        version: mod.version || '1.0.0',
        size: mod.size || formatFileSize(mod.file_size || 0),
        rating: mod.rating || 0,
        ratingCount: mod.ratingCount || mod.rating_count || 0,
        createdAt: formatDate(mod.created_at),
        updatedAt: formatDate(mod.updatedAt || mod.updated_at),
        images: mod.images || mod.screenshots || [],
        video_url: mod.video_url, // Add video URL field
        author: mod.author || {
          id: 'unknown',
          name: 'Unknown',
          avatar: '/default-avatar.png',
          isVerified: false
        },
        features: Array.isArray(mod.tags) ? mod.tags : [],
        changelog: mod.changelog || '',
        pricing: mod.pricing || {
          type: 'free' as const
        },
        reviews: reviews,
        featured: mod.featured || false,
        downloadUrl: mod.download_url,
        installationNotes: mod.installation_notes,
        compatibility: mod.compatibility || [],
        modData: mod.modData // Add modData field as well
      }

      // Also add to the local mods array if not already there
      const existingIndex = mods.value.findIndex(m => m.id === mod.id)
      if (existingIndex >= 0) {
        mods.value[existingIndex] = transformedMod
      } else {
        mods.value.push(transformedMod)
      }
      
      return transformedMod
    } catch (err) {
      console.error('Error fetching mod:', err)
      return null
    }
  }

  async function downloadMod(modId: string) {
    try {
      await modsApi.download(modId)
      
      // Update download count locally
      const mod = mods.value.find(m => m.id === modId)
      if (mod) {
        mod.downloads++
      }
    } catch (err) {
      console.error('Error downloading mod:', err)
      throw err
    }
  }

  async function toggleFavorite(modId: string, isFavorited: boolean) {
    try {
      if (isFavorited) {
        await modsApi.unfavorite(modId)
      } else {
        await modsApi.favorite(modId)
      }
      return !isFavorited
    } catch (err) {
      console.error('Error toggling favorite:', err)
      throw err
    }
  }

  // Helper functions
  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  function formatDate(dateString: string): string {
    if (!dateString) return ''
    return new Date(dateString).toISOString().split('T')[0]
  }

  function parseImages(imageUrls: string): Array<{ type: 'image' | 'video', url: string }> {
    if (!imageUrls) return []
    
    return imageUrls.split(',').map(url => ({
      type: 'image' as const,
      url: url.trim()
    }))
  }

  async function fetchFeaturedMods() {
    try {
      loading.value = true
      error.value = null
      
      console.log('🔍 Fetching featured mods...')
      const response = await modsApi.getFeatured()
      console.log('✅ Featured mods response:', response)
      
      // Transform API data to frontend format (response.data.mods for featured mods)
      const featuredModsData = response.data.mods.map((mod: any) => ({
        id: mod.id,
        title: mod.title,
        description: mod.description,
        category: mod.category || mod.category_id,
        downloads: mod.downloads || 0,
        version: mod.version || '1.0.0',
        size: formatFileSize(mod.file_size || 0),
        rating: mod.rating || 0,
        ratingCount: mod.rating_count || 0,
        createdAt: formatDate(mod.created_at),
        updatedAt: formatDate(mod.updated_at),
        images: parseImages(mod.screenshots ? mod.screenshots.join(',') : ''),
        author: {
          id: mod.author?.id || mod.author_id || 'unknown',
          name: mod.author?.name || mod.author || mod.author_name || 'Unknown',
          avatar: mod.author?.avatar || '/default-avatar.svg',
          isVerified: mod.author?.isVerified || mod.author_verified || false
        },
        features: mod.features ? mod.features.split(',') : [],
        changelog: [],
        pricing: {
          type: 'free' as const
        },
        reviews: [],
        featured: mod.featured || false
      }))
      
      // Update or add featured mods to the main mods array
      featuredModsData.forEach(featuredMod => {
        const existingIndex = mods.value.findIndex(m => m.id === featuredMod.id)
        if (existingIndex !== -1) {
          // Update existing mod
          mods.value[existingIndex] = featuredMod
        } else {
          // Add new featured mod
          mods.value.unshift(featuredMod)
        }
      })
      
    } catch (err) {
      error.value = 'Failed to load featured mods'
      console.error('Error fetching featured mods:', err)
    } finally {
      loading.value = false
    }
  }

  async function refreshModReviews(modId: string) {
    try {
      // Re-fetch the mod to get updated reviews
      const updatedMod = await fetchModById(modId)
      return updatedMod
    } catch (err) {
      console.error('Error refreshing mod reviews:', err)
      return null
    }
  }

  // Initialize
  async function initialize() {
    await Promise.all([
      fetchCategories(),
      fetchMods({ limit: 20 })
    ])
  }

  return {
    // State
    mods,
    categories,
    loading,
    error,
    currentPage,
    totalPages,
    totalMods,
    
    // Computed
    featuredMods,
    getModsByCategory,
    
    // Actions
    fetchCategories,
    fetchMods,
    fetchFeaturedMods,
    fetchModById,
    downloadMod,
    toggleFavorite,
    refreshModReviews,
    initialize
  }
})
