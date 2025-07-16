import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import ModsView from '@/views/ModsView.vue'
import CategoriesView from '@/views/CategoriesView.vue'
import UploadView from '@/views/UploadView.vue'
import ModPreviewView from '@/views/ModPreviewView.vue'
import DevelopersView from '@/views/DevelopersView.vue'
import PrivacyPolicy from '@/views/PrivacyPolicy.vue'
import ContactPage from '@/views/ContactPage.vue'
import TermsConditions from '@/views/TermsConditions.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import DashboardView from '@/views/DashboardView.vue'
import ForgotPasswordView from '@/views/ForgotPasswordView.vue'

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

// Add a simple guard to ensure proper navigation
router.beforeEach(async (to, from, next) => {
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