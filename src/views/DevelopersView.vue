<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDevelopersStore } from '@/stores/developers'

const developersStore = useDevelopersStore()
const searchQuery = ref('')
const selectedRole = ref('all')
const sortBy = ref('featured')

// Get developers from store and compute filtered/sorted results
const filteredDevelopers = computed(() => {
  let result = developersStore.developers
  
  // Filter by search query
  if (searchQuery.value.trim()) {
    result = developersStore.searchDevelopers(searchQuery.value)
  }
  
  // Filter by role
  if (selectedRole.value !== 'all') {
    result = result.filter(dev => dev.role === selectedRole.value)
  }
  
  // Sort results
  return developersStore.sortDevelopers(sortBy.value).filter(dev => 
    result.includes(dev)
  )
})

const uniqueRoles = computed(() => developersStore.getUniqueRoles())
</script>

<template>
  <div class="developers-page">
    <!-- Page Header -->
    <section class="page-header">
      <div class="container">
        <div class="header-content">
          <h1><i class="fas fa-users"></i> Our Contributors</h1>
          <p>Meet the talented modders, developers, and creators behind FS25 Mods Hub</p>
          <span class="header-subtitle">Discover the passionate community that makes our platform the best destination for FS25 mods</span>
        </div>
      </div>
    </section>

    <!-- Filters Section -->
    <section class="filters-section">
      <div class="container">
        <div class="filters-container">
          <div class="search-filter">
            <i class="fas fa-search"></i>
            <input 
              v-model="searchQuery" 
              @input=""
              type="text" 
              placeholder="Search modders, developers, and creators..."
              class="search-input"
            >
          </div>
          
          <div class="role-filter">
            <select v-model="selectedRole" @change="" class="role-select">
              <option value="all">All Roles</option>
              <option v-for="role in uniqueRoles" :key="role" :value="role">{{ role }}</option>
            </select>
          </div>
          
          <div class="sort-filter">
            <select v-model="sortBy" @change="" class="sort-select">
              <option value="featured">Featured First</option>
              <option value="name">Name (A-Z)</option>
              <option value="mods">Most Mods</option>
              <option value="downloads">Most Downloads</option>
            </select>
          </div>
        </div>
      </div>
    </section>

    <!-- Developers Grid -->
    <section class="developers-section">
      <div class="container">
        <div class="developers-grid">
          <div 
            v-for="developer in filteredDevelopers" 
            :key="developer.id"
            class="developer-card"
            :class="{ 'featured': developer.featured }"
          >
            <div class="developer-header">
              <div class="avatar-container">
                <img :src="developer.avatar" :alt="developer.name" class="developer-avatar">
                <div v-if="developer.featured" class="featured-badge">
                  <i class="fas fa-star"></i>
                </div>
              </div>
              <div class="developer-info">
                <h3 class="developer-name">{{ developer.name }}</h3>
                <p class="developer-role">{{ developer.role }}</p>
              </div>
            </div>

            <div class="developer-bio">
              <p>{{ developer.bio }}</p>
            </div>

            <div class="developer-specialties">
              <h4><i class="fas fa-cogs"></i> Specialties</h4>
              <div class="specialties-list">
                <span 
                  v-for="specialty in developer.specialties" 
                  :key="specialty"
                  class="specialty-tag"
                >
                  {{ specialty }}
                </span>
              </div>
            </div>

            <div class="developer-stats">
              <div class="stat-item">
                <i class="fas fa-cube"></i>
                <div>
                  <span class="stat-number">{{ developer.stats.modsPublished }}</span>
                  <span class="stat-label">Mods</span>
                </div>
              </div>
              <div class="stat-item">
                <i class="fas fa-download"></i>
                <div>
                  <span class="stat-number">{{ developer.stats.totalDownloads }}</span>
                  <span class="stat-label">Downloads</span>
                </div>
              </div>
              <div class="stat-item">
                <i class="fas fa-calendar"></i>
                <div>
                  <span class="stat-number">{{ developer.stats.yearsActive }}</span>
                  <span class="stat-label">Years</span>
                </div>
              </div>
            </div>

            <div class="developer-contact">
              <h4><i class="fas fa-envelope"></i> Contact</h4>
              <div class="contact-links">
                <a 
                  v-if="developer.contact.email" 
                  :href="`mailto:${developer.contact.email}`"
                  class="contact-link email"
                  :title="developer.contact.email"
                >
                  <i class="fas fa-envelope"></i>
                </a>
                <a 
                  v-if="developer.contact.discord" 
                  href="#"
                  class="contact-link discord"
                  :title="developer.contact.discord || ''"
                >
                  <i class="fab fa-discord"></i>
                </a>
                <a 
                  v-if="developer.contact.telegram" 
                  :href="`https://t.me/${(developer.contact.telegram || '').replace('@', '')}`"
                  class="contact-link telegram"
                  :title="developer.contact.telegram || ''"
                  target="_blank"
                >
                  <i class="fab fa-telegram"></i>
                </a>
                <a 
                  v-if="developer.contact.website" 
                  :href="`https://${developer.contact.website}`"
                  class="contact-link website"
                  :title="developer.contact.website || ''"
                  target="_blank"
                >
                  <i class="fas fa-globe"></i>
                </a>
                <a 
                  v-if="developer.contact.github" 
                  :href="`https://${developer.contact.github}`"
                  class="contact-link github"
                  :title="developer.contact.github || ''"
                  target="_blank"
                >
                  <i class="fab fa-github"></i>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div v-if="filteredDevelopers.length === 0" class="no-results">
          <i class="fas fa-search"></i>
          <h3>No contributors found</h3>
          <p>Try adjusting your search criteria or filters</p>
        </div>
      </div>
    </section>

    <!-- Join Us Section -->
    <section class="join-section">
      <div class="container">
        <div class="join-content">
          <h2><i class="fas fa-handshake"></i> Want to Join Our Community?</h2>
          <p>We welcome all talented modders, developers, and creators to join our community! If you're passionate about Farming Simulator and want to share your creations with thousands of players worldwide, we'd love to feature you here. Upload your mods and become part of our growing community of contributors!</p>
          <div class="join-actions">
            <a href="mailto:jagdeepsekhon101@gmail.com" class="btn btn-primary">
              <i class="fas fa-envelope"></i>
              Contact Us
            </a>
            <a href="/upload" class="btn btn-secondary">
              <i class="fas fa-upload"></i>
              Submit Your Mods
            </a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Developers Page Styles */
.developers-page {
  min-height: 100vh;
  background: var(--bg);
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Page Header */
.page-header {
  background: linear-gradient(135deg, var(--darker) 0%, var(--dark) 100%);
  position: relative;
  overflow: hidden;
  padding: 6rem 0 4rem;
}

.page-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="devpattern" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="2" fill="white" opacity="0.05"/><circle cx="75" cy="25" r="2" fill="white" opacity="0.05"/><circle cx="25" cy="75" r="2" fill="white" opacity="0.05"/><circle cx="75" cy="75" r="2" fill="white" opacity="0.05"/></pattern></defs><rect width="100" height="100" fill="url(%23devpattern)"/></svg>');
  opacity: 0.1;
}

.header-content {
  text-align: center;
  position: relative;
  z-index: 2;
}

.page-header h1 {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  color: white;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.page-header h1 i {
  color: var(--primary);
  font-size: 3rem;
}

.page-header p {
  font-size: 1.3rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.5rem;
  font-weight: 400;
}

.header-subtitle {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  font-style: italic;
}

/* Filters Section */
.filters-section {
  background: var(--card-bg);
  padding: 2rem 0;
  border-bottom: var(--border);
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.filters-container {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 1.5rem;
  align-items: center;
}

.search-filter {
  position: relative;
}

.search-filter i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text);
  opacity: 0.6;
}

.search-input {
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 2.5rem;
  border: var(--border);
  border-radius: var(--radius);
  background: var(--bg);
  color: var(--text);
  font-size: 1rem;
  transition: var(--transition);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.1);
}

.role-select,
.sort-select {
  width: 100%;
  padding: 0.8rem 1rem;
  border: var(--border);
  border-radius: var(--radius);
  background: var(--bg);
  color: var(--text);
  font-size: 1rem;
  cursor: pointer;
  transition: var(--transition);
}

.role-select:focus,
.sort-select:focus {
  outline: none;
  border-color: var(--primary);
}

/* Developers Grid */
.developers-section {
  padding: 4rem 0;
}

.developers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.developer-card {
  background: var(--card-bg);
  border-radius: var(--radius);
  padding: 2rem;
  border: var(--border);
  transition: var(--transition);
  position: relative;
  overflow: hidden;
}

.developer-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0,0,0,0.1);
}

.developer-card.featured {
  border: 2px solid var(--primary);
  background: linear-gradient(135deg, var(--card-bg) 0%, rgba(39, 174, 96, 0.02) 100%);
}

.developer-card.featured::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%);
}

.developer-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.avatar-container {
  position: relative;
}

.developer-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid var(--primary);
  object-fit: cover;
}

.featured-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: var(--primary);
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  border: 2px solid var(--card-bg);
}

.developer-name {
  color: var(--dark);
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.developer-role {
  color: var(--primary);
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
}

.developer-bio {
  margin-bottom: 1.5rem;
}

.developer-bio p {
  color: var(--text);
  line-height: 1.6;
  margin: 0;
}

.developer-specialties,
.developer-contact {
  margin-bottom: 1.5rem;
}

.developer-specialties h4,
.developer-contact h4 {
  color: var(--dark);
  font-size: 1rem;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.developer-specialties h4 i,
.developer-contact h4 i {
  color: var(--primary);
  font-size: 0.9rem;
}

.specialties-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.specialty-tag {
  background: rgba(39, 174, 96, 0.1);
  color: var(--primary);
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  border: 1px solid rgba(39, 174, 96, 0.2);
}

.developer-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--bg);
  border-radius: var(--radius);
  border: var(--border);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-align: center;
}

.stat-item i {
  color: var(--primary);
  font-size: 1.2rem;
  width: 20px;
  text-align: center;
}

.stat-number {
  display: block;
  color: var(--dark);
  font-size: 1.1rem;
  font-weight: 600;
}

.stat-label {
  display: block;
  color: var(--text);
  font-size: 0.85rem;
  opacity: 0.8;
}

.contact-links {
  display: flex;
  gap: 0.75rem;
}

.contact-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: white;
  text-decoration: none;
  transition: var(--transition);
  font-size: 1.1rem;
}

.contact-link:hover {
  transform: translateY(-2px) scale(1.05);
}

.contact-link.email {
  background: #3498db;
}

.contact-link.discord {
  background: #7289da;
}

.contact-link.telegram {
  background: #0088cc;
}

.contact-link.website {
  background: #2c3e50;
}

.contact-link.github {
  background: #333;
}

/* No Results */
.no-results {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text);
}

.no-results i {
  font-size: 4rem;
  color: var(--gray);
  margin-bottom: 1rem;
}

.no-results h3 {
  color: var(--dark);
  margin-bottom: 0.5rem;
}

/* Join Section */
.join-section {
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: white;
  padding: 4rem 0;
  text-align: center;
}

.join-content h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.join-content p {
  font-size: 1.2rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  opacity: 0.95;
}

.join-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border-radius: var(--radius);
  text-decoration: none;
  font-weight: 600;
  transition: var(--transition);
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

.btn-primary {
  background: white;
  color: var(--primary);
}

.btn-primary:hover {
  background: #f8f9fa;
  transform: translateY(-2px);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

/* Responsive Design */
@media (max-width: 1200px) {
  .container {
    padding: 0 1.5rem;
  }
  
  .developers-grid {
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  }
}

@media (max-width: 992px) {
  .page-header h1 {
    font-size: 3rem;
  }
  
  .filters-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .developers-grid {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
  
  .page-header {
    padding: 4rem 0 3rem;
  }
  
  .page-header h1 {
    font-size: 2.5rem;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .page-header h1 i {
    font-size: 2.5rem;
  }
  
  .developers-section {
    padding: 3rem 0;
  }
  
  .developers-grid {
    grid-template-columns: 1fr;
  }
  
  .developer-card {
    padding: 1.5rem;
  }
  
  .developer-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .developer-stats {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .join-content h2 {
    font-size: 2rem;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .join-actions {
    flex-direction: column;
    align-items: center;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: 3rem 0 2rem;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .page-header h1 i {
    font-size: 2rem;
  }
  
  .filters-section {
    padding: 1.5rem 0;
  }
  
  .developers-section {
    padding: 2rem 0;
  }
  
  .developer-card {
    padding: 1.25rem;
  }
  
  .join-section {
    padding: 3rem 0;
  }
  
  .join-content h2 {
    font-size: 1.8rem;
  }
}

@media (max-width: 360px) {
  .container {
    padding: 0 0.75rem;
  }
  
  .page-header h1 {
    font-size: 1.8rem;
  }
  
  .developer-card {
    padding: 1rem;
  }
}
</style>
