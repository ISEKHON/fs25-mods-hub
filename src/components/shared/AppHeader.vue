<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
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

// Handle logout
const handleLogout = () => {
  authStore.logout()
  router.push('/')
  closeMobileMenu()
}

// Check if user is admin (simple check for admin emails)
const isAdmin = computed(() => {
  if (!authStore.isAuthenticated || !authStore.user) return false
  
  const adminEmails = [
    'working@fs25hub.com',
    'admin@fs25hub.com', 
    'mrcod403@gmail.com'
  ]
  
  return adminEmails.includes(authStore.user.email)
})

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
          <li v-if="authStore.isAuthenticated">
            <RouterLink to="/dashboard" @click="handleNavClick">Dashboard</RouterLink>
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
          <li v-if="!authStore.isAuthenticated">
            <RouterLink to="/login" @click="handleNavClick">
              <i class="fas fa-sign-in-alt"></i>
              <span>Login</span>
            </RouterLink>
          </li>
          <li v-if="!authStore.isAuthenticated">
            <RouterLink to="/register" @click="handleNavClick">
              <i class="fas fa-user-plus"></i>
              <span>Register</span>
            </RouterLink>
          </li>
          <li v-if="authStore.isAuthenticated">
            <RouterLink to="/profile" @click="handleNavClick">
              <i class="fas fa-user"></i>
              <span>My Profile</span>
            </RouterLink>
          </li>
          <li v-if="authStore.isAuthenticated">
            <RouterLink to="/dashboard" @click="handleNavClick">
              <i class="fas fa-tachometer-alt"></i>
              <span>Dashboard</span>
            </RouterLink>
          </li>
          <li v-if="authStore.isAuthenticated && isAdmin">
            <RouterLink to="/admin" @click="handleNavClick">
              <i class="fas fa-cog"></i>
              <span>Admin Panel</span>
            </RouterLink>
          </li>
          <li v-if="authStore.isAuthenticated">
            <a href="#" @click.prevent="handleLogout">
              <i class="fas fa-sign-out-alt"></i>
              <span>Logout ({{ authStore.userName }})</span>
            </a>
          </li>
        </ul>
        <div class="mobile-menu-footer" v-if="!authStore.isAuthenticated">
          <RouterLink to="/register" class="mobile-upload-btn" @click="handleNavClick">
            <i class="fas fa-user-plus"></i>
            <span>Join Now</span>
          </RouterLink>
        </div>
      </nav>
      
      <div class="header-actions" :class="{ 'actions-open': isMobileMenuOpen }">
        <template v-if="!authStore.isAuthenticated">
          <RouterLink to="/login" class="btn btn-outline" @click="handleNavClick">
            <i class="fas fa-sign-in-alt"></i> 
            <span class="btn-text">Login</span>
          </RouterLink>
          <RouterLink to="/register" class="btn btn-primary" @click="handleNavClick">
            <i class="fas fa-user-plus"></i> 
            <span class="btn-text">Register</span>
          </RouterLink>
        </template>
        <template v-else>
          <RouterLink to="/profile" class="btn btn-outline" @click="handleNavClick">
            <i class="fas fa-user"></i> 
            <span class="btn-text">Profile</span>
          </RouterLink>
          <span class="user-info">Welcome, {{ authStore.userName }}!</span>
          <button @click="handleLogout" class="btn btn-outline">
            <i class="fas fa-sign-out-alt"></i> 
            <span class="btn-text">Logout</span>
          </button>
        </template>
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
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: white;
  padding: 1rem 0;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  position: sticky;
  top: 0;
  z-index: 1000;
  border-bottom: 1px solid rgba(39, 174, 96, 0.3);
  backdrop-filter: blur(10px);
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  position: relative;
  gap: 2rem;
  min-height: 80px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.6rem;
  font-weight: 800;
  color: white;
  text-decoration: none;
  transition: all 0.3s ease;
  flex-shrink: 0;
  min-width: 180px;
}

.logo:hover {
  transform: translateY(-2px);
}

.logo i {
  color: var(--primary);
  font-size: 2rem;
  transition: all 0.3s ease;
  filter: drop-shadow(0 2px 4px rgba(39, 174, 96, 0.3));
}

.logo:hover i {
  transform: rotate(15deg) scale(1.1);
  filter: drop-shadow(0 4px 8px rgba(39, 174, 96, 0.5));
}

.logo span {
  background: linear-gradient(135deg, var(--primary), #00d4aa);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 800;
  letter-spacing: -0.5px;
}

/* Desktop Navigation Styles */
.desktop-nav {
  display: flex;
  list-style: none;
  gap: 1.5rem;
  margin: 0;
  padding: 0.6rem 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  flex: 1;
  justify-content: center;
  max-width: 700px;
  white-space: nowrap;
}

.desktop-nav li {
  position: relative;
}

.desktop-nav a {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  padding: 0.6rem 1rem;
  border-radius: 25px;
  position: relative;
  font-size: 0.9rem;
  letter-spacing: 0.3px;
  display: block;
  min-width: fit-content;
}

.desktop-nav a::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--primary), #00d4aa);
  border-radius: 25px;
  opacity: 0;
  transition: all 0.3s ease;
  z-index: -1;
}

.desktop-nav a:hover, 
.desktop-nav a.router-link-active {
  color: white;
  transform: translateY(-2px);
}

.desktop-nav a:hover::before, 
.desktop-nav a.router-link-active::before {
  opacity: 1;
  box-shadow: 0 8px 25px rgba(39, 174, 96, 0.4);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex-shrink: 0;
  min-width: fit-content;
}

.user-info {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  font-size: 0.85rem;
  padding: 0 0.8rem;
  border-left: 1px solid rgba(255, 255, 255, 0.2);
  margin-left: 0.3rem;
  white-space: nowrap;
}

/* Mobile Navigation - Hidden by default */
.mobile-menu-header,
.mobile-nav-list,
.mobile-menu-footer {
  display: none;
}

/* Mobile Menu Toggle Button */
.mobile-menu-toggle {
  display: none;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  padding: 0.75rem;
  z-index: 1000;
  position: relative;
  border-radius: 12px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.mobile-menu-toggle:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.hamburger {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mobile-menu-toggle span {
  width: 24px;
  height: 3px;
  background: white;
  transition: all 0.3s ease;
  border-radius: 3px;
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
  gap: 0.5rem;
  background: linear-gradient(135deg, var(--primary), #00d4aa);
  color: white;
  padding: 0.7rem 1.5rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  font-size: 0.85rem;
  box-shadow: 0 8px 25px rgba(39, 174, 96, 0.3);
  position: relative;
  overflow: hidden;
  white-space: nowrap;
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.btn:hover::before {
  left: 100%;
}

.btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(39, 174, 96, 0.4);
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary), #00d4aa);
  box-shadow: 0 8px 25px rgba(39, 174, 96, 0.3);
}

.btn-outline {
  background: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: none;
  backdrop-filter: blur(10px);
}

.btn-outline:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--primary);
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(255, 255, 255, 0.2);
}

.btn-secondary {
  background: linear-gradient(135deg, var(--secondary), #e67e22);
  box-shadow: 0 8px 25px rgba(243, 156, 18, 0.3);
}

.btn-secondary:hover {
  background: linear-gradient(135deg, #e67e22, #d35400);
  box-shadow: 0 12px 35px rgba(243, 156, 18, 0.4);
}

.btn-text {
  font-size: 0.9rem;
  letter-spacing: 0.3px;
}

/* Enhanced Responsive Design */
@media (max-width: 1200px) {
  .header-container {
    padding: 0 1.5rem;
    gap: 1.2rem;
  }
  
  .logo {
    font-size: 1.4rem;
    min-width: 160px;
  }
  
  .logo i {
    font-size: 1.8rem;
  }
  
  .desktop-nav {
    gap: 1.2rem;
    padding: 0.5rem 1.2rem;
    max-width: 600px;
  }
  
  .desktop-nav a {
    padding: 0.5rem 0.8rem;
    font-size: 0.85rem;
  }
  
  .header-actions {
    gap: 0.6rem;
  }
  
  .btn {
    padding: 0.6rem 1.2rem;
    font-size: 0.8rem;
  }
  
  .user-info {
    font-size: 0.8rem;
    padding: 0 0.6rem;
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
  
  .mobile-nav-list ul {
    flex-direction: column;
    gap: 0;
    padding: 0;
    margin: 0;
    list-style: none;
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
    color: rgba(255, 255, 255, 0.9);
    text-decoration: none;
  }
  
  .mobile-nav-list a:hover {
    background: rgba(39, 174, 96, 0.1);
    border-left-color: var(--primary);
    transform: translateX(5px);
    color: white;
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
  
  .mobile-upload-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    width: 100%;
    padding: 1rem;
    background: linear-gradient(135deg, var(--primary), #00d4aa);
    color: white;
    text-decoration: none;
    border-radius: 12px;
    font-weight: 600;
    transition: var(--transition);
    box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
  }
  
  .mobile-upload-btn:hover {
    background: linear-gradient(135deg, var(--primary-dark), #00b894);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(39, 174, 96, 0.4);
  }
  
  .header-actions {
    gap: 0.8rem;
  }
  
  .btn {
    padding: 0.7rem 1.5rem;
    font-size: 0.85rem;
  }
  
  .btn-text {
    display: none;
  }
}

@media (max-width: 768px) {
  .header-container {
    padding: 0 1rem;
    gap: 1rem;
  }
  
  .logo {
    font-size: 1.4rem;
    min-width: 60px;
  }
  
  .logo span {
    display: none;
  }
  
  .logo i {
    font-size: 1.8rem;
  }
  
  .header-actions {
    gap: 0.5rem;
  }
  
  .btn {
    padding: 0.6rem 1.2rem;
    font-size: 0.8rem;
    border-radius: 8px;
  }
  
  .user-info {
    display: none;
  }
}

@media (max-width: 480px) {
  .header-container {
    padding: 0 0.8rem;
    gap: 0.8rem;
  }
  
  .header {
    padding: 0.8rem 0;
  }
  
  .logo {
    font-size: 1.2rem;
    min-width: 50px;
  }
  
  .logo i {
    font-size: 1.6rem;
  }
  
  .btn {
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
  }
  
  .nav {
    width: 280px;
  }
}
</style>