<script setup lang="ts">
import { computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const isVisible = computed(() => !!authStore.tokenExpiredMessage)

const handleLoginRedirect = () => {
  authStore.clearTokenExpiredMessage()
  router.push('/login')
}

const handleDismiss = () => {
  authStore.clearTokenExpiredMessage()
}

// Auto-dismiss after 10 seconds
watch(isVisible, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      if (authStore.tokenExpiredMessage) {
        handleDismiss()
      }
    }, 10000)
  }
})
</script>

<template>
  <Transition name="notification">
    <div v-if="isVisible" class="token-expired-notification">
      <div class="notification-content">
        <div class="notification-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="notification-message">
          <h4>Session Expired</h4>
          <p>{{ authStore.tokenExpiredMessage }}</p>
        </div>
        <div class="notification-actions">
          <button @click="handleLoginRedirect" class="btn btn-primary">
            <i class="fas fa-sign-in-alt"></i>
            Login Again
          </button>
          <button @click="handleDismiss" class="btn btn-secondary">
            <i class="fas fa-times"></i>
            Dismiss
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.token-expired-notification {
  position: fixed;
  top: 100px;
  right: 20px;
  z-index: 9999;
  max-width: 400px;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(255, 107, 107, 0.3);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.notification-content {
  padding: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.notification-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.notification-message {
  flex: 1;
}

.notification-message h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.notification-message p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.9;
  line-height: 1.4;
}

.notification-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex-shrink: 0;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  white-space: nowrap;
}

.btn-primary {
  background: rgba(255, 255, 255, 0.9);
  color: #ff6b6b;
}

.btn-primary:hover {
  background: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.btn i {
  font-size: 0.9rem;
}

/* Notification transition animations */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Responsive design */
@media (max-width: 768px) {
  .token-expired-notification {
    right: 10px;
    left: 10px;
    max-width: none;
    top: 80px;
  }
  
  .notification-content {
    padding: 1rem;
  }
  
  .notification-actions {
    flex-direction: row;
  }
  
  .btn {
    padding: 0.5rem 0.8rem;
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .notification-content {
    flex-direction: column;
    text-align: center;
  }
  
  .notification-actions {
    width: 100%;
    justify-content: center;
  }
}
</style>
