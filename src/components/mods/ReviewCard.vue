<script setup lang="ts">
import type { ModReview } from '@/types'
import { computed, ref } from 'vue'

const props = defineProps<{
  review: ModReview
}>()

const hasVoted = ref(false)
const voteType = ref<'helpful' | 'notHelpful' | null>(null)

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getStarClass = (starIndex: number) => {
  return starIndex <= props.review.rating ? 'fas fa-star filled' : 'fas fa-star'
}

const handleVote = (type: 'helpful' | 'notHelpful') => {
  if (hasVoted.value && voteType.value === type) {
    // Remove vote if clicking the same button again
    hasVoted.value = false
    voteType.value = null
  } else {
    // Add or change vote
    hasVoted.value = true
    voteType.value = type
  }
  
  // TODO: Implement actual voting API call
  console.log(`Voted ${type} for review ${props.review.id}`)
}

const helpfulCount = computed(() => {
  if (voteType.value === 'helpful' && hasVoted.value) {
    return props.review.helpful + 1
  } else if (voteType.value === 'notHelpful' && hasVoted.value) {
    return props.review.helpful
  }
  return props.review.helpful
})

const notHelpfulCount = computed(() => {
  if (voteType.value === 'notHelpful' && hasVoted.value) {
    return props.review.notHelpful + 1
  } else if (voteType.value === 'helpful' && hasVoted.value) {
    return props.review.notHelpful
  }
  return props.review.notHelpful
})
</script>

<template>
  <div class="review-card">
    <div class="review-header">
      <div class="reviewer-info">
        <div class="reviewer-avatar">
          <img 
            v-if="review.userAvatar" 
            :src="review.userAvatar" 
            :alt="review.userName"
            class="avatar-image"
          />
          <div v-else class="avatar-placeholder">
            <i class="fas fa-user"></i>
          </div>
        </div>
        <div class="reviewer-details">
          <div class="reviewer-name">
            <span>{{ review.userName }}</span>
            <i v-if="review.verified" class="fas fa-check-circle verified" title="Verified Purchase"></i>
          </div>
          <div class="review-meta">
            <span class="review-date">{{ formatDate(review.createdAt) }}</span>
            <span class="review-version">Version {{ review.version }}</span>
          </div>
        </div>
      </div>
      
      <div class="review-rating">
        <div class="stars">
          <i 
            v-for="star in 5" 
            :key="star" 
            :class="getStarClass(star)"
          ></i>
        </div>
        <span class="rating-number">{{ review.rating }}/5</span>
      </div>
    </div>
    
    <div class="review-content">
      <h4 class="review-title" v-if="review.title">{{ review.title }}</h4>
      <p class="review-comment">{{ review.comment }}</p>
    </div>
    
    <div class="review-actions">
      <div class="helpful-section">
        <span class="helpful-text">Was this helpful?</span>
        <div class="vote-buttons">
          <button 
            class="vote-btn helpful" 
            :class="{ active: voteType === 'helpful' }"
            @click="handleVote('helpful')"
          >
            <i class="fas fa-thumbs-up"></i>
            <span>{{ helpfulCount }}</span>
          </button>
          <button 
            class="vote-btn not-helpful" 
            :class="{ active: voteType === 'notHelpful' }"
            @click="handleVote('notHelpful')"
          >
            <i class="fas fa-thumbs-down"></i>
            <span>{{ notHelpfulCount }}</span>
          </button>
        </div>
      </div>
      
      <button class="report-btn">
        <i class="fas fa-flag"></i>
        <span>Report</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.review-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  transition: var(--transition);
}

.review-card:hover {
  border-color: #cbd5e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.reviewer-info {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.reviewer-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--light);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  color: var(--text-light);
  font-size: 1.2rem;
}

.reviewer-details {
  flex: 1;
}

.reviewer-name {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--darker);
  margin-bottom: 0.25rem;
}

.verified {
  color: var(--primary);
  font-size: 0.875rem;
}

.review-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--text-light);
}

.review-rating {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.stars {
  display: flex;
  gap: 0.125rem;
}

.stars i {
  font-size: 1rem;
  color: #ddd;
  transition: var(--transition);
}

.stars i.filled {
  color: #fbbf24;
}

.rating-number {
  font-size: 0.875rem;
  color: var(--text-light);
  font-weight: 500;
}

.review-content {
  margin-bottom: 1.5rem;
}

.review-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--darker);
  margin: 0 0 0.5rem 0;
}

.review-comment {
  color: var(--text);
  line-height: 1.6;
  margin: 0;
}

.review-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
}

.helpful-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.helpful-text {
  font-size: 0.875rem;
  color: var(--text-light);
  font-weight: 500;
}

.vote-buttons {
  display: flex;
  gap: 0.5rem;
}

.vote-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  color: var(--text-light);
  font-size: 0.875rem;
  cursor: pointer;
  transition: var(--transition);
}

.vote-btn:hover {
  border-color: var(--primary);
  background: rgba(39, 174, 96, 0.05);
  color: var(--primary);
}

.vote-btn.active {
  border-color: var(--primary);
  background: var(--primary);
  color: white;
}

.vote-btn.helpful.active {
  background: var(--primary);
}

.vote-btn.not-helpful.active {
  background: #e53e3e;
  border-color: #e53e3e;
}

.report-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  border: none;
  background: none;
  color: var(--text-light);
  font-size: 0.875rem;
  cursor: pointer;
  transition: var(--transition);
  border-radius: 6px;
}

.report-btn:hover {
  background: rgba(229, 62, 62, 0.1);
  color: #e53e3e;
}

/* Responsive Design */
@media (max-width: 640px) {
  .review-card {
    padding: 1rem;
  }

  .review-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .review-rating {
    align-items: flex-start;
  }

  .review-actions {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .helpful-section {
    justify-content: space-between;
  }

  .vote-buttons {
    flex: 1;
    justify-content: flex-end;
  }
}
</style>
