<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'

const router = useRouter()
const route = useRoute()
const isMobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  
  // Prevent body scroll when menu is open
  if (isMobileMenuOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
  document.body.style.overflow = ''
}

// Close menu when route changes
watch(route, () => {
  closeMobileMenu()
})

// Close menu on escape key
const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isMobileMenuOpen.value) {
    closeMobileMenu()
  }
}

// Close menu when clicking outside
const handleClickOutside = (e: MouseEvent) => {
  const nav = document.querySelector('.nav')
  const toggle = document.querySelector('.mobile-menu-toggle')
  
  if (nav && toggle && !nav.contains(e.target as Node) && !toggle.contains(e.target as Node)) {
    closeMobileMenu()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
  document.removeEventListener('click', handleClickOutside)
  document.body.style.overflow = ''
})

// Function to scroll to top
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// Handle navigation link clicks
const handleNavClick = () => {
  closeMobileMenu()
  // Small delay to allow navigation to complete
  setTimeout(() => {
    scrollToTop()
  }, 100)
}
</script>

<template>
  <header class="header">
    <div class="header-container">
      <RouterLink to="/" class="logo" @click="handleNavClick">
        <i class="fas fa-tractor"></i>
        <span>FS25 Mods Hub</span>
      </RouterLink>
      
      <button 
        class="mobile-menu-toggle" 
        @click="toggleMobileMenu"
        :class="{ 'active': isMobileMenuOpen }"
        aria-label="Toggle navigation menu"
      >
        <div class="hamburger">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>
      
      <!-- Mobile menu overlay -->
      <div v-if="isMobileMenuOpen" class="mobile-overlay" @click="closeMobileMenu"></div>
      
      <nav class="nav" :class="{ 'nav-open': isMobileMenuOpen }">
        <!-- Mobile menu content -->
        <div class="mobile-menu-header">
          <div class="mobile-logo">
            <i class="fas fa-tractor"></i>
            <span>FS25 Mods Hub</span>
          </div>
          <button class="mobile-close" @click="closeMobileMenu">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <!-- Desktop navigation -->
        <ul class="desktop-nav">
          <li>
            <RouterLink to="/" @click="handleNavClick">Home</RouterLink>
          </li>
          <li>
            <RouterLink to="/mods" @click="handleNavClick">Mods</RouterLink>
          </li>
          <li>
            <RouterLink to="/categories" @click="handleNavClick">Categories</RouterLink>
          </li>
          <li>
            <RouterLink to="/developers" @click="handleNavClick">Contributors</RouterLink>
          </li>
        </ul>
        
        <!-- Mobile navigation list -->
        <ul class="mobile-nav-list">
          <li>
            <RouterLink to="/" @click="handleNavClick">
              <i class="fas fa-home"></i>
              <span>Home</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/mods" @click="handleNavClick">
              <i class="fas fa-puzzle-piece"></i>
              <span>Mods</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/categories" @click="handleNavClick">
              <i class="fas fa-th-large"></i>
              <span>Categories</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/developers" @click="handleNavClick">
              <i class="fas fa-users"></i>
              <span>Contributors</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/upload" @click="handleNavClick">
              <i class="fas fa-cloud-upload-alt"></i>
              <span>Upload</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/login" @click="handleNavClick">
              <i class="fas fa-sign-in-alt"></i>
              <span>Login</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/register" @click="handleNavClick">
              <i class="fas fa-user-plus"></i>
              <span>Register</span>
            </RouterLink>
          </li>
        </ul>
        <div class="mobile-menu-footer">
          <RouterLink to="/register" class="mobile-upload-btn" @click="handleNavClick">
            <i class="fas fa-user-plus"></i>
            <span>Join Now</span>
          </RouterLink>
        </div>
      </nav>
      
      <div class="header-actions" :class="{ 'actions-open': isMobileMenuOpen }">
        <RouterLink to="/login" class="btn btn-outline" @click="handleNavClick">
          <i class="fas fa-sign-in-alt"></i> 
          <span class="btn-text">Login</span>
        </RouterLink>
        <RouterLink to="/register" class="btn btn-primary" @click="handleNavClick">
          <i class="fas fa-user-plus"></i> 
          <span class="btn-text">Register</span>
        </RouterLink>
        <RouterLink to="/upload" class="btn btn-secondary" @click="handleNavClick">
          <i class="fas fa-cloud-upload-alt"></i> 
          <span class="btn-text">Upload</span>
        </RouterLink>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  background: var(--darker);
  color: white;
  padding: 0.8rem 0;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  position: sticky;
  top: 0;
  z-index: 1000;
  border-bottom: 2px solid var(--primary);
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.7rem;
  font-weight: 700;
  color: white;
  text-decoration: none;
}

.logo i {
  color: var(--primary);
  font-size: 2.2rem;
  transition: var(--transition);
}

.logo:hover i {
  transform: rotate(15deg);
}

.logo span {
  background: linear-gradient(to right, var(--primary), var(--accent));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 700;
}

nav ul {
  display: flex;
  list-style: none;
  gap: 1.8rem;
}

nav a {
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-weight: 500;
  transition: var(--transition);
  padding: 0.6rem 0;
  position: relative;
  font-size: 1.05rem;
}

nav a::after {
  content: '';
  position: absolute;
  width: 0;
  height: 3px;
  background: var(--primary);
  bottom: 0;
  left: 0;
  transition: var(--transition);
  border-radius: 3px;
}

nav a:hover, nav a.router-link-active {
  color: white;
}

nav a:hover::after, nav a.router-link-active::after {
  width: 100%;
}

/* Desktop Navigation */
.desktop-nav {
  display: flex;
  list-style: none;
  gap: 1.8rem;
  margin: 0;
  padding: 0;
}

/* Mobile Navigation - Hidden by default */
.mobile-menu-header,
.mobile-nav-list,
.mobile-menu-footer {
  display: none;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}

/* Mobile Menu Toggle Button */
.mobile-menu-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.75rem;
  z-index: 1000;
  position: relative;
  border-radius: 8px;
  transition: var(--transition);
}

.mobile-menu-toggle:hover {
  background: rgba(255, 255, 255, 0.1);
}

.hamburger {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mobile-menu-toggle span {
  width: 24px;
  height: 2px;
  background: white;
  transition: all 0.3s ease;
  border-radius: 2px;
}

.mobile-menu-toggle.active span:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.mobile-menu-toggle.active span:nth-child(2) {
  opacity: 0;
}

.mobile-menu-toggle.active span:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -6px);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  background: var(--primary);
  color: white;
  padding: 0.8rem 1.8rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  transition: var(--transition);
  border: none;
  cursor: pointer;
  font-size: 1rem;
  box-shadow: 0 4px 15px rgba(39, 174, 96, 0.3);
}

.btn:hover {
  background: var(--primary-dark);
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(39, 174, 96, 0.4);
}

.btn-primary {
  background: var(--primary);
  box-shadow: 0 4px 15px rgba(39, 174, 96, 0.3);
}

.btn-primary:hover {
  background: var(--primary-dark);
  box-shadow: 0 6px 20px rgba(39, 174, 96, 0.4);
}

.btn-outline {
  background: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: none;
}

.btn-outline:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 255, 255, 0.1);
}

.btn-secondary {
  background: var(--secondary);
  box-shadow: 0 4px 15px rgba(243, 156, 18, 0.3);
}

.btn-secondary:hover {
  background: #e67e22;
  box-shadow: 0 6px 20px rgba(243, 156, 18, 0.4);
}

/* Enhanced Responsive Design */
@media (max-width: 1200px) {
  .header-container {
    padding: 0 1.5rem;
  }
  
  .logo {
    font-size: 1.6rem;
  }
  
  .logo i {
    font-size: 2rem;
  }
}

.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 1000;
  transition: all 0.3s ease;
  opacity: 0;
  visibility: hidden;
}

.mobile-overlay.active {
  opacity: 1;
  visibility: visible;
}

@media (max-width: 992px) {
  .mobile-menu-toggle {
    display: flex;
  }
  
  /* Hide desktop navigation on mobile */
  .desktop-nav {
    display: none;
  }
  
  .nav {
    position: fixed;
    top: 0;
    right: -100%;
    width: 320px;
    height: 100vh;
    background: linear-gradient(135deg, var(--darker) 0%, #1a1a1a 100%);
    transition: all 0.3s ease;
    z-index: 1001;
    box-shadow: -4px 0 20px rgba(0,0,0,0.3);
    display: flex;
    flex-direction: column;
  }
  
  .nav-open {
    right: 0;
  }
  
  /* Show mobile navigation elements */
  .mobile-menu-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.2);
  }
  
  .mobile-nav-list {
    display: block;
    flex: 1;
    padding: 1rem 0;
    overflow-y: auto;
  }
  
  .mobile-menu-footer {
    display: block;
    padding: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.2);
  }
  
  .mobile-logo {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: white;
    font-size: 1.2rem;
    font-weight: 600;
  }
  
  .mobile-logo i {
    font-size: 1.5rem;
    color: var(--primary);
  }
  
  .mobile-close {
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    transition: var(--transition);
  }
  
  .mobile-close:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: rotate(90deg);
  }
  
  .mobile-nav-list {
    display: block;
    flex: 1;
    padding: 1rem 0;
    overflow-y: auto;
  }
  
  .mobile-nav-list ul {
    flex-direction: column;
    gap: 0;
    padding: 0;
    margin: 0;
  }
  
  .mobile-nav-list li {
    width: 100%;
  }
  
  .mobile-nav-list a {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.5rem;
    font-size: 1rem;
    font-weight: 500;
    border-radius: 0;
    transition: all 0.3s ease;
    border-left: 3px solid transparent;
  }
  
  .mobile-nav-list a:hover {
    background: rgba(39, 174, 96, 0.1);
    border-left-color: var(--primary);
    transform: translateX(5px);
  }
  
  .mobile-nav-list a.router-link-active {
    background: rgba(39, 174, 96, 0.15);
    border-left-color: var(--primary);
    color: var(--primary);
  }
  
  .mobile-nav-list a i {
    font-size: 1.1rem;
    width: 20px;
    text-align: center;
    opacity: 0.8;
  }
  
  .mobile-nav-list a::after {
    display: none;
  }
  
  .mobile-menu-footer {
    display: block;
    padding: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.2);
  }
  
  .mobile-upload-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    width: 100%;
    padding: 1rem;
    background: var(--primary);
    color: white;
    text-decoration: none;
    border-radius: 12px;
    font-weight: 600;
    transition: var(--transition);
    box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
  }
  
  .mobile-upload-btn:hover {
    background: var(--primary-dark);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(39, 174, 96, 0.4);
  }
  
  .header-actions {
    gap: 1rem;
  }
}

@media (max-width: 768px) {
  .header-container {
    padding: 0 1rem;
    gap: 1rem;
  }
  
  .logo {
    font-size: 1.4rem;
  }
  
  .logo span {
    display: none;
  }
  
  .logo i {
    font-size: 1.8rem;
  }
  
  .header-actions {
    gap: 0.8rem;
  }
  
  .btn {
    padding: 0.7rem 1.2rem;
    font-size: 0.9rem;
  }
  
  .btn-text {
    display: none;
  }
}

@media (max-width: 480px) {
  .header-container {
    padding: 0 0.75rem;
  }
  
  .header-actions {
    gap: 0.5rem;
  }
  
  .btn {
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
  }
  
  /* Hide search bar on very small screens, can be toggled */
  .search-bar {
    display: none;
  }
}

@media (max-width: 360px) {
  .header-container {
    padding: 0 0.5rem;
  }
  
  .logo i {
    font-size: 1.6rem;
  }
}
</style>