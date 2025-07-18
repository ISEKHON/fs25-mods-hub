<script setup lang="ts">
import { RouterView, useRouter, useRoute } from 'vue-router'
import { onMounted, watch, nextTick } from 'vue'
import { useModsStore } from '@/stores/mods-new'
import { useAuthStore } from '@/stores/auth'
import AppHeader from '@/components/shared/AppHeader.vue'
import AppFooter from '@/components/shared/AppFooter.vue'
import BackToTop from '@/components/shared/BackToTop.vue'
import TokenExpiredNotification from '@/components/shared/TokenExpiredNotification.vue'

const router = useRouter()
const route = useRoute()
const modsStore = useModsStore()
const authStore = useAuthStore()

// Initialize app data
onMounted(async () => {
  // Initialize authentication from storage
  authStore.loadFromStorage()
  
  // Initialize mods and categories from API
  try {
    await modsStore.initialize()
    console.log('✅ App initialized with API data')
  } catch (error) {
    console.error('❌ Failed to initialize app data:', error)
  }
  
  // Listen for browser navigation events
  window.addEventListener('popstate', async () => {
    await nextTick()
    // Force router sync without page reload
    if (window.location.pathname !== route.fullPath) {
      await router.push(window.location.pathname)
    }
  })
})
</script>

<template>
  <div class="app">
    <AppHeader />
    
    <main class="main-content">
      <RouterView v-slot="{ Component, route }">
        <component :is="Component" :key="route.fullPath" />
      </RouterView>
    </main>
    
    <AppFooter />
    <BackToTop />
    <TokenExpiredNotification />
  </div>
</template>

<style>
/* Global Styles */
:root {
  --primary: #27ae60;
  --primary-dark: #219653;
  --secondary: #f39c12;
  --accent: #3498db;
  --dark: #1e272e;
  --darker: #171e25;
  --light: #f8f9fa;
  --gray: #e0e0e0;
  --text: #333;
  --text-light: #7f8c8d;
  --card-bg: #ffffff;
  --shadow: 0 10px 20px rgba(0,0,0,0.08);
  --transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  --radius: 12px;
  --border: 1px solid rgba(0,0,0,0.05);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Roboto', sans-serif;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
  color: var(--text);
  line-height: 1.6;
  overflow-x: hidden;
}

h1, h2, h3, h4, h5 {
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
}

a {
  color: inherit;
  text-decoration: none;
}

img {
  max-width: 100%;
  height: auto;
}

/* App Layout */
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding-top: 80px; /* Space for fixed header */
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Scrollbar Styles */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: var(--primary);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--primary-dark);
}

/* Utility Classes */
.container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section {
  padding: 6rem 2rem;
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
  .container {
    max-width: 100%;
    padding: 0 1.5rem;
  }
}

@media (max-width: 992px) {
  .section {
    padding: 5rem 1.5rem;
  }
  
  .section-title h2 {
    font-size: 2.5rem;
  }
  
  .main-content {
    padding-top: 70px;
  }
}

@media (max-width: 768px) {
  .section {
    padding: 4rem 1.5rem;
  }
  
  .section-title h2 {
    font-size: 2.3rem;
  }
  
  .section-title h2::after {
    width: 60px;
    height: 4px;
  }
  
  .container {
    padding: 0 1.5rem;
  }
  
  .main-content {
    padding-top: 60px;
  }
  
  .btn {
    padding: 0.7rem 1.5rem;
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  .section {
    padding: 3rem 1rem;
  }
  
  .section-title {
    margin-bottom: 3rem;
  }
  
  .section-title h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
  
  .section-title p {
    font-size: 1.1rem;
    margin: 1.5rem auto 0;
  }
  
  .container {
    padding: 0 1rem;
  }
  
  .btn {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
    gap: 0.5rem;
  }
  
  .main-content {
    padding-top: 50px;
  }
}

@media (max-width: 360px) {
  .section {
    padding: 2.5rem 0.75rem;
  }
  
  .section-title h2 {
    font-size: 1.8rem;
  }
  
  .container {
    padding: 0 0.75rem;
  }
}
</style>