<script setup lang="ts">
import type { Mod } from '@/types'
import { computed } from 'vue'

const props = defineProps<{
  mod: Mod
}>()

const modThumbnail = computed(() => {
  // Return the first image if available, otherwise fallback to placeholder
  return props.mod.images && props.mod.images.length > 0 
    ? props.mod.images[0].url 
    : null
})

const fallbackImageStyle = computed(() => {
  const colors = [
    'linear-gradient(45deg, #2c3e50, #4a6491)',
    'linear-gradient(45deg, #27ae60, #2ecc71)',
    'linear-gradient(45deg, #d35400, #e67e22)',
    'linear-gradient(45deg, #8e44ad, #9b59b6)',
    'linear-gradient(45deg, #16a085, #1abc9c)',
    'linear-gradient(45deg, #c0392b, #e74c3c)'
  ]
  return { background: colors[Math.floor(Math.random() * colors.length)] }
})

const isPaid = computed(() => props.mod.pricing.type === 'paid')

const hasDiscount = computed(() => 
  isPaid.value && 
  props.mod.pricing.originalPrice && 
  props.mod.pricing.discountPercentage
)

const isOnSale = computed(() => {
  if (!hasDiscount.value || !props.mod.pricing.saleEndDate) return false
  return new Date(props.mod.pricing.saleEndDate) > new Date()
})

const formatPrice = (price: number) => {
  return `$${price.toFixed(2)}`
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  if (target) {
    target.style.display = 'none'
  }
}
</script>

<template>
  <div class="mod-card">
    <div class="mod-badges">
      <div v-if="mod.rating > 4.5" class="mod-badge popular">POPULAR</div>
      <div v-if="isOnSale" class="mod-badge sale">-{{ mod.pricing.discountPercentage }}%</div>
      <div v-else-if="isPaid" class="mod-badge paid">PAID</div>
      <div v-else class="mod-badge free">FREE</div>
    </div>
    <div class="mod-image">
      <!-- Display actual mod image if available -->
      <img 
        v-if="modThumbnail" 
        :src="modThumbnail" 
        :alt="mod.title"
        class="mod-thumbnail"
        @error="handleImageError"
      />
      <!-- Fallback to gradient background with icon -->
      <div 
        v-if="!modThumbnail" 
        class="mod-fallback" 
        :style="fallbackImageStyle"
      >
        <i class="fas" :class="`fa-${mod.category.toLowerCase()}`"></i>
      </div>
      <!-- Category overlay -->
      <div class="mod-category-overlay">
        <i class="fas" :class="`fa-${mod.category.toLowerCase()}`"></i>
      </div>
    </div>
    <div class="mod-content">
      <div class="mod-meta">
        <span><i class="fas fa-tag"></i> {{ mod.category }}</span>
        <span><i class="far fa-calendar"></i> {{ new Date(mod.updatedAt).toLocaleDateString() }}</span>
      </div>
      <h3 class="mod-title">{{ mod.title }}</h3>
      <p class="mod-description">{{ mod.description }}</p>
      <div class="mod-stats">
        <span><i class="fas fa-download"></i> {{ mod.downloads.toLocaleString() }} downloads</span>
        <span><i class="fas fa-star"></i> {{ mod.rating }} ({{ mod.ratingCount }})</span>
      </div>
      
      <!-- Pricing Section -->
      <div class="mod-pricing">
        <div v-if="isPaid" class="price-info">
          <div v-if="hasDiscount && isOnSale" class="price-with-discount">
            <span class="original-price">${{ mod.pricing.originalPrice?.toFixed(2) }}</span>
            <span class="current-price">{{ formatPrice(mod.pricing.price!) }}</span>
          </div>
          <div v-else class="price-normal">
            <span class="current-price">{{ formatPrice(mod.pricing.price!) }}</span>
          </div>
        </div>
        <div v-else class="free-tag">
          <i class="fas fa-gift"></i> Free Download
        </div>
      </div>
      
      <!-- Spacer to push actions to bottom -->
      <div class="mod-spacer"></div>
    </div>
    
    <div class="mod-actions">
      <RouterLink 
        v-if="!isPaid" 
        :to="{ name: 'mod-preview', params: { id: mod.id } }" 
        class="download-btn free"
      >
        <i class="fas fa-download"></i> Download Free
      </RouterLink>
      <RouterLink 
        v-else 
        :to="{ name: 'mod-preview', params: { id: mod.id } }" 
        class="download-btn paid"
      >
        <i class="fas fa-shopping-cart"></i> Buy Now
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.mod-card {
  background: var(--card-bg);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow);
  transition: var(--transition);
  border: var(--border);
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.mod-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.mod-badges {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 2;
}

.mod-badge {
  padding: 0.3rem 1rem;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 600;
  text-align: center;
}

.mod-badge.popular {
  background: var(--secondary);
  color: white;
}

.mod-badge.free {
  background: var(--primary);
  color: white;
}

.mod-badge.paid {
  background: #e74c3c;
  color: white;
}

.mod-badge.sale {
  background: #f39c12;
  color: white;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.mod-image {
  height: 180px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  position: relative;
  overflow: hidden;
}

.mod-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.mod-card:hover .mod-thumbnail {
  transform: scale(1.05);
}

.mod-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(45deg, #2c3e50, #4a6491);
}

.mod-fallback i {
  font-size: 3rem;
  opacity: 0.7;
  z-index: 1;
}

.mod-category-overlay {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  backdrop-filter: blur(4px);
}

.mod-category-overlay i {
  font-size: 0.875rem;
}

.mod-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.mod-meta {
  display: flex;
  justify-content: space-between;
  color: var(--text-light);
  font-size: 0.85rem;
  margin-bottom: 0.75rem;
}

.mod-title {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: var(--dark);
  transition: var(--transition);
}

.mod-card:hover .mod-title {
  color: var(--primary);
}

.mod-description {
  color: var(--text-light);
  margin-bottom: 1.5rem;
  height: 60px;
  overflow: hidden;
  display: -webkit-box;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.mod-stats {
  display: flex;
  justify-content: space-between;
  color: var(--text-light);
  font-size: 0.9rem;
}

.mod-stats span {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mod-pricing {
  margin: 1rem 0;
  padding: 1rem;
  background: rgba(39, 174, 96, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(39, 174, 96, 0.1);
}

.price-info {
  text-align: center;
}

.price-with-discount {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
}

.original-price {
  color: var(--text-light);
  font-size: 0.9rem;
  text-decoration: line-through;
}

.current-price {
  color: var(--primary);
  font-size: 1.25rem;
  font-weight: 700;
}

.price-normal .current-price {
  font-size: 1.5rem;
}

.free-tag {
  color: var(--primary);
  font-weight: 600;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.mod-actions {
  margin-top: auto;
}

.mod-spacer {
  flex-grow: 1;
}

.download-btn {
  display: block;
  width: 100%;
  text-align: center;
  color: white;
  padding: 0.75rem;
  text-decoration: none;
  font-weight: 600;
  transition: var(--transition);
  border-radius: 0 0 var(--radius) var(--radius);
}

.download-btn.free {
  background: var(--primary);
}

.download-btn.free:hover {
  background: var(--primary-dark);
}

.download-btn.paid {
  background: #e74c3c;
}

.download-btn.paid:hover {
  background: #c0392b;
}

/* Enhanced Responsive Design */
@media (max-width: 1200px) {
  .mod-card {
    min-height: 400px;
  }
  
  .mod-image {
    height: 180px;
  }
  
  .mod-content {
    padding: 1.25rem;
  }
}

@media (max-width: 992px) {
  .mod-card {
    min-height: 380px;
  }
  
  .mod-image {
    height: 170px;
  }
  
  .mod-title {
    font-size: 1.15rem;
  }
  
  .mod-description {
    height: 55px;
    line-clamp: 2;
    -webkit-line-clamp: 2;
  }
}

@media (max-width: 768px) {
  .mod-card {
    min-height: 360px;
  }
  
  .mod-image {
    height: 160px;
  }
  
  .mod-content {
    padding: 1.25rem;
  }
  
  .mod-title {
    font-size: 1.1rem;
    margin-bottom: 0.75rem;
  }
  
  .mod-description {
    height: 54px;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    font-size: 0.9rem;
    margin-bottom: 1.25rem;
  }
  
  .mod-stats {
    font-size: 0.85rem;
    gap: 0.75rem;
  }
  
  .mod-meta {
    font-size: 0.8rem;
    margin-bottom: 0.5rem;
  }
}

@media (max-width: 480px) {
  .mod-card {
    min-height: 340px;
    margin: 0 auto;
    max-width: 350px;
  }
  
  .mod-image {
    height: 150px;
  }
  
  .mod-content {
    padding: 1rem;
  }
  
  .mod-title {
    font-size: 1.05rem;
    line-height: 1.3;
  }
  
  .mod-description {
    height: 48px;
    font-size: 0.85rem;
    line-height: 1.4;
  }
  
  .mod-stats {
    font-size: 0.8rem;
    justify-content: space-around;
  }
  
  .download-btn {
    padding: 0.6rem;
    font-size: 0.9rem;
    font-weight: 500;
  }
}

@media (max-width: 360px) {
  .mod-card {
    min-height: 320px;
    max-width: 100%;
  }
  
  .mod-image {
    height: 140px;
  }
  
  .mod-content {
    padding: 0.85rem;
  }
  
  .mod-title {
    font-size: 1rem;
  }
  
  .mod-description {
    height: 44px;
    font-size: 0.8rem;
  }
}
</style>
