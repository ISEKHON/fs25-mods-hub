import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Developer } from '@/types'

export const useDevelopersStore = defineStore('developers', () => {
  const developers = ref<Developer[]>([
    {
      id: 1,
      name: 'SEKHON',
      role: 'Platform Owner & Lead Developer',
      avatar: 'https://cdn.discordapp.com/avatars/442551893638512660/565c937ec6f47af7e5cc553d274f4a90.webp',
      bio: 'Passionate mod creator specializing in detailed vehicle modifications and realistic farming equipment for FS25.',
      specialties: ['Platform Development', 'Mod Creator', 'Community Management'],
      contact: {
        email: 'jagdeepsekhon101@gmail.com',
        telegram: '@MrCode403',
        discord: 'FS25ModsHub#0001'
      },
      stats: {
        modsPublished: 150,
        totalDownloads: '2.5M',
        yearsActive: 3
      },
      featured: true
    }, 
    {
      id: 5,
      name: 'Dhillxn',
      role: 'Modder & Community Manager',
      avatar: 'https://i.ibb.co/GQXHq1f0/dhillon.png',
      bio: 'modding enthusiast with a passion for community engagement.',
      specialties: ['Mods converter'],
      contact: {
        email: 'maps@cropmaster.dev',
        discord: 'CropMaster#5678'
      },
      stats: {
        modsPublished: 12,
        totalDownloads: '280K',
        yearsActive: 1
      },
      featured: true
    }
  ])

  const getFeaturedDevelopers = () => {
    return developers.value.filter(dev => dev.featured)
  }

  const getDevelopersByRole = (role: string) => {
    return developers.value.filter(dev => dev.role.toLowerCase().includes(role.toLowerCase()))
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
          const num = parseFloat(str.replace(/[MK]/g, ''))
          return str.includes('M') ? num * 1000000 : str.includes('K') ? num * 1000 : num
        }
        return sorted.sort((a, b) => getDownloadNumber(b.stats.totalDownloads) - getDownloadNumber(a.stats.totalDownloads))
      default:
        return sorted
    }
  }

  const getUniqueRoles = () => {
    const roles = developers.value.map(dev => dev.role)
    return Array.from(new Set(roles))
  }

  return { 
    developers, 
    getFeaturedDevelopers, 
    getDevelopersByRole, 
    getDeveloperById,
    searchDevelopers,
    sortDevelopers,
    getUniqueRoles
  }
})
