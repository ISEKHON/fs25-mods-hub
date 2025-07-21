import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Developer } from '@/types'
import { developersApi } from '@/services/api'

export const useDevelopersStore = defineStore('developers', () => {
  const developers = ref<Developer[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    currentPage: 1,
    totalPages: 1,
    totalDevelopers: 0,
    hasNextPage: false,
    hasPrevPage: false
  })

  // Fetch developers from API
  const fetchDevelopers = async (params: {
    search?: string
    sort?: string
    order?: string
    page?: number
    limit?: number
    featured?: boolean
  } = {}) => {
    loading.value = true
    error.value = null

    try {
      const response = await developersApi.getAll(params)
      
      if (response.success) {
        developers.value = response.data.developers.map(transformDeveloper)
        pagination.value = response.data.pagination
      } else {
        throw new Error(response.message || 'Failed to fetch developers')
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch developers'
      console.error('Error fetching developers:', err)
    } finally {
      loading.value = false
    }
  }

  // Fetch developer by ID
  const fetchDeveloperById = async (id: string): Promise<Developer | null> => {
    try {
      const response = await developersApi.getById(id)
      
      if (response.success) {
        return transformDeveloper(response.data)
      } else {
        throw new Error(response.message || 'Developer not found')
      }
    } catch (err: any) {
      console.error('Error fetching developer:', err)
      return null
    }
  }

  // Transform API response to match frontend Developer interface
  const transformDeveloper = (apiDeveloper: any): Developer => {
    return {
      id: parseInt(apiDeveloper.id) || Math.random(),
      name: apiDeveloper.name,
      role: apiDeveloper.role,
      avatar: apiDeveloper.avatar,
      bio: apiDeveloper.bio,
      specialties: apiDeveloper.specialties || [],
      contact: {
        email: apiDeveloper.contact?.email || '',
        discord: apiDeveloper.contact?.discord || '',
        telegram: apiDeveloper.contact?.telegram || ''
      },
      stats: {
        modsPublished: apiDeveloper.stats.modsPublished,
        totalDownloads: apiDeveloper.stats.totalDownloads,
        yearsActive: apiDeveloper.stats.yearsActive,
        averageRating: parseFloat(apiDeveloper.stats.averageRating) || 0
      },
      featured: apiDeveloper.featured || false,
      joinedDate: apiDeveloper.joinedDate
    }
  }

  // Computed getters for compatibility with existing component
  const getFeaturedDevelopers = computed(() => {
    return developers.value.filter(dev => dev.featured)
  })

  const getDevelopersByRole = (role: string) => {
    return developers.value.filter(dev => 
      dev.role.toLowerCase().includes(role.toLowerCase())
    )
  }

  const getDeveloperById = (id: number) => {
    return developers.value.find(dev => dev.id === id)
  }

  const searchDevelopers = (query: string) => {
    const searchTerm = query.toLowerCase()
    return developers.value.filter(dev => 
      dev.name.toLowerCase().includes(searchTerm) ||
      dev.role.toLowerCase().includes(searchTerm) ||
      dev.specialties.some(specialty => specialty.toLowerCase().includes(searchTerm)) ||
      dev.bio.toLowerCase().includes(searchTerm)
    )
  }

  const sortDevelopers = (sortBy: string) => {
    const sorted = [...developers.value]
    
    switch (sortBy) {
      case 'featured':
        return sorted.sort((a, b) => Number(b.featured) - Number(a.featured))
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name))
      case 'mods':
        return sorted.sort((a, b) => b.stats.modsPublished - a.stats.modsPublished)
      case 'downloads':
        // Convert download strings to numbers for comparison
        const getDownloadNumber = (str: string) => {
          const num = parseFloat(str.replace(/[MK,]/g, ''))
          return str.includes('M') ? num * 1000000 : str.includes('K') ? num * 1000 : num
        }
        return sorted.sort((a, b) => 
          getDownloadNumber(b.stats.totalDownloads) - getDownloadNumber(a.stats.totalDownloads)
        )
      case 'rating':
        return sorted.sort((a, b) => 
          (b.stats.averageRating || 0) - (a.stats.averageRating || 0)
        )
      default:
        return sorted
    }
  }

  const getUniqueRoles = computed(() => {
    const roles = developers.value.map(dev => dev.role)
    return Array.from(new Set(roles))
  })

  // Initialize store
  const init = async () => {
    await fetchDevelopers({ sort: 'featured' })
  }

  return { 
    developers,
    loading,
    error,
    pagination,
    fetchDevelopers,
    fetchDeveloperById,
    getFeaturedDevelopers,
    getDevelopersByRole, 
    getDeveloperById,
    searchDevelopers,
    sortDevelopers,
    getUniqueRoles,
    init
  }
})
