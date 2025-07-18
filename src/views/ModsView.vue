<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useModsStore } from '@/stores/mods-new'
import { useRoute } from 'vue-router'
import ModCard from '@/components/mods/ModCard.vue'

const modsStore = useModsStore()
const route = useRoute()
const searchQuery = ref('')
const selectedCategory = ref('All Categories')
const sortOption = ref('Newest')
const filterBy = ref('All') // New filter for rating, downloads, etc.

// Initialize store when component mounts
onMounted(async () => {
  if (modsStore.mods.length === 0) {
    await modsStore.initialize()
  }
  // Set search query from URL parameter if it exists
  if (route.query.search) {
    searchQuery.value = route.query.search as string
  }
  // Set category from URL parameter if it exists
  if (route.query.category) {
    selectedCategory.value = route.query.category as string
  }
})

// Watch route changes to reinitialize when needed  
watch(() => route.fullPath, async () => {
  if (route.name === 'mods') {
    if (modsStore.mods.length === 0) {
      await modsStore.initialize()
    }
    // Update search query from URL parameter
    if (route.query.search) {
      searchQuery.value = route.query.search as string
    } else {
      searchQuery.value = ''
    }
    // Update category from URL parameter
    if (route.query.category) {
      selectedCategory.value = route.query.category as string
    } else {
      selectedCategory.value = 'All Categories'
    }
  }
}, { immediate: true })

// Get all categories for filter dropdown
const categories = computed(() => {
  return ['All Categories', ...modsStore.categories.map(c => c.name)]
})

// Get total mod count for current filters
const totalModCount = computed(() => {
  return filteredMods.value.length
})

// Debug info for categories
const categoryDebug = computed(() => {
  const allMods = modsStore.mods
  const categoryCounts: Record<string, number> = {}
  
  allMods.forEach(mod => {
    categoryCounts[mod.category] = (categoryCounts[mod.category] || 0) + 1
  })
  
  return categoryCounts
})

// Filter and sort mods
const filteredMods = computed(() => {
  let mods = [...modsStore.mods]
  
  // Filter by category
  if (selectedCategory.value !== 'All Categories') {
    mods = mods.filter(mod => mod.category === selectedCategory.value)
  }
  
  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    mods = mods.filter(mod => 
      mod.title.toLowerCase().includes(query) || 
      mod.description.toLowerCase().includes(query) ||
      mod.author.name.toLowerCase().includes(query) ||
      mod.features.some(feature => feature.toLowerCase().includes(query))
    )
  }

  // Additional filters
  switch (filterBy.value) {
    case 'High Rated':
      mods = mods.filter(mod => mod.rating >= 4.5)
      break
    case 'Popular':
      mods = mods.filter(mod => mod.downloads >= 1000)
      break
    case 'Verified Authors':
      mods = mods.filter(mod => mod.author.isVerified)
      break
    case 'Recent':
      const oneMonthAgo = new Date()
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
      mods = mods.filter(mod => new Date(mod.updatedAt) >= oneMonthAgo)
      break
  }
  
  // Sort mods
  switch (sortOption.value) {
    case 'Newest':
      mods.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      break
    case 'Popular':
      mods.sort((a, b) => b.downloads - a.downloads)
      break
    case 'Rating':
      mods.sort((a, b) => b.rating - a.rating)
      break
    case 'Name A-Z':
      mods.sort((a, b) => a.title.localeCompare(b.title))
      break
    case 'Name Z-A':
      mods.sort((a, b) => b.title.localeCompare(a.title))
      break
    case 'Size':
      mods.sort((a, b) => {
        const getSizeInMB = (size: string) => {
          const num = parseFloat(size)
          return size.includes('GB') ? num * 1024 : num
        }
        return getSizeInMB(b.size) - getSizeInMB(a.size)
      })
      break
  }
  
  return mods
})

// Reset all filters
const resetFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = 'All Categories'
  sortOption.value = 'Newest'
  filterBy.value = 'All'
}
</script>

<template>
  <div class="mods-view">
    <div class="mods-header">
      <h1>FS25 Mods Collection</h1>
      <p>Browse all available mods for Farming Simulator 25</p>
      
      <div class="mods-controls">
        <div class="search-bar">
          <i class="fas fa-search"></i>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search mods, authors, features..." 
          >
        </div>
        
        <div class="mods-filters">
          <select v-model="selectedCategory" class="filter-select">
            <option v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
          
          <select v-model="filterBy" class="filter-select">
            <option value="All">All Mods</option>
            <option value="High Rated">High Rated (4.5+)</option>
            <option value="Popular">Popular (1000+ downloads)</option>
            <option value="Verified Authors">Verified Authors</option>
            <option value="Recent">Recent Updates (30 days)</option>
          </select>
          
          <select v-model="sortOption" class="filter-select">
            <option value="Newest">Newest</option>
            <option value="Popular">Most Popular</option>
            <option value="Rating">Highest Rated</option>
            <option value="Name A-Z">Name A-Z</option>
            <option value="Name Z-A">Name Z-A</option>
            <option value="Size">Largest File</option>
          </select>
        </div>
      </div>
      
      <div class="mods-stats">
        <span class="mod-count">
          <i class="fas fa-layer-group"></i>
          Showing {{ totalModCount }} of {{ modsStore.mods.length }} mods
          <span v-if="selectedCategory !== 'All Categories'" class="category-info">
            in {{ selectedCategory }}
          </span>
        </span>
        <button v-if="searchQuery || selectedCategory !== 'All Categories' || filterBy !== 'All'" 
                @click="resetFilters" 
                class="reset-btn">
          <i class="fas fa-undo"></i>
          Reset Filters
        </button>
      </div>
    </div>
    
    <div class="mods-grid">
      <ModCard 
        v-for="mod in filteredMods" 
        :key="mod.id" 
        :mod="mod" 
        class="mod-item"
      />
    </div>
    
    <div v-if="filteredMods.length === 0" class="no-mods-found">
      <i class="fas fa-search-minus"></i>
      <h3>No mods found matching your criteria</h3>
      <p>Try adjusting your search or filters</p>
      <button @click="resetFilters" class="btn">
        <i class="fas fa-undo"></i>
        Reset Filters
      </button>
    </div>
  </div>
</template>

<style scoped>
.mods-view {
  max-width: 1400px;
  margin: 2rem auto;
  padding: 0 2rem;
}

.mods-header {
  margin-bottom: 3rem;
  text-align: center;
}

.mods-header h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: var(--dark);
}

.mods-header p {
  color: var(--text-light);
  font-size: 1.1rem;
  max-width: 700px;
  margin: 0 auto 2rem;
}

.mods-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.search-bar {
  flex: 1;
  min-width: 300px;
  position: relative;
}

.search-bar i {
  position: absolute;
  left: 1.2rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-light);
}

.search-bar input {
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 3rem;
  border: 1px solid var(--gray);
  border-radius: 50px;
  font-size: 1rem;
  transition: var(--transition);
}

.search-bar input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.2);
}

.mods-filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.mods-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding: 1rem;
  background: rgba(39, 174, 96, 0.1);
  border-radius: var(--radius);
  border: 1px solid rgba(39, 174, 96, 0.2);
}

.mod-count {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary);
  font-weight: 500;
}

.mod-count i {
  color: var(--primary);
}

.category-info {
  font-style: italic;
  color: var(--text-light);
  font-weight: normal;
}

.reset-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid var(--primary);
  color: var(--primary);
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: var(--transition);
}

.reset-btn:hover {
  background: var(--primary);
  color: white;
}

.filter-select {
  padding: 0.8rem 1.2rem;
  border-radius: 50px;
  border: 1px solid var(--gray);
  background: white;
  font-size: 1rem;
  color: var(--text);
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1.2rem;
  padding-right: 3rem;
}

.mods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.no-mods-found {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  border: 2px dashed var(--gray);
}

.no-mods-found i {
  font-size: 2.5rem;
  color: var(--text-light);
  margin-bottom: 1.5rem;
  opacity: 0.6;
  display: block;
  text-align: center;
}

.no-mods-found h3 {
  margin-bottom: 0.5rem;
  color: var(--dark);
  font-size: 1.5rem;
}

.no-mods-found p {
  color: var(--text-light);
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.no-mods-found .btn {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.8rem 1.6rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  text-decoration: none;
  min-width: 150px;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(39, 174, 96, 0.2);
}

.no-mods-found .btn i {
  font-size: 1.1rem;
  line-height: 1;
  margin: 0;
  flex-shrink: 0;
  font-weight: 600;
  opacity: 1;
  color: rgba(255, 255, 255, 0.95);
}

.no-mods-found .btn:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

/* Enhanced Responsive Design */
@media (max-width: 1200px) {
  .mods-view {
    padding: 0 1.5rem;
  }
  
  .mods-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
  }
}

@media (max-width: 992px) {
  .mods-header h1 {
    font-size: 2.2rem;
  }
  
  .mods-controls {
    gap: 1rem;
  }
  
  .search-bar {
    min-width: 250px;
  }
  
  .mods-filters {
    gap: 0.8rem;
  }
  
  .mods-stats {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .mods-grid {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  }
}

@media (max-width: 768px) {
  .mods-view {
    margin: 1.5rem auto;
    padding: 0 1.5rem;
  }
  
  .mods-header {
    margin-bottom: 2.5rem;
  }
  
  .mods-header h1 {
    font-size: 2rem;
  }
  
  .mods-header p {
    font-size: 1rem;
  }
  
  .mods-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 1.5rem;
  }
  
  .search-bar {
    min-width: auto;
    width: 100%;
  }
  
  .search-bar input {
    padding: 0.9rem 1rem 0.9rem 3rem;
    font-size: 1rem;
  }
  
  .mods-filters {
    width: 100%;
    flex-direction: column;
    gap: 1rem;
  }
  
  .mods-stats {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
    margin-top: 1rem;
  }
  
  .filter-select {
    width: 100%;
    padding: 0.9rem 1.2rem;
    font-size: 1rem;
  }
  
  .mods-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1.25rem;
  }
  
  .no-mods-found {
    padding: 3rem 1.5rem;
  }
  
  .no-mods-found h3 {
    font-size: 1.3rem;
  }
  
  .no-mods-found p {
    font-size: 1rem;
  }
  
  .no-mods-found .btn {
    padding: 0.65rem 1.25rem;
    font-size: 0.9rem;
    min-width: 120px;
  }
}

@media (max-width: 480px) {
  .mods-view {
    margin: 1rem auto;
    padding: 0 1rem;
  }
  
  .mods-header {
    margin-bottom: 2rem;
  }
  
  .mods-header h1 {
    font-size: 1.8rem;
  }
  
  .mods-header p {
    font-size: 0.95rem;
  }
  
  .mods-controls {
    margin-bottom: 1.5rem;
  }
  
  .search-bar input {
    padding: 0.8rem 0.9rem 0.8rem 2.8rem;
    font-size: 0.95rem;
  }
  
  .search-bar i {
    left: 1rem;
  }
  
  .filter-select {
    padding: 0.8rem 1rem;
    font-size: 0.95rem;
  }
  
  .mods-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .no-mods-found {
    padding: 2.5rem 1rem;
  }
  
  .no-mods-found i {
    font-size: 2.2rem;
  }
  
  .no-mods-found h3 {
    font-size: 1.2rem;
  }
  
  .no-mods-found p {
    font-size: 0.9rem;
  }
  
  .no-mods-found .btn {
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
    min-width: 110px;
  }
}

@media (max-width: 360px) {
  .mods-view {
    padding: 0 0.75rem;
  }
  
  .mods-header h1 {
    font-size: 1.6rem;
  }
  
  .search-bar input {
    padding: 0.75rem 0.8rem 0.75rem 2.6rem;
    font-size: 0.9rem;
  }
  
  .filter-select {
    padding: 0.75rem 0.9rem;
    font-size: 0.9rem;
  }
}
</style>