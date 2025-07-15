import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const navigationKey = ref(0)

export function useNavigation() {
  const route = useRoute()
  const router = useRouter()

  // Force component updates on navigation
  const forceUpdate = () => {
    navigationKey.value++
  }

  // Watch for route changes
  watch(() => route.fullPath, () => {
    forceUpdate()
  })

  // Listen for browser navigation
  if (typeof window !== 'undefined') {
    window.addEventListener('popstate', () => {
      setTimeout(() => {
        forceUpdate()
      }, 100)
    })
  }

  return {
    navigationKey,
    forceUpdate
  }
}
