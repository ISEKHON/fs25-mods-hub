<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ModImage } from '@/types'

const props = defineProps<{
  images: ModImage[]
  category?: string
}>()

const emit = defineEmits<{
  (e: 'update:activeIndex', index: number): void
}>()

const activeIndex = ref(0)

// Watch for changes in activeIndex from parent
watch(() => props.images, () => {
  activeIndex.value = 0
})

const setActiveImage = (index: number) => {
  activeIndex.value = index
  emit('update:activeIndex', index)
}

const handleImageLoad = (event: Event) => {
  const img = event.target as HTMLImageElement
  if (img) {
    img.style.opacity = '1'
  }
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  if (img) {
    img.style.display = 'none'
    // Could emit an error event here if needed
    console.warn('Failed to load image:', img.src)
  }
}

const handleThumbnailError = (event: Event) => {
  const img = event.target as HTMLImageElement
  if (img) {
    img.style.display = 'none'
    // Show fallback icon for thumbnail
    const button = img.closest('.mod-thumbnail')
    if (button) {
      button.innerHTML = '<i class="fas fa-image"></i>'
    }
  }
}

// Helper function to convert video URLs to embeddable format
const getEmbedUrl = (url: string) => {
  if (!url) return ''
  
  // YouTube URL patterns
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const youtubeMatch = url.match(youtubeRegex)
  
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`
  }
  
  // Vimeo URL patterns
  const vimeoRegex = /vimeo\.com\/(\d+)/
  const vimeoMatch = url.match(vimeoRegex)
  
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  }
  
  // For direct video files (mp4, webm, etc.), return as is
  if (url.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i)) {
    return url
  }
  
  // Default: assume it's a direct video URL
  return url
}

const isEmbedVideo = (url: string) => {
  return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com')
}
</script>

<template>
  <div class="mod-gallery">
    <div class="mod-main-image">
      <template v-if="images[activeIndex]?.type === 'video'">
        <!-- Embedded videos (YouTube, Vimeo) -->
        <iframe 
          v-if="isEmbedVideo(images[activeIndex].url)"
          :src="getEmbedUrl(images[activeIndex].url)"
          class="media-preview video-embed"
          frameborder="0"
          allowfullscreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        ></iframe>
        <!-- Direct video files -->
        <video 
          v-else
          controls 
          :src="images[activeIndex].url" 
          class="media-preview"
          preload="metadata"
        >
          Your browser does not support the video tag.
        </video>
      </template>
      <template v-else>
        <img 
          v-if="images[activeIndex]?.url" 
          :src="images[activeIndex].url" 
          :alt="`Preview ${activeIndex + 1}`"
          class="media-preview"
          @load="handleImageLoad"
          @error="handleImageError"
        />
        <div v-else class="fallback-icon">
          <i class="fas" :class="`fa-${props.category?.toLowerCase() || 'image'}`"></i>
        </div>
      </template>
      <div v-if="images.length > 1" class="image-counter">
        {{ activeIndex + 1 }} / {{ images.length }}
      </div>
    </div>
    
    <div class="mod-thumbnails">
      <button
        v-for="(image, index) in images"
        :key="index"
        class="mod-thumbnail"
        :class="{ active: index === activeIndex }"
        @click="setActiveImage(index)"
      >
        <template v-if="image.type === 'video'">
          <i class="fas fa-video"></i>
        </template>
        <img 
          v-else-if="image.url" 
          :src="image.url" 
          :alt="`Thumbnail ${index + 1}`"
          @error="handleThumbnailError"
        >
        <i v-else class="fas fa-image"></i>
      </button>
    </div>
  </div>
</template>

<style scoped>
.mod-gallery {
  flex: 1;
  min-width: 300px;
  width: 100%;
  max-width: 100%;
}

.mod-main-image {
  background: linear-gradient(45deg, #2c3e50, #4a6491);
  height: 400px;
  border-radius: var(--radius);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow);
  width: 100%;
  background-color: #f8f9fa;
}

.mod-main-image::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, rgba(0,0,0,0.1), rgba(0,0,0,0.05));
  z-index: 0;
}

.media-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  z-index: 1;
  transition: transform 0.3s ease;
  border-radius: var(--radius);
}

.video-embed {
  width: 100%;
  height: 100%;
  border-radius: var(--radius);
  object-fit: cover;
}

.mod-main-image:hover .media-preview {
  transform: scale(1.02);
}

.media-preview[src=""] {
  display: none;
}

.fallback-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #2c3e50, #4a6491);
  z-index: 1;
}

.fallback-icon i {
  font-size: 6rem;
  opacity: 0.7;
  color: white;
}

.image-counter {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  backdrop-filter: blur(4px);
  z-index: 2;
}

.mod-main-image i {
  font-size: 6rem;
  opacity: 0.7;
  z-index: 1;
}

.mod-thumbnails {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.mod-thumbnail {
  min-width: 80px;
  height: 60px;
  border-radius: 6px;
  background: var(--gray);
  cursor: pointer;
  transition: var(--transition);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-light);
  border: none;
  padding: 0;
  position: relative;
  overflow: hidden;
}

.mod-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mod-thumbnail i {
  font-size: 1.5rem;
}

.mod-thumbnail:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 10px rgba(0,0,0,0.1);
}

.mod-thumbnail.active {
  border: 3px solid var(--primary);
}

/* Enhanced Responsive Design */
@media (max-width: 1200px) {
  .mod-gallery {
    min-width: 280px;
  }
}

@media (max-width: 992px) {
  .mod-gallery {
    min-width: auto;
    width: 100%;
  }
  
  .mod-main-image {
    height: 350px;
  }
  
  .mod-thumbnails {
    gap: 0.8rem;
  }
  
  .mod-thumbnail {
    min-width: 70px;
    height: 55px;
  }
}

@media (max-width: 768px) {
  .mod-main-image {
    height: 300px;
    margin-bottom: 1.25rem;
  }
  
  .fallback-icon i {
    font-size: 4rem;
  }
  
  .image-counter {
    top: 0.75rem;
    right: 0.75rem;
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }
  
  .mod-thumbnails {
    gap: 0.6rem;
    padding-bottom: 0.25rem;
  }
  
  .mod-thumbnail {
    min-width: 65px;
    height: 50px;
  }
}

@media (max-width: 480px) {
  .mod-main-image {
    height: 250px;
    margin-bottom: 1rem;
    border-radius: 8px;
  }
  
  .fallback-icon i {
    font-size: 3.5rem;
  }
  
  .image-counter {
    top: 0.5rem;
    right: 0.5rem;
    padding: 0.3rem 0.6rem;
    font-size: 0.75rem;
    border-radius: 15px;
  }
  
  .mod-main-image i {
    font-size: 4rem;
  }
  
  .mod-thumbnails {
    gap: 0.5rem;
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .mod-thumbnail {
    min-width: 60px;
    height: 45px;
    border-radius: 6px;
  }
  
  .mod-thumbnail i {
    font-size: 1.2rem;
  }
}

@media (max-width: 360px) {
  .mod-main-image {
    height: 220px;
  }
  
  .fallback-icon i {
    font-size: 3rem;
  }
  
  .image-counter {
    font-size: 0.7rem;
    padding: 0.25rem 0.5rem;
  }
  
  .mod-main-image i {
    font-size: 3.5rem;
  }
  
  .mod-thumbnail {
    min-width: 55px;
    height: 40px;
  }
  
  .mod-thumbnail i {
    font-size: 1.1rem;
  }
}
</style>