// API Service for FS25 Mods Hub
// Connects frontend to the backend API

const API_BASE_URL = 'http://localhost:3001/api'

// Helper function for API calls
export async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    // Get auth token and include it in headers
    const token = getAuthToken()
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }
    
    if (token) {
      (headers as Record<string, string>).Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers,
      ...options,
    })

    // Handle token expiration
    if (response.status === 401) {
      const errorData = await response.json().catch(() => ({}))
      
      // Check if it's a token expiration error
      if (errorData.message?.includes('token') || errorData.message?.includes('expired') || 
          errorData.message?.includes('unauthorized') || errorData.error === 'TokenExpiredError') {
        
        // Clear stored auth data
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
        
        // Trigger a custom event that the auth store can listen to
        window.dispatchEvent(new CustomEvent('token-expired', {
          detail: { message: 'Your session has expired. Please log in again.' }
        }))
        
        throw new Error('Session expired. Please log in again.')
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `API call failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.message || 'API call failed')
    }

    return data  // Return full response instead of just data.data
  } catch (error) {
    console.error(`API Error for ${endpoint}:`, error)
    throw error
  }
}

// Helper function for API calls with FormData (file uploads)
export async function apiCallFormData<T>(endpoint: string, formData: FormData): Promise<T> {
  try {
    const token = getAuthToken()
    const headers: Record<string, string> = {}
    
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    })

    // Handle token expiration
    if (response.status === 401) {
      const errorData = await response.json().catch(() => ({}))
      
      // Check if it's a token expiration error
      if (errorData.message?.includes('token') || errorData.message?.includes('expired') || 
          errorData.message?.includes('unauthorized') || errorData.error === 'TokenExpiredError') {
        
        // Clear stored auth data
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
        
        // Trigger a custom event that the auth store can listen to
        window.dispatchEvent(new CustomEvent('token-expired', {
          detail: { message: 'Your session has expired. Please log in again.' }
        }))
        
        throw new Error('Session expired. Please log in again.')
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `API call failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.message || 'API call failed')
    }

    return data.data
  } catch (error) {
    console.error(`API Error for ${endpoint}:`, error)
    throw error
  }
}

// Auth token helpers
function getAuthToken(): string | null {
  return localStorage.getItem('authToken')
}

function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Categories API
export const categoriesApi = {
  async getAll(includeCount: boolean = true): Promise<any[]> {
    return apiCall(`/categories?include_count=${includeCount}`)
  },

  async getById(id: string): Promise<any> {
    return apiCall(`/categories/${id}`)
  }
}

// Mods API
export const modsApi = {
  async getAll(params: {
    category?: string
    search?: string
    sort?: string
    order?: string
    page?: number
    limit?: number
    status?: string
  } = {}): Promise<{ mods: any[], pagination: any }> {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString())
      }
    })

    const queryString = searchParams.toString()
    const endpoint = queryString ? `/mods?${queryString}` : '/mods'
    
    return apiCall(endpoint)
  },

  async getById(id: string): Promise<any> {
    return apiCall(`/mods/${id}`)
  },

  async getBySlug(slug: string): Promise<any> {
    return apiCall(`/mods/slug/${slug}`)
  },

  async download(id: string): Promise<any> {
    const headers = getAuthHeaders()
    return apiCall(`/mods/${id}/download`, {
      method: 'POST',
      headers
    })
  },

  async favorite(id: string): Promise<any> {
    const headers = getAuthHeaders()
    return apiCall(`/mods/${id}/favorite`, {
      method: 'POST',
      headers
    })
  },

  async unfavorite(id: string): Promise<any> {
    const headers = getAuthHeaders()
    return apiCall(`/mods/${id}/favorite`, {
      method: 'DELETE',
      headers
    })
  },

  async getFeatured(): Promise<any> {
    return apiCall('/mods?featured=true&limit=6')
  }
}

// Developers API
export const developersApi = {
  async getAll(params?: {
    search?: string
    sort?: string
    order?: string
    page?: number
    limit?: number
    featured?: boolean
  }): Promise<any> {
    const queryParams = new URLSearchParams()
    
    if (params?.search) queryParams.append('search', params.search)
    if (params?.sort) queryParams.append('sort', params.sort)
    if (params?.order) queryParams.append('order', params.order)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.featured) queryParams.append('featured', 'true')

    const endpoint = `/developers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return apiCall(endpoint)
  },

  async getById(id: string): Promise<any> {
    return apiCall(`/developers/${id}`)
  },

  async getBySlug(slug: string): Promise<any> {
    return apiCall(`/developers/${slug}`)
  }
}

// Reviews API
export const reviewsApi = {
  async getByModId(modId: string): Promise<any[]> {
    return apiCall(`/mods/${modId}/reviews`)
  },

  async create(modId: string, review: {
    rating: number
    review_text?: string
  }): Promise<any> {
    const headers = getAuthHeaders()
    return apiCall(`/mods/${modId}/reviews`, {
      method: 'POST',
      headers,
      body: JSON.stringify(review)
    })
  },

  async update(reviewId: string, review: {
    rating: number
    review_text?: string
  }): Promise<any> {
    const headers = getAuthHeaders()
    return apiCall(`/reviews/${reviewId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(review)
    })
  },

  async delete(reviewId: string): Promise<any> {
    const headers = getAuthHeaders()
    return apiCall(`/reviews/${reviewId}`, {
      method: 'DELETE',
      headers
    })
  }
}

// Auth API
export const authApi = {
  async login(email: string, password: string): Promise<any> {
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
  },

  async register(userData: {
    email: string
    password: string
    username: string
    display_name?: string
  }): Promise<any> {
    return apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    })
  },

  async logout(): Promise<any> {
    const headers = getAuthHeaders()
    return apiCall('/auth/logout', {
      method: 'POST',
      headers
    })
  },

  async getProfile(): Promise<any> {
    const headers = getAuthHeaders()
    return apiCall('/auth/profile', { headers })
  },

  async updateProfile(profileData: any): Promise<any> {
    const headers = getAuthHeaders()
    return apiCall('/auth/profile', {
      method: 'PUT',
      headers,
      body: JSON.stringify(profileData)
    })
  }
}

// Submissions API
export const submissionsApi = {
  async create(modData: {
    title: string
    description: string
    category_id: string
    author_name: string
    version?: string
    download_url: string
    image_urls?: string
    tags?: string
  }): Promise<any> {
    const headers = getAuthHeaders()
    return apiCall('/submissions', {
      method: 'POST',
      headers,
      body: JSON.stringify(modData)
    })
  },

  async createWithFiles(formData: FormData): Promise<any> {
    return apiCallFormData('/submissions', formData)
  },

  async getByUser(): Promise<any[]> {
    const headers = getAuthHeaders()
    return apiCall('/submissions/my-submissions', { headers })
  },

  async getById(id: string): Promise<any> {
    const headers = getAuthHeaders()
    return apiCall(`/submissions/${id}`, { headers })
  }
}

// Admin API
export const adminApi = {
  async getStats(): Promise<any> {
    return apiCall('/admin/stats')
  },

  async getUsers(page = 1, limit = 20, search?: string): Promise<any> {
    let endpoint = `/admin/users?page=${page}&limit=${limit}`
    if (search) endpoint += `&search=${search}`
    return apiCall(endpoint)
  },

  async updateUserStatus(userId: string, updates: { is_active?: boolean, is_verified?: boolean }): Promise<any> {
    return apiCall(`/admin/users/${userId}/update-status`, {
      method: 'POST',
      body: JSON.stringify(updates)
    })
  },

  async getPendingSubmissions(page = 1, limit = 20): Promise<any> {
    return apiCall(`/admin/submissions/pending?page=${page}&limit=${limit}`)
  },

  async getSubmissions(status?: string): Promise<any[]> {
    const endpoint = status ? `/admin/submissions?status=${status}` : '/admin/submissions'
    return apiCall(endpoint)
  },

  async approveSubmission(id: string, admin_notes?: string): Promise<any> {
    return apiCall(`/admin/submissions/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ admin_notes })
    })
  },

  async rejectSubmission(id: string, reason: string): Promise<any> {
    return apiCall(`/admin/submissions/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    })
  }
}

// Stats API
export const statsApi = {
  async getOverview(): Promise<any> {
    return apiCall('/stats')
  },

  async getModStats(modId: string): Promise<any> {
    return apiCall(`/stats/mods/${modId}`)
  }
}
