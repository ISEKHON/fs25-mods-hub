import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Mod, ModCategory, ModAuthor } from '@/types'

export const useModsStore = defineStore('mods', () => {
  const mods = ref<Mod[]>([
    {
      id: '1',
      title: 'Swaraj 855',
      description: 'High-detail Swaraj 855 tractor with realistic physics and customization options.',
      category: 'Vehicles',
      downloads: 1245,
      version: '1.2.0',
      size: '45.2 MB',
      rating: 4.8,
      ratingCount: 86,
      createdAt: '2025-07-10',
      updatedAt: '2025-07-14',
      images: [
        { type: 'image', url: 'https://i.ibb.co/yFxzBD8T/icon-SEKHON.png' },
        { type: 'image', url: 'https://i.ibb.co/Hp2gxR3H/store.png' },
        { type: 'image', url: 'https://i.ibb.co/ZzLnqPrM/SEKHON-360-Icon-1.png' },
        { type: 'image', url: 'https://i.ibb.co/Mk5xmmmG/SEKHON-360-Icon-6.png' },
        { type: 'image', url: 'https://i.ibb.co/MyhsbrHK/SEKHON-360-Icon-8.png' },
        { type: 'image', url: 'https://i.ibb.co/dJkF4WjB/Screenshot-42.png' }
      ],
      author: {
        id: '1',
        name: 'SEKHON',
        avatar: 'https://cdn.discordapp.com/avatars/442551893638512660/565c937ec6f47af7e5cc553d274f4a90.webp',
        isVerified: true
      },
      features: [
        'Multiple variants included',
        'Realistic physics',
        'Customizable options',
        'Advanced lighting'
      ],
      requirements: {
        min: 'Farming Simulator 25, 2GB free disk space',
        recommended: 'Farming Simulator 25 with latest patch, 4GB free disk space'
      },
      pricing: {
        type: 'paid',
        price: 12.99,
        currency: 'USD',
        originalPrice: 15.99,
        discountPercentage: 19,
        saleEndDate: '2025-07-31'
      },
      changelog: [
        {
          version: '1.2.0',
          date: '2025-07-14',
          changes: [
            'Added new paint configurations',
            'Fixed tire pressure display',
            'Improved engine sound quality',
            'Updated interior textures'
          ]
        },
        {
          version: '1.1.5',
          date: '2025-07-10',
          changes: [
            'Fixed hydraulic system animations',
            'Corrected wheel alignment issues',
            'Added seasonal tire options'
          ]
        },
        {
          version: '1.1.0',
          date: '2025-07-05',
          changes: [
            'Initial release for FS25',
            'Complete model overhaul',
            'Added GPS navigation system',
            'Improved physics simulation'
          ]
        }
      ],
      reviews: [
        
      ]
    },
    {
      id: '2',
      title: 'John Deere 8R Series',
      description: 'Powerful John Deere 8R series tractor with multiple configurations and realistic features.',
      category: 'Vehicles',
      downloads: 2856,
      version: '2.1.0',
      size: '68.5 MB',
      rating: 4.9,
      ratingCount: 142,
      createdAt: '2025-07-08',
      updatedAt: '2025-07-13',
      images: [
        { type: 'image', url: 'https://images.unsplash.com/photo-1574634534894-89d94f02bace?w=400&h=300&fit=crop' },
        { type: 'image', url: 'https://images.unsplash.com/photo-1595429035839-c99c298ffdde?w=400&h=300&fit=crop' }
      ],
      author: {
        id: '2',
        name: 'FarmTech Studios',
        avatar: 'https://via.placeholder.com/150x150/e74c3c/ffffff?text=FT',
        isVerified: true
      },
      features: [
        'Multiple engine options',
        'Realistic cab interior',
        'Custom paint jobs',
        'Working lights'
      ],
      requirements: {
        min: 'Farming Simulator 25, 3GB free disk space',
        recommended: 'Farming Simulator 25 with latest patch, 6GB free disk space'
      },
      pricing: {
        type: 'free'
      },
      changelog: [
        {
          version: '2.1.0',
          date: '2025-07-13',
          changes: [
            'Added dual-wheel configuration',
            'New cabin interior options',
            'Enhanced lighting system',
            'Improved fuel consumption accuracy'
          ]
        },
        {
          version: '2.0.5',
          date: '2025-07-08',
          changes: [
            'Fixed transmission issues',
            'Added front loader attachment support',
            'Updated engine performance curves'
          ]
        },
        {
          version: '2.0.0',
          date: '2025-06-28',
          changes: [
            'Complete rebuild for FS25',
            'New 8R 410 and 8R 370 variants',
            'Realistic hydraulic system',
            'Advanced precision farming compatibility'
          ]
        }
      ]
    },
    {
      id: '3',
      title: 'Fendt Vario 1000',
      description: 'High-end Fendt Vario 1000 series with advanced features and premium quality.',
      category: 'Vehicles',
      downloads: 1892,
      version: '1.5.2',
      size: '72.3 MB',
      rating: 4.7,
      ratingCount: 98,
      createdAt: '2025-07-05',
      updatedAt: '2025-07-12',
      images: [
        { type: 'image', url: 'https://images.unsplash.com/photo-1621155346337-1d19476ba7d6?w=400&h=300&fit=crop' },
        { type: 'image', url: 'https://images.unsplash.com/photo-1605541071977-f3e5d00b3e23?w=400&h=300&fit=crop' }
      ],
      author: {
        id: '3',
        name: 'ModMaster Pro',
        avatar: 'https://via.placeholder.com/150x150/3498db/ffffff?text=MP',
        isVerified: false
      },
      features: [
        'CVT transmission',
        'Precision steering',
        'LED work lights',
        'Custom decals'
      ],
      requirements: {
        min: 'Farming Simulator 25, 3GB free disk space',
        recommended: 'Farming Simulator 25 with latest patch, 6GB free disk space'
      },
      pricing: {
        type: 'paid',
        price: 8.99,
        currency: 'USD'
      },
      changelog: [
        {
          version: '1.5.2',
          date: '2025-07-12',
          changes: [
            'Fixed CVT transmission gear ratios',
            'Improved cabin suspension',
            'Added new wheel configurations',
            'Enhanced GPS display accuracy'
          ]
        },
        {
          version: '1.5.0',
          date: '2025-07-08',
          changes: [
            'Added Vario 1050 variant',
            'New precision farming features',
            'Updated engine sounds',
            'Improved 3D model details'
          ]
        },
        {
          version: '1.4.5',
          date: '2025-06-30',
          changes: [
            'Fixed hydraulic system bugs',
            'Added rear weight options',
            'Improved fuel tank capacity display'
          ]
        }
      ]
    },
    {
      id: '4',
      title: 'Case IH Optum',
      description: 'Versatile Case IH Optum tractor perfect for heavy-duty farming operations.',
      category: 'Vehicles',
      downloads: 1456,
      version: '1.3.1',
      size: '55.8 MB',
      rating: 1.6,
      ratingCount: 76,
      createdAt: '2025-07-02',
      updatedAt: '2025-07-11',
      images: [
        { type: 'image', url: 'https://images.unsplash.com/photo-1568605117036-3c6b3b6d8933?w=400&h=300&fit=crop' }
      ],
      author: {
        id: '4',
        name: 'AgriMods',
        avatar: 'https://via.placeholder.com/150x150/27ae60/ffffff?text=AM',
        isVerified: true
      },
      features: [
        'Heavy-duty chassis',
        'Premium sound pack',
        'Multiple wheel options',
        'Realistic physics'
      ],
      requirements: {
        min: 'Farming Simulator 25, 2.5GB free disk space',
        recommended: 'Farming Simulator 25 with latest patch, 5GB free disk space'
      },
      pricing: {
        type: 'paid',
        price: 18.99,
        currency: 'INR',
        originalPrice: 24.99,
        discountPercentage: 24,
        saleEndDate: '2025-08-15'
      }
    },
    // More mods...
  ])

  // Default category icons mapping
  const categoryIconMap: Record<string, string> = {
    'Vehicles': 'tractor',
    'Harvesters': 'tractor',
    'Tools': 'tools',
    'Maps': 'map',
    'Animals': 'horse',
    'Buildings': 'warehouse',
    'Scripts': 'code',
    'Trailers': 'truck',
    'Equipment': 'cogs',
    'Implements': 'wrench',
    'Forestry': 'tree',
    'Mowers': 'leaf',
    'Seeders': 'seedling',
    'Plows': 'plow',
    'Cultivators': 'soil'
  }

  const categories = ref<ModCategory[]>([])

  const getModById = (id: string) => {
    return mods.value.find(mod => mod.id === id)
  }

  const getModsByCategory = (categoryName: string) => {
    return mods.value.filter(mod => mod.category === categoryName)
  }

  const getModsByCategoryId = (categoryId: string) => {
    const category = categories.value.find(cat => cat.id === categoryId)
    return category ? mods.value.filter(mod => mod.category === category.name) : []
  }

  const updateCategoryCounts = () => {
    // Get all unique categories from mods
    const categorySet = new Set(mods.value.map(mod => mod.category))
    const uniqueCategories = Array.from(categorySet)
    
    // Create or update categories
    const updatedCategories: ModCategory[] = []
    
    uniqueCategories.forEach((categoryName, index) => {
      const existingCategory = categories.value.find(cat => cat.name === categoryName)
      const modCount = mods.value.filter(mod => mod.category === categoryName).length
      
      if (existingCategory) {
        // Update existing category
        updatedCategories.push({
          ...existingCategory,
          modCount
        })
      } else {
        // Create new category
        updatedCategories.push({
          id: String(Date.now() + index), // Generate unique ID
          name: categoryName,
          icon: categoryIconMap[categoryName] || 'folder', // Use mapped icon or default
          modCount
        })
      }
    })
    
    // Sort categories by name
    updatedCategories.sort((a, b) => a.name.localeCompare(b.name))
    
    categories.value = updatedCategories
  }

  const addMod = (newMod: Mod) => {
    mods.value.push(newMod)
    updateCategoryCounts()
  }

  const removeMod = (modId: string) => {
    const index = mods.value.findIndex(mod => mod.id === modId)
    if (index !== -1) {
      mods.value.splice(index, 1)
      updateCategoryCounts()
    }
  }

  const updateMod = (modId: string, updatedMod: Partial<Mod>) => {
    const index = mods.value.findIndex(mod => mod.id === modId)
    if (index !== -1) {
      mods.value[index] = { ...mods.value[index], ...updatedMod }
      updateCategoryCounts()
    }
  }

  // Update category counts when mods change
  updateCategoryCounts()

  const getFeaturedMods = () => {
    return mods.value.slice(0, 6)
  }

  return { 
    mods, 
    categories, 
    categoryIconMap,
    getModById, 
    getModsByCategory, 
    getModsByCategoryId,
    updateCategoryCounts,
    addMod,
    removeMod,
    updateMod,
    getFeaturedMods
  }
})