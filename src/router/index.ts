import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '@/views/HomeView.vue'
import ModsView from '@/views/ModsView.vue'
import CategoriesView from '@/views/CategoriesView.vue'
import UploadView from '@/views/UploadView.vue'
import ModPreviewView from '@/views/ModPreviewView.vue'
import DevelopersView from '@/views/DevelopersView.vue'
import UserProfileView from '@/views/UserProfileView.vue'
import PrivacyPolicy from '@/views/PrivacyPolicy.vue'
import ContactPage from '@/views/ContactPage.vue'
import TermsConditions from '@/views/TermsConditions.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import DashboardView from '@/views/DashboardView.vue'
import ForgotPasswordView from '@/views/ForgotPasswordView.vue'
import AdminView from '@/views/AdminView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    // Always scroll to top to ensure views are properly visible
    return { top: 0, behavior: 'smooth' }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/mods',
      name: 'mods',
      component: ModsView
    },
    {
      path: '/mods/:id',
      name: 'mod-preview',
      component: ModPreviewView,
      props: true
    },
    {
      path: '/categories',
      name: 'categories',
      component: CategoriesView
    },
    {
      path: '/upload',
      name: 'upload',
      component: UploadView
    },
    {
      path: '/contact',
      name: 'Contact',
      component: ContactPage
    },
    {
      path: '/developers',
      name: 'developers',
      component: DevelopersView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPasswordView
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
      meta: { requiresAuth: true }
    },
    {
      path: '/user/:username',
      name: 'user-profile',
      component: UserProfileView,
      props: true
    },
    {
      path: '/profile',
      name: 'profile',
      component: UserProfileView,
      beforeEnter: (to, from, next) => {
        // Check if user is authenticated and redirect to their profile
        const token = localStorage.getItem('token')
        const user = localStorage.getItem('user')
        
        if (token && user) {
          const userData = JSON.parse(user)
          // Redirect to user's profile with their username
          next(`/user/${userData.username || userData.name?.toLowerCase().replace(/\s+/g, '-') || 'user'}`)
        } else {
          // Not authenticated, redirect to login
          next('/login')
        }
      }
    },
    {
      path: '/privacy',
      name: 'PrivacyPolicy',
      component: PrivacyPolicy
    },
    {
      path: '/terms',
      name: 'TermsConditions',
      component: TermsConditions
    }
  ]
})

// Add a guard to handle authentication and token expiration
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Clear token expired message when navigating to login
  if (to.name === 'login') {
    authStore.clearTokenExpiredMessage()
  }
  
  // For browser navigation, ensure proper component initialization
  if (from.name && to.name) {
    // Small delay for browser navigation
    await new Promise(resolve => setTimeout(resolve, 50))
  }
  
  next()
})

// Handle navigation completion
router.afterEach((to, from) => {
  // Ensure scroll position is reset
  window.scrollTo(0, 0)
})

export default router