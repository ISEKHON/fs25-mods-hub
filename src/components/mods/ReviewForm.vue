<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { apiCall } from '@/services/api'
import { useModsStore } from '@/stores/mods-new'

const props = defineProps<{
  modId: string
  modTitle: string
}>()

const emit = defineEmits<{
  reviewSubmitted: [review: any]
  close: []
}>()

const modsStore = useModsStore()

const form = reactive({
  rating: 0,
  title: '',
  comment: '',
  anonymous: false
})

const isSubmitting = ref(false)
const errors = ref<string[]>([])

const hoveredRating = ref(0)
const currentRating = computed(() => hoveredRating.value || form.rating)

const isFormValid = computed(() => {
  return form.rating > 0 && form.comment.trim().length >= 10
})

const setRating = (rating: number) => {
  form.rating = rating
}

const setHoveredRating = (rating: number) => {
  hoveredRating.value = rating
}

const clearHoveredRating = () => {
  hoveredRating.value = 0
}

const getStarClass = (starIndex: number) => {
  const rating = currentRating.value
  if (starIndex <= rating) {
    return 'fas fa-star active'
  }
  return 'far fa-star'
}

const validateForm = () => {
  errors.value = []
  
  if (form.rating === 0) {
    errors.value.push('Please select a rating')
  }
  
  if (form.comment.trim().length < 10) {
    errors.value.push('Review comment must be at least 10 characters long')
  }
  
  if (form.comment.trim().length > 1000) {
    errors.value.push('Review comment must be less than 1000 characters')
  }
  
  return errors.value.length === 0
}

const submitReview = async () => {
  if (!validateForm()) return
  
  isSubmitting.value = true
  
  try {
    const reviewData = await apiCall<{
      id: string
      username: string
      rating: number
      review_text: string
      created_at: string
    }>('/reviews', {
      method: 'POST',
      body: JSON.stringify({
        mod_id: props.modId,
        rating: form.rating,
        review_text: form.comment.trim()
      })
    })

    // Emit the review data to parent component
    emit('reviewSubmitted', {
      id: reviewData.id,
      userId: 'current-user-id',
      userName: reviewData.username || 'Current User',
      userAvatar: '/default-avatar.svg', // Will be updated from database
      rating: reviewData.rating,
      title: form.title,
      comment: reviewData.review_text,
      createdAt: reviewData.created_at,
      helpful: 0,
      notHelpful: 0,
      verified: true,
      version: '1.0.0'
    })
    
    // Reset form
    form.rating = 0
    form.title = ''
    form.comment = ''
    form.anonymous = false
    
    // Close the form
    emit('close')
    
    // Refresh the mod data to get updated reviews and rating
    await modsStore.refreshModReviews(props.modId)
    
    alert('Review submitted successfully!')
    
  } catch (error) {
    console.error('Error submitting review:', error)
    errors.value.push(error instanceof Error ? error.message : 'Failed to submit review. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}

const closeForm = () => {
  emit('close')
}
</script>

<template>
  <div class="review-form-overlay" @click.self="closeForm">
    <div class="review-form-modal">
      <div class="modal-header">
        <h3>Write a Review</h3>
        <button class="close-btn" @click="closeForm">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="modal-body">
        <div class="mod-info">
          <p>You're reviewing: <strong>{{ modTitle }}</strong></p>
        </div>
        
        <!-- Error Messages -->
        <div v-if="errors.length > 0" class="error-messages">
          <div v-for="error in errors" :key="error" class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            {{ error }}
          </div>
        </div>
        
        <form @submit.prevent="submitReview" class="review-form">
          <!-- Rating Section -->
          <div class="form-group">
            <label class="form-label">
              <span>Rating *</span>
              <span class="rating-text" v-if="form.rating > 0">
                ({{ form.rating }} {{ form.rating === 1 ? 'star' : 'stars' }})
              </span>
            </label>
            <div class="rating-input">
              <button
                v-for="star in 5"
                :key="star"
                type="button"
                class="star-btn"
                :class="getStarClass(star)"
                @click="setRating(star)"
                @mouseenter="setHoveredRating(star)"
                @mouseleave="clearHoveredRating"
              ></button>
            </div>
            <div class="rating-labels">
              <span v-if="currentRating === 1">Poor</span>
              <span v-else-if="currentRating === 2">Fair</span>
              <span v-else-if="currentRating === 3">Good</span>
              <span v-else-if="currentRating === 4">Very Good</span>
              <span v-else-if="currentRating === 5">Excellent</span>
            </div>
          </div>
          
          <!-- Title Section -->
          <div class="form-group">
            <label for="reviewTitle" class="form-label">Review Title (Optional)</label>
            <input
              id="reviewTitle"
              v-model="form.title"
              type="text"
              class="form-control"
              placeholder="Summarize your experience..."
              maxlength="100"
              :disabled="isSubmitting"
            />
            <div class="character-count">{{ form.title.length }}/100</div>
          </div>
          
          <!-- Comment Section -->
          <div class="form-group">
            <label for="reviewComment" class="form-label">
              Your Review *
            </label>
            <textarea
              id="reviewComment"
              v-model="form.comment"
              class="form-control textarea"
              placeholder="Share your thoughts about this mod. What did you like or dislike? How was the quality and performance?"
              rows="6"
              maxlength="1000"
              :disabled="isSubmitting"
              required
            ></textarea>
            <div class="character-count">{{ form.comment.length }}/1000 (minimum 10 characters)</div>
          </div>
          
          <!-- Anonymous Option -->
          <div class="form-group">
            <label class="checkbox-wrapper">
              <input 
                v-model="form.anonymous" 
                type="checkbox"
                :disabled="isSubmitting"
              />
              <span class="checkmark"></span>
              <span class="checkbox-text">Post anonymously</span>
            </label>
          </div>
          
          <!-- Guidelines -->
          <div class="guidelines">
            <h4>Review Guidelines</h4>
            <ul>
              <li>Be honest and constructive in your feedback</li>
              <li>Focus on the mod's quality, features, and performance</li>
              <li>Avoid offensive language or personal attacks</li>
              <li>Only review mods you have actually used</li>
            </ul>
          </div>
        </form>
      </div>
      
      <div class="modal-footer">
        <button 
          type="button" 
          class="btn btn-secondary" 
          @click="closeForm"
          :disabled="isSubmitting"
        >
          Cancel
        </button>
        <button 
          type="button" 
          class="btn btn-primary" 
          @click="submitReview"
          :disabled="!isFormValid || isSubmitting"
        >
          <i v-if="isSubmitting" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-paper-plane"></i>
          {{ isSubmitting ? 'Submitting...' : 'Submit Review' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.review-form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.review-form-modal {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--darker);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: var(--text-light);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: var(--transition);
}

.close-btn:hover {
  background: var(--light);
  color: var(--text);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.mod-info {
  background: var(--light);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.mod-info p {
  margin: 0;
  color: var(--text);
}

.error-messages {
  margin-bottom: 1.5rem;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #fee;
  color: #c53030;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  border-left: 4px solid #c53030;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-weight: 600;
  color: var(--darker);
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.rating-text {
  color: var(--primary);
  font-weight: 500;
}

.rating-input {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.star-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: #ddd;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0.25rem;
}

.star-btn:hover,
.star-btn.active {
  color: #fbbf24;
  transform: scale(1.1);
}

.rating-labels {
  font-size: 0.875rem;
  color: var(--text-light);
  font-weight: 500;
  height: 1.2rem;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: var(--transition);
  background: white;
  font-family: inherit;
}

.form-control:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.1);
}

.textarea {
  resize: vertical;
  min-height: 120px;
  line-height: 1.6;
}

.character-count {
  font-size: 0.8rem;
  color: var(--text-light);
  text-align: right;
  margin-top: 0.25rem;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  color: var(--text);
}

.checkbox-wrapper input {
  display: none;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #e2e8f0;
  border-radius: 4px;
  position: relative;
  transition: var(--transition);
  background: white;
}

.checkbox-wrapper:hover .checkmark {
  border-color: var(--primary);
}

.checkbox-wrapper input:checked + .checkmark {
  background: var(--primary);
  border-color: var(--primary);
}

.checkbox-wrapper input:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.checkbox-text {
  font-size: 0.9rem;
}

.guidelines {
  background: rgba(39, 174, 96, 0.05);
  border: 1px solid rgba(39, 174, 96, 0.2);
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
}

.guidelines h4 {
  margin: 0 0 0.75rem 0;
  color: var(--primary);
  font-size: 1rem;
}

.guidelines ul {
  margin: 0;
  padding-left: 1.25rem;
}

.guidelines li {
  color: var(--text);
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 0.25rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  font-size: 0.95rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #e2e8f0;
  color: var(--text);
}

.btn-secondary:hover:not(:disabled) {
  background: #cbd5e0;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

/* Responsive Design */
@media (max-width: 640px) {
  .review-form-overlay {
    padding: 0.5rem;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1rem;
  }

  .rating-input {
    justify-content: center;
  }

  .star-btn {
    font-size: 1.75rem;
  }

  .modal-footer {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
