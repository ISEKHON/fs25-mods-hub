<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useModsStore } from '@/stores/mods-new'
import ModCard from '@/components/mods/ModCard.vue'
import CategoryCard from '@/components/categories/CategoryCard.vue'

const modsStore = useModsStore()
const featuredMods = computed(() => modsStore.featuredMods)
const categories = computed(() => modsStore.categories)
const totalMods = computed(() => modsStore.totalMods)

// Calculate total downloads from all mods
const totalDownloads = computed(() => {
  const total = modsStore.mods.reduce((sum, mod) => sum + (mod.downloads || 0), 0)
  if (total >= 1000000) {
    return `${Math.floor(total / 100000) / 10}M+`
  } else if (total >= 1000) {
    return `${Math.floor(total / 100) / 10}K+`
  } else {
    return `${total}+`
  }
})

// Fetch featured mods when component mounts
onMounted(async () => {
  if (modsStore.categories.length === 0) {
    await modsStore.initialize()
  }
  await modsStore.fetchFeaturedMods()
})

const heroButtons = [
  { text: 'Browse Mods', icon: 'download', link: '/mods' },
  { text: 'View Categories', icon: 'tags', link: '/categories' }
]

const stats = computed(() => [
  { number: `${totalMods.value || 0}+`, label: 'Mods Available' },
  { number: totalDownloads.value, label: 'Downloads' },
  { number: '24/7', label: 'Active Support' }
])
</script>

<template>
  <div class="home-view">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1>Transform Your <span>Farming Experience</span></h1>
        <p>Download premium FS25 mods - some free, some paid with great discounts! Enhance your gameplay with our constantly updated collection of vehicles, tools, maps, and more!</p>
        
        <div class="hero-btns">
          <RouterLink 
            v-for="btn in heroButtons" 
            :key="btn.text" 
            :to="btn.link" 
            class="btn" 
            :class="{ 'btn-secondary': btn.text === 'View Categories' }"
          >
            <i class="fas" :class="`fa-${btn.icon}`"></i> {{ btn.text }}
          </RouterLink>
        </div>
        
        <div class="stats">
          <div v-for="stat in stats" :key="stat.label" class="stat-item">
            <div class="stat-number">{{ stat.number }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories Section -->
    <section class="section" id="categories">
      <div class="section-title">
        <h2>Mod Categories</h2>
        <p>Explore our extensive collection of FS25 mods organized into categories for easy browsing</p>
      </div>
      
      <div class="categories-grid">
        <CategoryCard 
          v-for="category in categories" 
          :key="category.id" 
          :category="category" 
        />
      </div>
    </section>

    <!-- Mods Section -->
    <section class="section mods" id="mods">
      <div class="section-title">
        <h2>Featured Mods</h2>
        <p>Discover the most popular and recently added mods for Farming Simulator 25</p>
      </div>
      
      <div class="mods-header">
        <h3>Top Downloads This Week</h3>
        <div class="sort-filter">
          <select>
            <option>Sort by: Newest</option>
            <option>Sort by: Popular</option>
            <option>Sort by: Downloads</option>
          </select>
          <select>
            <option>All Categories</option>
            <option v-for="category in categories" :key="category.id">
              {{ category.name }}
            </option>
          </select>
        </div>
      </div>
      
      <div class="mods-grid">
        <ModCard 
          v-for="mod in featuredMods" 
          :key="mod.id" 
          :mod="mod" 
        />
      </div>
    </section>

    <!-- Upload Section -->
    <section class="section upload" id="upload">
      <div class="section-title light">
        <h2>Upload Your Mods</h2>
        <p>Share your creations with the FS25 community. Upload free mods or premium content with your own pricing.</p>
      </div>
      
      <div class="upload-container">
        <div class="upload-icon">
          <i class="fas fa-cloud-upload-alt"></i>
        </div>
        <h3>Contribute to the Community</h3>
        <p>Upload your FS25 mods for others to enjoy. Our platform makes sharing easy and hassle-free.</p>
        
        <RouterLink to="/upload" class="btn btn-secondary">
          <i class="fas fa-upload"></i> Upload Mod
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-view {
  padding-top: 1rem;
  width: 100%;
  overflow-x: hidden;
}

.hero {
  background: linear-gradient(135deg, rgba(30, 39, 46, 0.95) 0%, rgba(23, 30, 37, 0.95) 100%), 
              url('https://images.unsplash.com/photo-1543857778-c4a1a569e7bd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80') center/cover;
  color: white;
  text-align: center;
  padding: 7rem 2rem;
  position: relative;
  overflow: hidden;
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
}

.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background: linear-gradient(to right, var(--primary), var(--accent));
}

.hero-content {
  max-width: 900px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

.hero h1 {
  font-size: 3.5rem;
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

.hero h1 span {
  background: linear-gradient(to right, var(--primary), var(--accent));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: block;
}

.hero p {
  font-size: 1.3rem;
  margin-bottom: 2.5rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  color: rgba(255, 255, 255, 0.85);
}

.hero-btns {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 2rem;
}

.stats {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-top: 4rem;
  flex-wrap: wrap;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 0.5rem;
  font-family: 'Poppins', sans-serif;
}

.stat-label {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
}

.section {
  padding: 6rem 2rem;
  width: 100%;
  overflow-x: hidden;
}

.section-title {
  text-align: center;
  margin-bottom: 4rem;
}

.section-title h2 {
  font-size: 2.8rem;
  color: var(--dark);
  display: inline-block;
  position: relative;
  margin-bottom: 1.5rem;
}

.section-title h2::after {
  content: '';
  position: absolute;
  width: 80px;
  height: 5px;
  background: linear-gradient(to right, var(--primary), var(--accent));
  bottom: -15px;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 5px;
}

.section-title p {
  font-size: 1.2rem;
  color: var(--text-light);
  max-width: 700px;
  margin: 2rem auto 0;
  line-height: 1.7;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2.5rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  padding: 0 1rem;
}

.mods {
  background: linear-gradient(to bottom, #f5f9ff 0%, #e6f0ff 100%);
}

.mods-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto 3rem;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.mods-header h3 {
  font-size: 1.8rem;
  color: var(--dark);
  position: relative;
  padding-left: 1.5rem;
}

.mods-header h3::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 30px;
  background: var(--primary);
  border-radius: 4px;
}

.sort-filter {
  display: flex;
  gap: 1.2rem;
  align-items: center;
}

.sort-filter select {
  padding: 0.8rem 1.2rem;
  border-radius: 50px;
  border: var(--border);
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
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2.5rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  padding: 0 1rem;
}

.upload {
  background: linear-gradient(to bottom, var(--darker), #15202b);
  color: white;
  position: relative;
  overflow: hidden;
}

.upload::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background: linear-gradient(to right, var(--secondary), var(--accent));
}

.section-title.light h2 {
  color: white;
}

.section-title.light h2::after {
  background: linear-gradient(to right, var(--secondary), var(--accent));
}

.section-title.light p {
  color: rgba(255, 255, 255, 0.8);
}

.upload-container {
  max-width: 900px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.05);
  padding: 3.5rem;
  border-radius: var(--radius);
  box-shadow: 0 15px 35px rgba(0,0,0,0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 2;
}

.upload-icon {
  font-size: 4.5rem;
  color: var(--secondary);
  margin-bottom: 1.5rem;
}

.upload-container p {
  margin-bottom: 2.5rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
}

/* Mobile Category Card Sizing */
@media (max-width: 768px) {
  .categories-grid :deep(.category-card) {
    min-height: 140px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  
  .categories-grid :deep(.category-card .category-icon) {
    font-size: 2.5rem;
    margin-bottom: 0.75rem;
  }
  
  .categories-grid :deep(.category-card .category-name) {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
  }
  
  .categories-grid :deep(.category-card .category-count) {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .categories-grid :deep(.category-card) {
    min-height: 120px;
    padding: 1.5rem 1rem;
  }
  
  .categories-grid :deep(.category-card .category-icon) {
    font-size: 2.2rem;
    margin-bottom: 0.5rem;
  }
  
  .categories-grid :deep(.category-card .category-name) {
    font-size: 1rem;
    margin-bottom: 0.4rem;
  }
  
  .categories-grid :deep(.category-card .category-count) {
    font-size: 0.85rem;
  }
}

@media (max-width: 360px) {
  .categories-grid :deep(.category-card) {
    min-height: 110px;
    padding: 1.25rem 0.75rem;
  }
  
  .categories-grid :deep(.category-card .category-icon) {
    font-size: 2rem;
  }
  
  .categories-grid :deep(.category-card .category-name) {
    font-size: 0.95rem;
  }
  
  .categories-grid :deep(.category-card .category-count) {
    font-size: 0.8rem;
  }
}

/* Enhanced Responsive Design */
@media (max-width: 1200px) {
  .mods-grid, .categories-grid {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 2rem;
  }
  
  .hero h1 {
    font-size: 3.2rem;
  }
}

@media (max-width: 992px) {
  .hero {
    padding: 6rem 1.5rem;
  }
  
  .hero h1 {
    font-size: 3rem;
  }
  
  .hero p {
    font-size: 1.2rem;
  }
  
  .stats {
    gap: 2.5rem;
  }
  
  .stat-number {
    font-size: 2.2rem;
  }
  
  .section {
    padding: 5rem 1.5rem;
  }
  
  .mods-grid, .categories-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
  
  .upload-container {
    padding: 3rem 2rem;
  }
}

@media (max-width: 768px) {
  .hero {
    padding: 5rem 1.5rem;
  }
  
  .hero h1 {
    font-size: 2.5rem;
    line-height: 1.1;
  }
  
  .hero p {
    font-size: 1.1rem;
    margin-bottom: 2rem;
  }
  
  .hero-btns {
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }

  .hero-btns .btn {
    width: 280px;
    max-width: 100%;
  }
  
  .stats {
    gap: 2rem;
    margin-top: 3rem;
  }
  
  .stat-number {
    font-size: 2rem;
  }
  
  .stat-label {
    font-size: 1rem;
  }
  
  .section {
    padding: 4rem 1.5rem;
  }
  
  .section-title h2 {
    font-size: 2.3rem;
  }
  
  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
    padding: 0;
  }
  
  .categories-grid :deep(.category-card) {
    width: 100%;
    max-width: none;
  }
  
  .mods-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .mods-header h3 {
    font-size: 1.6rem;
  }
  
  .mods-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1.5rem;
  }
  
  .upload-container {
    padding: 2.5rem 1.5rem;
  }
  
  .upload-icon {
    font-size: 3.5rem;
  }
}

@media (max-width: 480px) {
  .hero {
    padding: 4rem 1rem;
    min-height: 90vh;
  }
  
  .hero h1 {
    font-size: 2.2rem;
  }
  
  .hero p {
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .hero-btns .btn {
    width: 100%;
    padding: 0.8rem 1rem;
  }
  
  .stats {
    flex-direction: column;
    gap: 1.5rem;
    margin-top: 2.5rem;
  }
  
  .stat-item {
    padding: 1rem;
    background: rgba(255,255,255,0.1);
    border-radius: 10px;
    backdrop-filter: blur(5px);
    width: 100%;
    max-width: 280px;
    margin: 0 auto;
  }
  
  .section {
    padding: 3rem 1rem;
  }
  
  .section-title h2 {
    font-size: 2rem;
  }
  
  .section-title p {
    font-size: 1rem;
  }
  
  .categories-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 0;
  }
  
  .categories-grid :deep(.category-card) {
    width: 100%;
    max-width: none;
  }
  
  .mods-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
    padding: 0;
  }
  
  .mods-header {
    gap: 1rem;
    text-align: center;
  }
  
  .sort-filter {
    flex-direction: column;
    width: 100%;
    gap: 0.8rem;
  }
  
  .sort-filter select {
    width: 100%;
    margin: 0;
  }
  
  .upload-container {
    padding: 2rem 1rem;
    margin: 0 1rem;
  }
  
  .upload-container h3 {
    font-size: 1.4rem;
  }
  
  .upload-container p {
    font-size: 1rem;
  }
}

@media (max-width: 360px) {
  .hero {
    padding: 3rem 0.75rem;
    min-height: 85vh;
  }
  
  .hero h1 {
    font-size: 2rem;
  }
  
  .section {
    padding: 3rem 0.75rem;
  }
  
  .section-title h2 {
    font-size: 1.8rem;
  }
  
  .categories-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    padding: 0;
  }
  
  .categories-grid :deep(.category-card) {
    width: 100%;
    max-width: none;
  }
  
  .mods-grid {
    padding: 0;
    gap: 1rem;
  }
  
  .upload-container {
    padding: 1.5rem 0.75rem;
    margin: 0 0.75rem;
  }
  
  .stat-item {
    max-width: 100%;
  }
}
</style>