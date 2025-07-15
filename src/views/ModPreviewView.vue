<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useModsStore } from '@/stores/mods'
import ModGallery from '@/components/mods/ModGallery.vue'
import ModTabs from '@/components/mods/ModTabs.vue'
import ModCard from '@/components/mods/ModCard.vue'

const route = useRoute()
const modsStore = useModsStore()

// Initialize store when component mounts
onMounted(async () => {
  modsStore.updateCategoryCounts()
  
  // Give some time for the store to initialize, then stop loading if no mod found
  setTimeout(() => {
    if (!mod.value) {
      isLoading.value = false
    }
  }, 1000) // Increased timeout to 1 second for better reliability
})

const isLoading = ref(true)
const mod = computed(() => {
  const foundMod = modsStore.getModById(route.params.id as string)
  return foundMod
})

// Watch for mod changes to update loading state
watch(mod, (newMod) => {
  if (newMod) {
    isLoading.value = false
  }
}, { immediate: true })

const activeTab = ref('features')
const activeImageIndex = ref(0)
const showPurchaseModal = ref(false)

// Reset component state when route parameters change
watch(() => route.params.id, () => {
  isLoading.value = true
  activeTab.value = 'features'
  activeImageIndex.value = 0
  showPurchaseModal.value = false
  // Ensure store is initialized when route changes
  modsStore.updateCategoryCounts()
}, { immediate: true })

const relatedMods = computed(() => {
  if (!mod.value) return []
  return modsStore.mods
    .filter(m => m.category === mod.value?.category && m.id !== mod.value?.id)
    .slice(0, 3)
})

const isPaid = computed(() => mod.value?.pricing.type === 'paid')

const hasDiscount = computed(() => 
  isPaid.value && 
  mod.value?.pricing.originalPrice && 
  mod.value?.pricing.discountPercentage
)

const isOnSale = computed(() => {
  if (!hasDiscount.value || !mod.value?.pricing.saleEndDate) return false
  return new Date(mod.value.pricing.saleEndDate) > new Date()
})

const formatPrice = (price: number) => {
  return `₹${price.toFixed(2)}`
}
</script>

<template>
  <!-- Mod Content - Show when mod exists -->
  <div class="mod-preview" v-if="mod">
    <!-- ...existing code... -->
    <!-- Breadcrumbs -->
    <nav class="mod-breadcrumbs" aria-label="Breadcrumb navigation">
      <ol class="breadcrumb-list">
        <li class="breadcrumb-item">
          <RouterLink to="/" class="breadcrumb-link">
            <i class="fas fa-home"></i>
            <span>Home</span>
          </RouterLink>
        </li>
        <li class="breadcrumb-separator">
          <i class="fas fa-chevron-right"></i>
        </li>
        <li class="breadcrumb-item">
          <RouterLink to="/mods" class="breadcrumb-link">
            <i class="fas fa-puzzle-piece"></i>
            <span>Mods</span>
          </RouterLink>
        </li>
        <li class="breadcrumb-separator">
          <i class="fas fa-chevron-right"></i>
        </li>
        <li class="breadcrumb-item">
          <RouterLink :to="{ path: '/mods', query: { category: mod.category } }" class="breadcrumb-link">
            <i class="fas fa-tag"></i>
            <span>{{ mod.category }}</span>
          </RouterLink>
        </li>
        <li class="breadcrumb-separator">
          <i class="fas fa-chevron-right"></i>
        </li>
        <li class="breadcrumb-item breadcrumb-current" aria-current="page">
          <span class="breadcrumb-text">{{ mod.title }}</span>
        </li>
      </ol>
    </nav>
    
    <!-- Mod Header -->
    <div class="mod-header">
      <ModGallery 
        :images="mod.images" 
        v-model:activeIndex="activeImageIndex" 
      />
      
      <div class="mod-info">
        <h1 class="mod-title">{{ mod.title }}</h1>
        
        <div class="mod-author">
          <img :src="mod.author.avatar" :alt="mod.author.name">
          <div>
            <div>Uploaded by <strong>{{ mod.author.name }}</strong></div>
            <small v-if="mod.author.isVerified">
              Verified Uploader <i class="fas fa-check-circle" style="color: var(--accent);"></i>
            </small>
          </div>
        </div>
        
        <div class="mod-meta">
          <div class="mod-meta-item">
            <i class="fas fa-tag"></i>
            <span>{{ mod.category }}</span>
          </div>
          <div class="mod-meta-item">
            <i class="fas fa-download"></i>
            <span>{{ mod.downloads.toLocaleString() }} downloads</span>
          </div>
          <div class="mod-meta-item">
            <i class="fas fa-calendar-alt"></i>
            <span>Updated: {{ new Date(mod.updatedAt).toLocaleDateString() }}</span>
          </div>
          <div class="mod-meta-item">
            <i class="fas fa-database"></i>
            <span>Size: {{ mod.size }}</span>
          </div>
          <div class="mod-meta-item">
            <i class="fas fa-code-branch"></i>
            <span>Version: {{ mod.version }}</span>
          </div>
        </div>
        
        <div class="mod-rating">
          <div class="mod-rating-stars">
            <i v-for="n in 5" :key="n" 
               class="fas" 
               :class="n <= Math.floor(mod.rating) ? 'fa-star' : (n - 0.5 <= mod.rating ? 'fa-star-half-alt' : 'fa-star')">
            </i>
          </div>
          <div class="mod-rating-count">{{ mod.rating }} ({{ mod.ratingCount }} reviews)</div>
        </div>
        
        <p class="mod-description">
          {{ mod.description }}
        </p>
        
        <!-- Pricing Section -->
        <div v-if="isPaid" class="mod-pricing-section">
          <div class="pricing-info">
            <div class="price-display">
              <div v-if="hasDiscount && isOnSale" class="price-with-discount">
                <span class="sale-badge">SALE</span>
                <span class="original-price">₹{{ mod.pricing.originalPrice?.toFixed(2) }}</span>
                <span class="current-price">{{ formatPrice(mod.pricing.price!) }}</span>
                <span class="discount-text">Save {{ mod.pricing.discountPercentage }}%</span>
              </div>
              <div v-else class="price-normal">
                <span class="current-price">{{ formatPrice(mod.pricing.price!) }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Free Mod Benefits Section -->
        <div v-else class="mod-benefits-section">
          <div class="benefits-header">
            <i class="fas fa-star"></i>
            <h3>What's Included</h3>
          </div>
          <div class="benefits-list">
            <div class="benefit-item">
              <i class="fas fa-download text-green"></i>
              <span>Instant Download</span>
            </div>
            <div class="benefit-item">
              <i class="fas fa-infinity text-blue"></i>
              <span>Lifetime Access</span>
            </div>
            <div class="benefit-item">
              <i class="fas fa-users text-purple"></i>
              <span>Community Support</span>
            </div>
            <div class="benefit-item">
              <i class="fas fa-shield-check text-green"></i>
              <span>Safe & Tested</span>
            </div>
          </div>
        </div>
        
        <div class="mod-actions">
          <button v-if="!isPaid" class="btn mod-download-btn free">
            <i class="fas fa-download"></i> Download Free
          </button>
          <div v-else class="paid-mod-purchase">
            <button @click="showPurchaseModal = true" class="btn mod-purchase-btn">
              <i class="fas fa-shopping-cart"></i>
              <span>Purchase for {{ formatPrice(mod.pricing.price!) }}</span>
              <div class="btn-shine"></div>
            </button>
            <div class="purchase-info">
              <div class="purchase-features">
                <div class="feature-item">
                  <i class="fas fa-bolt"></i>
                  <span>Instant Download</span>
                </div>
                <div class="feature-item">
                  <i class="fas fa-shield-check"></i>
                  <span>No Refunds</span>
                </div>
                <div class="feature-item">
                  <i class="fas fa-sync"></i>
                  <span>Free Updates</span>
                </div>
              </div>
            </div>
          </div>
          <button class="mod-favorite-btn">
            <i class="fas fa-heart"></i> Add to Favorites
          </button>
        </div>
        
        <div class="mod-details">
          <div class="mod-detail-tag">
            <i class="fas fa-check-circle"></i> Verified Mod
          </div>
          <div class="mod-detail-tag">
            <i class="fas fa-shield-alt"></i> Virus Checked
          </div>
          <div class="mod-detail-tag">
            <i class="fas fa-lock"></i> Safe Install
          </div>
        </div>
      </div>
    </div>
    
    <!-- Mod Tabs -->
    <ModTabs 
      v-model:activeTab="activeTab"
      :mod="mod"
    />
    
    <!-- Related Mods -->
    <div class="related-mods" v-if="relatedMods.length > 0">
      <h2>You May Also Like</h2>
      <div class="related-mods-grid">
        <ModCard 
          v-for="relatedMod in relatedMods" 
          :key="relatedMod.id" 
          :mod="relatedMod" 
        />
      </div>
    </div>
  </div>
  
  <!-- Purchase Modal -->
  <div v-if="showPurchaseModal" class="modal-overlay" @click="showPurchaseModal = false">
    <div class="purchase-modal" @click.stop>
      <div class="modal-header">
        <h3><i class="fas fa-shopping-bag"></i> Purchase {{ mod?.title }}</h3>
        <button @click="showPurchaseModal = false" class="modal-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="modal-body">
        <div class="price-section">
          <div v-if="hasDiscount && isOnSale" class="price-with-discount">
            <span class="sale-badge">LIMITED TIME</span>
            <div class="price-comparison">
              <span class="original-price">₹{{ mod?.pricing.originalPrice?.toFixed(2) }}</span>
              <span class="current-price">{{ formatPrice(mod?.pricing.price!) }}</span>
            </div>
            <span class="savings">You save ₹{{ ((mod?.pricing.originalPrice || 0) - (mod?.pricing.price || 0)).toFixed(2) }}</span>
          </div>
          <div v-else class="price-normal">
            <span class="current-price">{{ formatPrice(mod?.pricing.price!) }}</span>
          </div>
        </div>

        <div class="purchase-benefits">
          <h4>What you get:</h4>
          <div class="benefits-grid">
            <div class="benefit">
              <i class="fas fa-download text-green"></i>
              <span>Instant Download Link</span>
            </div>
            <div class="benefit">
              <i class="fas fa-sync text-blue"></i>
              <span>Free Updates for Life</span>
            </div>
            <div class="benefit">
              <i class="fas fa-headset text-purple"></i>
              <span>24/7 Support</span>
            </div>
            <div class="benefit">
              <i class="fas fa-certificate text-yellow"></i>
              <span>Premium Quality</span>
            </div>
          </div>
        </div>

        <div class="contact-section">
          <h4>Choose your payment method:</h4>
          <div class="contact-options">
            <a :href="`mailto:sales@fs25modshub.com?subject=Purchase Request: ${mod?.title}&body=Hi, I would like to purchase the mod '${mod?.title}' for ${formatPrice(mod?.pricing.price!)}. Please provide payment instructions.`" 
               class="contact-option primary">
              <div class="option-icon">
                <i class="fas fa-envelope"></i>
              </div>
              <div class="option-content">
                <h5>Email Purchase</h5>
                <p>Send us an email and get payment details</p>
                <span class="option-badge">Recommended</span>
              </div>
            </a>
            
            <a href="https://t.me/fs25modshub" target="_blank" class="contact-option">
              <div class="option-icon telegram">
                <i class="fab fa-telegram"></i>
              </div>
              <div class="option-content">
                <h5>Telegram</h5>
                <p>Quick chat support for instant purchase</p>
                <span class="option-badge">Fastest</span>
              </div>
            </a>
            
            <a href="https://discord.gg/fs25modshub" target="_blank" class="contact-option">
              <div class="option-icon discord">
                <i class="fab fa-discord"></i>
              </div>
              <div class="option-content">
                <h5>Discord</h5>
                <p>Join our community and purchase</p>
                <span class="option-badge">Community</span>
              </div>
            </a>
          </div>
        </div>

        <div class="modal-footer">
          <div class="security-note">
            <i class="fas fa-shield-alt"></i>
            <span>Secure transaction • No refunds • Instant delivery after payment</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Loading State - Show when no mod found yet and still loading -->
  <div v-else-if="!mod && isLoading" class="mod-loading">
    <div class="loading-spinner">
      <i class="fas fa-spinner fa-spin"></i>
    </div>
    <h2>Loading mod...</h2>
    <p>Please wait while we fetch the mod details.</p>
  </div>
  
  <!-- Mod Not Found - Show only when no mod found and not loading -->
  <div v-else-if="!mod && !isLoading" class="mod-not-found">
    <div class="not-found-icon">
      <i class="fas fa-search-minus"></i>
    </div>
    <h2>Mod not found</h2>
    <p>The mod you're looking for doesn't exist or may have been removed.</p>
    <div class="not-found-actions">
      <RouterLink to="/mods" class="btn primary">
        <i class="fas fa-arrow-left"></i> Back to Mods
      </RouterLink>
      <RouterLink to="/" class="btn secondary">
        <i class="fas fa-home"></i> Go Home
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.mod-preview {
  max-width: 1400px;
  margin: 3rem auto;
  padding: 0 2rem;
  width: 100%;
  overflow-x: hidden;
}

.mod-breadcrumbs {
  margin-bottom: 1.5rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: var(--radius);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.breadcrumb-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.9rem;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
}

.breadcrumb-link {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--primary);
  text-decoration: none;
  transition: var(--transition);
  padding: 0.3rem 0.5rem;
  border-radius: 4px;
  font-weight: 500;
}

.breadcrumb-link:hover {
  background: rgba(39, 174, 96, 0.1);
  color: var(--primary-dark);
}

.breadcrumb-link i {
  font-size: 0.8rem;
  opacity: 0.8;
}

.breadcrumb-separator {
  color: var(--text-light);
  opacity: 0.6;
  margin: 0 0.2rem;
}

.breadcrumb-separator i {
  font-size: 0.7rem;
}

.breadcrumb-current {
  color: var(--text);
  font-weight: 600;
}

.breadcrumb-text {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mod-header {
  display: flex;
  gap: 3rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
  width: 100%;
}

.mod-info {
  flex: 1;
  min-width: 300px;
  width: 100%;
}

.mod-title {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: var(--dark);
  line-height: 1.2;
}

.mod-author {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 1.5rem;
}

.mod-author img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.mod-author div {
  line-height: 1.4;
}

.mod-author strong {
  display: block;
}

.mod-author small {
  color: var(--text-light);
  font-size: 0.85rem;
}

.mod-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.mod-meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
}

.mod-meta-item i {
  color: var(--primary);
}

.mod-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.mod-rating-stars {
  color: var(--secondary);
  font-size: 1.2rem;
  display: flex;
  gap: 0.2rem;
}

.mod-rating-count {
  color: var(--text-light);
  font-size: 0.9rem;
}

.mod-description {
  margin-bottom: 2rem;
  line-height: 1.8;
  color: var(--text);
}

.mod-pricing-section {
  margin: 2rem 0;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  border: 2px solid rgba(39, 174, 96, 0.1);
}

.pricing-info {
  text-align: center;
}

.price-display {
  margin-bottom: 1rem;
}

.price-with-discount {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.sale-badge {
  background: #f39c12;
  color: white;
  padding: 0.3rem 1rem;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 600;
  animation: pulse 2s infinite;
}

.original-price {
  color: var(--text-light);
  font-size: 1.1rem;
  text-decoration: line-through;
}

.current-price {
  color: var(--primary);
  font-size: 2rem;
  font-weight: 700;
}

.discount-text {
  color: #e74c3c;
  font-weight: 600;
  font-size: 0.9rem;
}

.price-normal .current-price {
  font-size: 2.5rem;
}

.mod-benefits-section {
  margin: 2rem 0;
  padding: 1.5rem;
  background: linear-gradient(135deg, rgba(39, 174, 96, 0.05) 0%, rgba(46, 204, 113, 0.03) 100%);
  border-radius: 12px;
  border: 2px solid rgba(39, 174, 96, 0.15);
}

.benefits-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  color: var(--primary);
}

.benefits-header i {
  font-size: 1.5rem;
  color: var(--primary);
}

.benefits-header h3 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text);
}

.benefits-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: white;
  border-radius: 8px;
  border: 1px solid rgba(39, 174, 96, 0.1);
  transition: all 0.3s ease;
}

.benefit-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.15);
  border-color: rgba(39, 174, 96, 0.3);
}

.benefit-item i {
  font-size: 1.1rem;
  width: 20px;
  text-align: center;
}

.benefit-item span {
  font-weight: 500;
  color: var(--text);
  font-size: 0.9rem;
}

.paid-mod-purchase {
  width: 100%;
}

.mod-purchase-btn {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
  border: none;
  padding: 1.2rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 8px 20px rgba(231, 76, 60, 0.3);
}

.mod-purchase-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(231, 76, 60, 0.4);
}

.btn-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.mod-purchase-btn:hover .btn-shine {
  left: 100%;
}

.purchase-info {
  margin-top: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 8px;
  border: 1px solid rgba(0,0,0,0.05);
}

.purchase-features {
  display: flex;
  justify-content: space-around;
  gap: 1rem;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  text-align: center;
  flex: 1;
}

.feature-item i {
  font-size: 1.2rem;
  color: var(--primary);
}

.feature-item span {
  font-size: 0.85rem;
  color: var(--text-light);
  font-weight: 500;
}

.mod-actions {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.mod-download-btn {
  padding: 1rem 2.5rem;
  font-size: 1.1rem;
  border-radius: 50px;
}

.mod-download-btn.free {
  background: var(--primary);
  color: white;
}

.mod-download-btn.free:hover {
  background: var(--primary-dark);
}

.mod-favorite-btn {
  background: white;
  color: var(--text);
  border: 1px solid var(--gray);
  padding: 1rem 1.5rem;
  border-radius: 50px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: var(--transition);
}

.mod-favorite-btn:hover {
  background: #f8f8f8;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
}

.mod-favorite-btn i {
  color: #e74c3c;
}

.mod-details {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

.mod-detail-tag {
  background: rgba(39, 174, 96, 0.1);
  color: var(--primary);
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.related-mods {
  margin-top: 5rem;
}

.related-mods h2 {
  font-size: 2rem;
  margin-bottom: 2rem;
  position: relative;
  padding-left: 1.5rem;
}

.related-mods h2::before {
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

.related-mods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

.mod-loading {
  text-align: center;
  padding: 4rem 2rem;
  max-width: 600px;
  margin: 0 auto;
}

.loading-spinner {
  margin-bottom: 2rem;
}

.loading-spinner i {
  font-size: 3rem;
  color: var(--primary);
  animation: spin 1s linear infinite;
}

.mod-loading h2 {
  margin-bottom: 1rem;
  color: var(--dark);
  font-size: 1.8rem;
}

.mod-loading p {
  color: var(--text-light);
  font-size: 1rem;
}

.mod-not-found {
  text-align: center;
  padding: 4rem 2rem;
  max-width: 600px;
  margin: 0 auto;
}

.not-found-icon {
  margin-bottom: 2rem;
}

.not-found-icon i {
  font-size: 4rem;
  color: var(--text-light);
  opacity: 0.6;
}

.mod-not-found h2 {
  margin-bottom: 1rem;
  color: var(--dark);
  font-size: 2rem;
}

.mod-not-found p {
  color: var(--text-light);
  font-size: 1.1rem;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.not-found-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.not-found-actions .btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
  min-width: 140px;
  justify-content: center;
}

.not-found-actions .btn.primary {
  background: var(--primary);
  color: white;
  border: 2px solid var(--primary);
}

.not-found-actions .btn.primary:hover {
  background: var(--primary-dark);
  border-color: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

.not-found-actions .btn.secondary {
  background: white;
  color: var(--text);
  border: 2px solid var(--gray);
}

.not-found-actions .btn.secondary:hover {
  background: #f8f9fa;
  border-color: var(--text-light);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Purchase Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: fadeIn 0.3s ease;
}

.purchase-modal {
  background: white;
  border-radius: 20px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

.modal-header {
  padding: 2rem 2rem 1rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: var(--text);
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-light);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background: #f0f0f0;
  color: var(--text);
}

.modal-body {
  padding: 2rem;
}

.price-section {
  text-align: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 15px;
  border: 2px solid rgba(231, 76, 60, 0.1);
}

.price-comparison {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin: 0.5rem 0;
}

.purchase-benefits {
  margin-bottom: 2rem;
}

.purchase-benefits h4 {
  margin-bottom: 1rem;
  color: var(--text);
  font-size: 1.2rem;
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.benefit {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #eee;
  text-align: center;
}

.benefit i {
  font-size: 1.5rem;
}

.text-green { color: #27ae60; }
.text-blue { color: #3498db; }
.text-purple { color: #9b59b6; }
.text-yellow { color: #f39c12; }

.contact-section h4 {
  margin-bottom: 1.5rem;
  color: var(--text);
  font-size: 1.2rem;
}

.contact-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.contact-option {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  background: white;
  border: 2px solid #eee;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.contact-option:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.contact-option.primary {
  border-color: var(--primary);
  background: linear-gradient(135deg, rgba(39, 174, 96, 0.05), rgba(39, 174, 96, 0.02));
}

.option-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  font-size: 1.5rem;
  color: white;
  background: var(--primary);
}

.option-icon.telegram { background: #0088cc; }
.option-icon.discord { background: #5865f2; }

.option-content {
  flex: 1;
}

.option-content h5 {
  margin: 0 0 0.5rem;
  color: var(--text);
  font-size: 1.1rem;
}

.option-content p {
  margin: 0 0 0.5rem;
  color: var(--text-light);
  font-size: 0.9rem;
}

.option-badge {
  background: var(--primary);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.contact-option.primary .option-badge {
  background: #e74c3c;
}

.modal-footer {
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.security-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: var(--text-light);
  font-size: 0.9rem;
  text-align: center;
}

.security-note i {
  color: var(--primary);
}

.savings {
  color: #e74c3c;
  font-weight: 600;
  font-size: 0.9rem;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(30px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

/* Enhanced Responsive Design */
@media (max-width: 1200px) {
  .mod-preview {
    max-width: 100%;
    padding: 0 1.5rem;
    margin: 2rem auto;
  }
  
  .mod-header {
    gap: 2.5rem;
  }
  
  .mod-title {
    font-size: 2.3rem;
  }
  
  .related-mods-grid {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  }
}

@media (max-width: 992px) {
  .mod-preview {
    margin: 1.5rem auto;
    padding: 0 1rem;
  }
  
  .mod-header {
    flex-direction: column;
    gap: 2rem;
  }
  
  .mod-info {
    min-width: auto;
    width: 100%;
  }
  
  .mod-title {
    font-size: 2.2rem;
  }
  
  .mod-actions {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .related-mods h2 {
    font-size: 1.8rem;
  }
  
  .related-mods-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}

@media (max-width: 768px) {
  .mod-preview {
    padding: 0 1rem;
    margin: 1rem auto;
  }
  
  .mod-breadcrumbs {
    margin-bottom: 1rem;
    padding: 0.5rem 0.75rem;
    background: rgba(255, 255, 255, 0.7);
  }
  
  .breadcrumb-list {
    font-size: 0.85rem;
    gap: 0.3rem;
  }
  
  .breadcrumb-link {
    gap: 0.3rem;
    padding: 0.25rem 0.4rem;
  }
  
  .breadcrumb-link span {
    display: none;
  }
  
  .breadcrumb-link i {
    font-size: 0.9rem;
  }
  
  .breadcrumb-current .breadcrumb-text {
    max-width: 150px;
    font-size: 0.85rem;
  }
  
  .breadcrumb-separator {
    margin: 0 0.1rem;
  }
  
  .mod-title {
    font-size: 2rem;
    margin-bottom: 0.75rem;
    line-height: 1.2;
  }
  
  .mod-author {
    margin-bottom: 1.25rem;
    gap: 0.6rem;
  }
  
  .mod-author img {
    width: 36px;
    height: 36px;
  }
  
  .mod-meta {
    gap: 1rem;
    margin-bottom: 1.75rem;
    flex-wrap: wrap;
  }
  
  .mod-meta-item {
    font-size: 0.9rem;
    min-width: calc(50% - 0.5rem);
    justify-content: flex-start;
  }
  
  .mod-rating {
    margin-bottom: 1.25rem;
  }
  
  .mod-rating-stars {
    font-size: 1.1rem;
  }
  
  .mod-description {
    margin-bottom: 1.75rem;
    font-size: 0.95rem;
    line-height: 1.6;
  }
  
  .mod-actions {
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.75rem;
  }
  
  .mod-download-btn, .mod-favorite-btn {
    width: 100%;
    justify-content: center;
    padding: 0.9rem 2rem;
  }
  
  .mod-details {
    margin-bottom: 1.75rem;
    gap: 0.75rem;
  }
  
  .mod-detail-tag {
    font-size: 0.85rem;
    padding: 0.4rem 0.8rem;
    flex: 1;
    min-width: calc(50% - 0.375rem);
    justify-content: center;
  }
  
  .related-mods {
    margin-top: 3rem;
  }
  
  .related-mods h2 {
    font-size: 1.7rem;
    margin-bottom: 1.5rem;
  }
  
  .related-mods-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1.5rem;
  }
}

@media (max-width: 480px) {
  .mod-preview {
    padding: 0 0.75rem;
    margin: 0.5rem auto;
  }
  
  .mod-breadcrumbs {
    font-size: 0.85rem;
    margin-bottom: 0.75rem;
    padding: 0.4rem 0.6rem;
  }
  
  .breadcrumb-list {
    font-size: 0.8rem;
    gap: 0.25rem;
  }
  
  .breadcrumb-link {
    padding: 0.2rem 0.3rem;
    gap: 0.25rem;
  }
  
  .breadcrumb-link span {
    display: none;
  }
  
  .breadcrumb-link i {
    font-size: 0.85rem;
  }
  
  .breadcrumb-current .breadcrumb-text {
    max-width: 120px;
    font-size: 0.8rem;
  }
  
  .breadcrumb-separator {
    margin: 0;
  }
  
  .breadcrumb-separator i {
    font-size: 0.6rem;
  }
  
  .mod-title {
    font-size: 1.8rem;
    line-height: 1.1;
    margin-bottom: 1rem;
  }
  
  .mod-author {
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .mod-author img {
    width: 32px;
    height: 32px;
  }
  
  .mod-author strong {
    font-size: 0.95rem;
  }
  
  .mod-author small {
    font-size: 0.8rem;
  }
  
  .mod-meta {
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }
  
  .mod-meta-item {
    font-size: 0.85rem;
    min-width: 100%;
    padding: 0.5rem 0;
    border-bottom: 1px solid rgba(0,0,0,0.05);
  }
  
  .mod-meta-item:last-child {
    border-bottom: none;
  }
  
  .mod-rating {
    margin-bottom: 1rem;
    text-align: center;
  }
  
  .mod-rating-stars {
    font-size: 1rem;
    justify-content: center;
    margin-bottom: 0.5rem;
  }
  
  .mod-rating-count {
    font-size: 0.85rem;
  }
  
  .mod-description {
    font-size: 0.9rem;
    line-height: 1.5;
    margin-bottom: 1.5rem;
    text-align: justify;
  }
  
  .mod-download-btn {
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
    font-weight: 600;
  }
  
  .mod-favorite-btn {
    padding: 0.8rem 1.2rem;
    font-size: 0.9rem;
  }
  
  .mod-details {
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }
  
  .mod-detail-tag {
    font-size: 0.8rem;
    padding: 0.35rem 0.7rem;
    min-width: 100%;
    text-align: center;
  }
  
  .related-mods {
    margin-top: 2.5rem;
  }
  
  .related-mods h2 {
    font-size: 1.5rem;
    margin-bottom: 1.25rem;
  }
  
  .related-mods h2::before {
    width: 6px;
    height: 25px;
  }
  
  .related-mods-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
    padding: 0;
  }
}

@media (max-width: 360px) {
  .mod-preview {
    padding: 0 0.5rem;
  }
  
  .mod-title {
    font-size: 1.6rem;
  }
  
  .mod-breadcrumbs {
    padding: 0 0.5rem;
    margin-bottom: 0.5rem;
    background: rgba(255, 255, 255, 0.8);
  }
  
  .breadcrumb-list {
    font-size: 0.75rem;
    gap: 0.2rem;
  }
  
  .breadcrumb-link {
    padding: 0.15rem 0.25rem;
  }
  
  .breadcrumb-link i {
    font-size: 0.8rem;
  }
  
  .breadcrumb-current .breadcrumb-text {
    max-width: 100px;
    font-size: 0.75rem;
  }
  
  .breadcrumb-separator i {
    font-size: 0.55rem;
  }
  
  .mod-meta-item {
    font-size: 0.8rem;
  }
  
  .mod-download-btn, .mod-favorite-btn {
    font-size: 0.9rem;
    padding: 0.7rem 1.2rem;
  }
  
  .related-mods h2 {
    font-size: 1.4rem;
    padding-left: 0.5rem;
  }
  
  .mod-author img {
    width: 28px;
    height: 28px;
  }
}

/* Purchase Modal Responsive */
@media (max-width: 768px) {
  .purchase-modal {
    margin: 1rem;
    max-width: calc(100vw - 2rem);
  }
  
  .modal-header, .modal-body {
    padding: 1.5rem;
  }
  
  .benefits-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
  
  .contact-option {
    padding: 1rem;
  }
  
  .option-icon {
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
  }
}

@media (max-width: 480px) {
  .modal-overlay {
    padding: 0.5rem;
  }
  
  .purchase-modal {
    border-radius: 15px;
  }
  
  .modal-header, .modal-body {
    padding: 1rem;
  }
  
  .benefits-grid {
    grid-template-columns: 1fr;
  }
  
  .purchase-features {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .feature-item {
    flex-direction: row;
    justify-content: center;
  }
}
</style>