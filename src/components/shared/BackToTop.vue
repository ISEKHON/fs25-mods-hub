<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const isVisible = ref(false)

const checkScroll = () => {
  isVisible.value = window.scrollY > 300
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

onMounted(() => {
  window.addEventListener('scroll', checkScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', checkScroll)
})
</script>

<template>
  <button
    class="back-to-top"
    :class="{ show: isVisible }"
    @click="scrollToTop"
    aria-label="Back to top"
  >
    <i class="fas fa-arrow-up"></i>
  </button>
</template>

<style scoped>
.back-to-top {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 50px;
  height: 50px;
  background: var(--primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  cursor: pointer;
  transition: var(--transition);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  z-index: 100;
  opacity: 0;
  visibility: hidden;
  transform: translateY(20px);
  border: none;
}

.back-to-top.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.back-to-top:hover {
  background: var(--primary-dark);
  transform: translateY(-3px) scale(1.05);
}

/* Enhanced Responsive Design */
@media (max-width: 992px) {
  .back-to-top {
    width: 50px;
    height: 50px;
    font-size: 1.1rem;
    bottom: 2rem;
    right: 2rem;
  }
}

@media (max-width: 768px) {
  .back-to-top {
    width: 45px;
    height: 45px;
    font-size: 1rem;
    bottom: 1.5rem;
    right: 1.5rem;
  }
}

@media (max-width: 480px) {
  .back-to-top {
    width: 42px;
    height: 42px;
    font-size: 0.95rem;
    bottom: 1.25rem;
    right: 1.25rem;
  }
}

@media (max-width: 360px) {
  .back-to-top {
    width: 40px;
    height: 40px;
    font-size: 0.9rem;
    bottom: 1rem;
    right: 1rem;
  }
}
</style>