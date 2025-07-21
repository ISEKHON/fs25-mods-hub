<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { apiCall } from '@/services/api'

const props = defineProps<{
  modId: string
  modTitle: string
}>()

const emit = defineEmits<{
  reportSubmitted: []
  close: []
}>()

const reportTypes = ref([
  { value: 'inappropriate_content', label: 'Inappropriate Content' },
  { value: 'copyright_violation', label: 'Copyright Violation' },
  { value: 'malware_virus', label: 'Malware/Virus' },
  { value: 'broken_download', label: 'Broken Download' },
  { value: 'misleading_description', label: 'Misleading Description' },
  { value: 'spam', label: 'Spam' },
  { value: 'other', label: 'Other' }
])

const form = reactive({
  reportType: '',
  description: '',
  additionalInfo: ''
})

const isSubmitting = ref(false)
const errors = ref<string[]>([])
const showSuccessMessage = ref(false)

const isFormValid = computed(() => {
  return form.reportType && form.description.trim().length >= 10
})

const submitReport = async () => {
  if (!isFormValid.value) return

  isSubmitting.value = true
  errors.value = []

  try {
    const reportData = await apiCall<{
      id: string
      report_type: string
      status: string
      created_at: string
    }>('/reports', {
      method: 'POST',
      body: JSON.stringify({
        mod_id: props.modId,
        report_type: form.reportType,
        description: form.description.trim(),
        additional_info: form.additionalInfo.trim()
      })
    })

    // The apiCall function returns the data portion directly
    showSuccessMessage.value = true
    // Reset form
    form.reportType = ''
    form.description = ''
    form.additionalInfo = ''
    
    // Auto close after success message
    setTimeout(() => {
      emit('reportSubmitted')
      emit('close')
    }, 2000)

  } catch (error) {
    console.error('Error submitting report:', error)
    errors.value = [error instanceof Error ? error.message : 'Failed to submit report']
  } finally {
    isSubmitting.value = false
  }
}

const closeForm = () => {
  emit('close')
}
</script>

<template>
  <div class="report-form-overlay" @click.self="closeForm">
    <div class="report-form-modal">
      <div class="report-form-header">
        <h3>Report Mod: {{ modTitle }}</h3>
        <button @click="closeForm" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div v-if="showSuccessMessage" class="success-message">
        <i class="fas fa-check-circle"></i>
        <p>Thank you! Your report has been submitted and will be reviewed by our moderation team.</p>
      </div>

      <form v-else @submit.prevent="submitReport" class="report-form">
        <div v-if="errors.length > 0" class="error-messages">
          <div v-for="error in errors" :key="error" class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            {{ error }}
          </div>
        </div>

        <div class="form-group">
          <label for="reportType">Reason for Report *</label>
          <select
            id="reportType"
            v-model="form.reportType"
            required
            class="form-select"
          >
            <option value="">Select a reason...</option>
            <option 
              v-for="type in reportTypes" 
              :key="type.value" 
              :value="type.value"
            >
              {{ type.label }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="description">Description *</label>
          <textarea
            id="description"
            v-model="form.description"
            required
            minlength="10"
            maxlength="500"
            rows="4"
            placeholder="Please provide details about the issue..."
            class="form-textarea"
          ></textarea>
          <div class="char-count">
            {{ form.description.length }}/500 characters
          </div>
        </div>

        <div class="form-group">
          <label for="additionalInfo">Additional Information</label>
          <textarea
            id="additionalInfo"
            v-model="form.additionalInfo"
            maxlength="300"
            rows="3"
            placeholder="Any additional context or information (optional)"
            class="form-textarea"
          ></textarea>
          <div class="char-count">
            {{ form.additionalInfo.length }}/300 characters
          </div>
        </div>

        <div class="form-actions">
          <button
            type="button"
            @click="closeForm"
            class="btn btn-secondary"
            :disabled="isSubmitting"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="btn btn-danger"
            :disabled="!isFormValid || isSubmitting"
          >
            <i v-if="isSubmitting" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-flag"></i>
            {{ isSubmitting ? 'Submitting...' : 'Submit Report' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.report-form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.report-form-modal {
  background: var(--bg-primary, #ffffff);
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  border: 1px solid var(--border-color, #e0e0e0);
}

.report-form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.report-form-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.25rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.success-message {
  padding: 2rem;
  text-align: center;
  color: var(--success-color);
}

.success-message i {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
}

.success-message p {
  margin: 0;
  font-size: 1.1rem;
  line-height: 1.5;
}

.report-form {
  padding: 1.5rem;
}

.error-messages {
  margin-bottom: 1rem;
}

.error-message {
  background: rgba(220, 53, 69, 0.1);
  color: var(--danger-color);
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
}

.form-select,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.char-count {
  text-align: right;
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--bg-tertiary);
}

.btn-danger {
  background: var(--danger-color);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #c82333;
}

@media (max-width: 768px) {
  .report-form-overlay {
    padding: 0.5rem;
  }
  
  .report-form-header,
  .report-form {
    padding: 1rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
