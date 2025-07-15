<script setup lang="ts">
import type { ModCategory } from '@/types'

const props = defineProps<{
  category: ModCategory
}>()

const iconMap: Record<string, string> = {
  vehicles: 'tractor',
  tools: 'tools',
  maps: 'map-marked-alt',
  animals: 'cow',
  buildings: 'warehouse',
  scripts: 'code'
}
</script>

<template>
  <RouterLink 
    :to="{ path: '/mods', query: { category: category.name } }" 
    class="category-card"
  >
    <div class="category-icon">
      <i class="fas" :class="`fa-${iconMap[category.name.toLowerCase()] || 'tag'}`"></i>
    </div>
    <div class="category-content">
      <h3>{{ category.name }}</h3>
      <p>{{ category.modCount }} mods available</p>
    </div>
  </RouterLink>
</template>

<style scoped>
.category-card {
  background: var(--card-bg);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow);
  transition: var(--transition);
  text-align: center;
  border: var(--border);
  position: relative;
  z-index: 1;
}

.category-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 0;
  background: linear-gradient(to bottom, var(--primary), var(--accent));
  z-index: -1;
  transition: var(--transition);
  opacity: 0.9;
}

.category-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.15);
}

.category-card:hover::before {
  height: 100%;
}

.category-icon {
  padding: 2.5rem 2rem 1.5rem;
  font-size: 3.5rem;
  color: var(--primary);
  transition: var(--transition);
}

.category-card:hover .category-icon {
  color: white;
}

.category-content {
  padding: 1.5rem 2rem 2.5rem;
  position: relative;
  z-index: 2;
}

.category-content h3 {
  margin-bottom: 1rem;
  color: var(--dark);
  font-size: 1.8rem;
  transition: var(--transition);
}

.category-card:hover .category-content h3 {
  color: white;
}

.category-content p {
  color: var(--text-light);
  transition: var(--transition);
}

.category-card:hover .category-content p {
  color: rgba(255, 255, 255, 0.9);
}

/* Enhanced Responsive Design */
@media (max-width: 1200px) {
  .category-card {
    min-height: 280px;
  }
  
  .category-icon {
    padding: 2.5rem 2rem 1.5rem;
    font-size: 3.5rem;
  }
  
  .category-content {
    padding: 1.25rem 1.75rem 2.25rem;
  }
  
  .category-content h3 {
    font-size: 1.7rem;
  }
}

@media (max-width: 992px) {
  .category-card {
    min-height: 260px;
  }
  
  .category-icon {
    padding: 2.25rem 1.75rem 1.25rem;
    font-size: 3.25rem;
  }
  
  .category-content {
    padding: 1rem 1.5rem 2rem;
  }
  
  .category-content h3 {
    font-size: 1.6rem;
    margin-bottom: 0.75rem;
  }
  
  .category-content p {
    font-size: 0.95rem;
    line-height: 1.5;
  }
}

@media (max-width: 768px) {
  .category-card {
    min-height: 240px;
    max-width: 350px;
    margin: 0 auto;
  }
  
  .category-icon {
    padding: 2rem 1.5rem 1rem;
    font-size: 3rem;
  }
  
  .category-content {
    padding: 1rem 1.25rem 1.75rem;
  }
  
  .category-content h3 {
    font-size: 1.5rem;
    margin-bottom: 0.75rem;
  }
  
  .category-content p {
    font-size: 0.9rem;
    line-height: 1.4;
  }
}

@media (max-width: 480px) {
  .category-card {
    min-height: 220px;
    max-width: 100%;
  }
  
  .category-icon {
    padding: 1.75rem 1.25rem 0.75rem;
    font-size: 2.75rem;
  }
  
  .category-content {
    padding: 0.75rem 1rem 1.5rem;
  }
  
  .category-content h3 {
    font-size: 1.35rem;
    margin-bottom: 0.5rem;
    line-height: 1.3;
  }
  
  .category-content p {
    font-size: 0.85rem;
    line-height: 1.4;
  }
}

@media (max-width: 360px) {
  .category-card {
    min-height: 200px;
  }
  
  .category-icon {
    padding: 1.5rem 1rem 0.5rem;
    font-size: 2.5rem;
  }
  
  .category-content {
    padding: 0.5rem 0.75rem 1.25rem;
  }
  
  .category-content h3 {
    font-size: 1.2rem;
  }
  
  .category-content p {
    font-size: 0.8rem;
  }
}
</style>