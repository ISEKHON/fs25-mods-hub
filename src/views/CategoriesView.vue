<script setup lang="ts">
import { useModsStore } from '@/stores/mods'
import CategoryCard from '@/components/categories/CategoryCard.vue'

const modsStore = useModsStore()
</script>

<template>
  <div class="categories-view">
    <div class="categories-header">
      <h1>FS25 Mod Categories</h1>
      <p>Browse mods by category to find exactly what you need</p>
    </div>
    
    <div class="categories-grid">
      <CategoryCard 
        v-for="category in modsStore.categories" 
        :key="category.id" 
        :category="category" 
      />
    </div>
    
    <div class="categories-stats">
      <div class="stat-card">
        <i class="fas fa-tractor"></i>
        <div class="stat-content">
          <h3>{{ modsStore.mods.length.toLocaleString() }}+</h3>
          <p>Total Mods Available</p>
        </div>
      </div>
      
      <div class="stat-card">
        <i class="fas fa-download"></i>
        <div class="stat-content">
          <h3>{{ modsStore.mods.reduce((sum, mod) => sum + mod.downloads, 0).toLocaleString() }}+</h3>
          <p>Total Downloads</p>
        </div>
      </div>
      
      <div class="stat-card">
        <i class="fas fa-users"></i>
        <div class="stat-content">
          <h3>{{ new Set(modsStore.mods.map(mod => mod.author.id)).size }}+</h3>
          <p>Active Creators</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.categories-view {
  max-width: 1400px;
  margin: 2rem auto;
  padding: 0 2rem;
}

.categories-header {
  text-align: center;
  margin-bottom: 3rem;
}

.categories-header h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: var(--dark);
}

.categories-header p {
  color: var(--text-light);
  font-size: 1.1rem;
  max-width: 700px;
  margin: 0 auto;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2.5rem;
  margin-bottom: 4rem;
}

.categories-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.stat-card {
  background: white;
  border-radius: var(--radius);
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  box-shadow: var(--shadow);
}

.stat-card i {
  font-size: 2.5rem;
  color: var(--primary);
}

.stat-content h3 {
  font-size: 2rem;
  color: var(--dark);
  margin-bottom: 0.5rem;
}

.stat-content p {
  color: var(--text-light);
}

/* Enhanced Responsive Design */
@media (max-width: 1200px) {
  .categories-view {
    padding: 0 1.5rem;
  }
  
  .categories-grid {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 2rem;
  }
  
  .categories-stats {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }
}

@media (max-width: 992px) {
  .categories-header h1 {
    font-size: 2.2rem;
  }
  
  .categories-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1.75rem;
  }
  
  .categories-stats {
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 1.5rem;
  }
  
  .stat-card {
    padding: 1.75rem;
  }
  
  .stat-card i {
    font-size: 2.25rem;
  }
  
  .stat-content h3 {
    font-size: 1.8rem;
  }
}

@media (max-width: 768px) {
  .categories-view {
    padding: 0 1.5rem;
  }
  
  .categories-header {
    margin-bottom: 2.5rem;
  }
  
  .categories-header h1 {
    font-size: 2rem;
  }
  
  .categories-header p {
    font-size: 1rem;
  }
  
  .categories-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1.5rem;
    margin-bottom: 3rem;
  }
  
  .categories-stats {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
  
  .stat-card {
    padding: 1.5rem;
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .stat-card i {
    font-size: 2rem;
  }
  
  .stat-content h3 {
    font-size: 1.6rem;
    margin-bottom: 0.25rem;
  }
  
  .stat-content p {
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  .categories-view {
    padding: 0 1rem;
  }
  
  .categories-header {
    margin-bottom: 2rem;
  }
  
  .categories-header h1 {
    font-size: 1.8rem;
  }
  
  .categories-header p {
    font-size: 0.95rem;
  }
  
  .categories-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
    margin-bottom: 2.5rem;
  }
  
  .stat-card {
    padding: 1.25rem;
  }
  
  .stat-card i {
    font-size: 1.8rem;
  }
  
  .stat-content h3 {
    font-size: 1.4rem;
  }
  
  .stat-content p {
    font-size: 0.9rem;
  }
}

@media (max-width: 360px) {
  .categories-view {
    padding: 0 0.75rem;
  }
  
  .categories-header h1 {
    font-size: 1.6rem;
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .stat-card i {
    font-size: 1.6rem;
  }
  
  .stat-content h3 {
    font-size: 1.25rem;
  }
}
</style>