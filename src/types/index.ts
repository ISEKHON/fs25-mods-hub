export interface Mod {
  id: string
  title: string
  description: string
  category: string
  downloads: number
  version: string
  size: string
  rating: number
  ratingCount: number
  createdAt: string
  updatedAt: string
  images: ModImage[]
  author: ModAuthor
  features: string[]
  changelog?: ModChangelog[] | string
  pricing: ModPricing
  reviews?: ModReview[]
  featured?: boolean
  video_url?: string
  compatibility?: string[]
  installation_notes?: string
  known_issues?: string
  credits?: string
  downloadUrl?: string // Add downloadUrl field
  installationNotes?: string // Add installationNotes field
  modData?: string // JSON string containing additional mod metadata
}

export interface ModReview {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number
  title: string
  comment: string
  createdAt: string
  updatedAt?: string
  helpful: number
  notHelpful: number
  verified: boolean
  version: string
}

export interface ModPricing {
  type: 'free' | 'paid'
  price?: number
  currency?: string
  originalPrice?: number // For discount calculation
  discountPercentage?: number
  saleEndDate?: string
}

export interface ModImage {
  type: 'image' | 'video'
  url: string
}

export interface ModAuthor {
  id: string
  name: string
  avatar: string
  isVerified: boolean
}

export interface ModCategory {
  id: string
  name: string
  icon: string
  modCount: number
}

export interface ModChangelog {
  version: string
  date: string
  changes: string[]
}

export interface Contact {
  email?: string
  telegram?: string
  discord?: string
  website?: string
  github?: string
}

export interface Stats {
  modsPublished: number
  totalDownloads: string
  yearsActive: number
  averageRating?: number
}

export interface Developer {
  id: number
  name: string
  role: string
  avatar: string
  bio: string
  featured: boolean
  stats: Stats
  contact: Contact
  specialties: string[]
  joinedDate?: string
}