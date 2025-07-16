<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

const isSubmitting = ref(false)
const showSuccess = ref(false)
const showError = ref(false)
const errorMessage = ref('')

const formData = reactive({
  // Basic Information
  title: '',
  description: '',
  category: '',
  version: '',
  author: '',
  
  // Download Information
  downloadLink: '',
  fileSize: '',
  
  // Media Links
  mainImage: '',
  additionalImages: ['', '', '', ''],
  videoLink: '',
  
  // Features and Details
  features: ['', '', '', ''],
  requirements: {
    min: '',
    recommended: ''
  },
  
  // Metadata
  compatibilityTags: [],
  pricing: {
    type: 'free', // 'free' or 'paid'
    price: '',
    currency: 'USD',
    originalPrice: '',
    discountPercentage: 0,
    saleEndDate: ''
  },
  isOriginalWork: false,
  hasPermission: false,
  agreeToTerms: false,
  
  // Contact Information
  contactEmail: '',
  contactDiscord: '',
  
  // Additional Information
  changelog: '',
  installationNotes: '',
  knownIssues: '',
  credits: ''
})

const categories = [
  'Vehicles', 'Harvesters', 'Tools', 'Maps', 'Animals', 
  'Buildings', 'Scripts', 'Trailers', 'Equipment', 
  'Implements', 'Forestry', 'Mowers', 'Seeders', 'Plows', 'Cultivators'
]

const compatibilityOptions = [
  'Multiplayer Compatible',
  'Precision Farming Compatible',
  'Seasons Mod Compatible',
  'GPS Compatible',
  'Console Friendly',
  'Mod Conflicts Possible'
]

const currencies = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD']

const isFormValid = computed(() => {
  return formData.title && 
         formData.description && 
         formData.category && 
         formData.version && 
         formData.author && 
         formData.downloadLink && 
         formData.mainImage && 
         formData.contactEmail && 
         formData.isOriginalWork && 
         formData.hasPermission && 
         formData.agreeToTerms
})

const addFeature = () => {
  formData.features.push('')
}

const removeFeature = (index: number) => {
  if (formData.features.length > 1) {
    formData.features.splice(index, 1)
  }
}

const addImage = () => {
  formData.additionalImages.push('')
}

const removeImage = (index: number) => {
  if (formData.additionalImages.length > 0) {
    formData.additionalImages.splice(index, 1)
  }
}

const toggleCompatibility = (option: string) => {
  const index = formData.compatibilityTags.indexOf(option)
  if (index > -1) {
    formData.compatibilityTags.splice(index, 1)
  } else {
    formData.compatibilityTags.push(option)
  }
}

const submitMod = async () => {
  if (!isFormValid.value) {
    showError.value = true
    errorMessage.value = 'Please fill in all required fields'
    return
  }

  isSubmitting.value = true
  showError.value = false

  try {
    // Here you would typically send the data to your backend
    // For now, we'll simulate a successful submission
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    showSuccess.value = true
    
    // Reset form after successful submission
    setTimeout(() => {
      Object.keys(formData).forEach(key => {
        if (Array.isArray(formData[key])) {
          formData[key] = key === 'features' ? ['', '', '', ''] : 
                         key === 'additionalImages' ? ['', '', '', ''] : []
        } else if (typeof formData[key] === 'object' && formData[key] !== null && !Array.isArray(formData[key])) {
          if (key === 'pricing') {
            formData[key] = {
              type: 'free',
              price: '',
              currency: 'USD',
              originalPrice: '',
              discountPercentage: 0,
              saleEndDate: ''
            }
          } else {
            Object.keys(formData[key]).forEach(subKey => {
              formData[key][subKey] = ''
            })
          }
        } else if (typeof formData[key] === 'boolean') {
          formData[key] = false
        } else {
          formData[key] = ''
        }
      })
      showSuccess.value = false
    }, 3000)
    
  } catch (error) {
    showError.value = true
    errorMessage.value = 'Failed to submit mod. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="upload-view">
    <div class="upload-header">
      <h1>Submit Your Mod</h1>
      <p>Submit your FS25 mod for admin review and approval. All mods are manually reviewed to ensure quality and compatibility.</p>
    </div>

    <!-- Success Message -->
    <div v-if="showSuccess" class="alert alert-success">
      <i class="fas fa-check-circle"></i>
      <div>
        <h4>Mod Submitted Successfully!</h4>
        <p>Your mod has been submitted for review. Our team will review it within 24-48 hours and notify you via email.</p>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="showError" class="alert alert-error">
      <i class="fas fa-exclamation-triangle"></i>
      <div>
        <h4>Submission Error</h4>
        <p>{{ errorMessage }}</p>
      </div>
    </div>

    <form @submit.prevent="submitMod" class="upload-form">
      <!-- Basic Information -->
      <div class="form-section">
        <h2><i class="fas fa-info-circle"></i> Basic Information</h2>
        
        <div class="form-grid">
          <div class="form-group">
            <label for="title">Mod Title *</label>
            <input 
              id="title"
              v-model="formData.title" 
              type="text" 
              placeholder="e.g., Swaraj 855 Tractor"
              required
            >
          </div>

          <div class="form-group">
            <label for="category">Category *</label>
            <select id="category" v-model="formData.category" required>
              <option value="">Select Category</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>

          <div class="form-group">
            <label for="version">Version *</label>
            <input 
              id="version"
              v-model="formData.version" 
              type="text" 
              placeholder="e.g., 1.2.0"
              required
            >
          </div>

          <div class="form-group">
            <label for="author">Author Name *</label>
            <input 
              id="author"
              v-model="formData.author" 
              type="text" 
              placeholder="Your name or team name"
              required
            >
          </div>
        </div>

        <div class="form-group">
          <label for="description">Description *</label>
          <textarea 
            id="description"
            v-model="formData.description" 
            placeholder="Provide a detailed description of your mod, its features, and what makes it special..."
            rows="4"
            required
          ></textarea>
        </div>
      </div>

      <!-- Download Information -->
      <div class="form-section">
        <h2><i class="fas fa-download"></i> Download Information</h2>
        
        <div class="form-grid">
          <div class="form-group">
            <label for="downloadLink">Download Link *</label>
            <input 
              id="downloadLink"
              v-model="formData.downloadLink" 
              type="url" 
              placeholder="https://example.com/yourmod.zip"
              required
            >
            <small>Direct download link to your mod file (Google Drive, Dropbox, etc.)</small>
          </div>

          <div class="form-group">
            <label for="fileSize">File Size</label>
            <input 
              id="fileSize"
              v-model="formData.fileSize" 
              type="text" 
              placeholder="e.g., 45.2 MB"
            >
          </div>
        </div>
      </div>

      <!-- Pricing Information -->
      <div class="form-section">
        <h2><i class="fas fa-tags"></i> Pricing Information</h2>
        
        <div class="form-group">
          <label>Mod Type</label>
          <div class="radio-group">
            <label class="radio-item">
              <input type="radio" v-model="formData.pricing.type" value="free">
              <span class="radio-mark"></span>
              <span class="radio-label">
                <strong>Free Mod</strong>
                <small>Available for free download</small>
              </span>
            </label>
            <label class="radio-item">
              <input type="radio" v-model="formData.pricing.type" value="paid">
              <span class="radio-mark"></span>
              <span class="radio-label">
                <strong>Paid Mod</strong>
                <small>Requires payment to download</small>
              </span>
            </label>
          </div>
        </div>

        <div v-if="formData.pricing.type === 'paid'" class="pricing-details">
          <div class="form-grid">
            <div class="form-group">
              <label for="price">Price *</label>
              <div class="price-input">
                <select v-model="formData.pricing.currency" class="currency-select">
                  <option v-for="currency in currencies" :key="currency" :value="currency">
                    {{ currency }}
                  </option>
                </select>
                <input 
                  id="price"
                  v-model="formData.pricing.price" 
                  type="number" 
                  step="0.01"
                  min="0.01"
                  placeholder="9.99"
                  required
                >
              </div>
            </div>

            <div class="form-group">
              <label for="originalPrice">Original Price (Optional)</label>
              <div class="price-input">
                <span class="currency-display">{{ formData.pricing.currency }}</span>
                <input 
                  id="originalPrice"
                  v-model="formData.pricing.originalPrice" 
                  type="number" 
                  step="0.01"
                  min="0.01"
                  placeholder="12.99"
                >
              </div>
              <small>For showing discounts (leave empty if no discount)</small>
            </div>

            <div class="form-group">
              <label for="discountPercentage">Discount %</label>
              <input 
                id="discountPercentage"
                v-model="formData.pricing.discountPercentage" 
                type="number" 
                min="0"
                max="100"
                placeholder="25"
              >
            </div>

            <div class="form-group">
              <label for="saleEndDate">Sale End Date (Optional)</label>
              <input 
                id="saleEndDate"
                v-model="formData.pricing.saleEndDate" 
                type="date"
              >
              <small>When the discount expires (if applicable)</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Media Links -->
      <div class="form-section">
        <h2><i class="fas fa-images"></i> Media & Screenshots</h2>
        
        <div class="form-group">
          <label for="mainImage">Main Preview Image *</label>
          <input 
            id="mainImage"
            v-model="formData.mainImage" 
            type="url" 
            placeholder="https://example.com/main-image.jpg"
            required
          >
          <small>High-quality main image for your mod (direct link)</small>
        </div>

        <div class="form-group">
          <label>Additional Images</label>
          <div v-for="(image, index) in formData.additionalImages" :key="index" class="image-input">
            <input 
              v-model="formData.additionalImages[index]" 
              type="url" 
              :placeholder="`Image ${index + 1} URL`"
            >
            <button 
              type="button" 
              @click="removeImage(index)"
              class="btn btn-remove"
            >
              <i class="fas fa-trash"></i>
            </button>
          </div>
          <button type="button" @click="addImage" class="btn btn-add">
            <i class="fas fa-plus"></i> Add More Images
          </button>
        </div>

        <div class="form-group">
          <label for="videoLink">Video Preview (Optional)</label>
          <input 
            id="videoLink"
            v-model="formData.videoLink" 
            type="url" 
            placeholder="https://youtube.com/watch?v=..."
          >
          <small>YouTube or other video platform link showcasing your mod</small>
        </div>
      </div>

      <!-- Features -->
      <div class="form-section">
        <h2><i class="fas fa-star"></i> Features & Details</h2>
        
        <div class="form-group">
          <label>Key Features</label>
          <div v-for="(feature, index) in formData.features" :key="index" class="feature-input">
            <input 
              v-model="formData.features[index]" 
              type="text" 
              :placeholder="`Feature ${index + 1}`"
            >
            <button 
              type="button" 
              @click="removeFeature(index)"
              class="btn btn-remove"
              :disabled="formData.features.length <= 1"
            >
              <i class="fas fa-trash"></i>
            </button>
          </div>
          <button type="button" @click="addFeature" class="btn btn-add">
            <i class="fas fa-plus"></i> Add Feature
          </button>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label for="minReq">Minimum Requirements</label>
            <textarea 
              id="minReq"
              v-model="formData.requirements.min" 
              placeholder="e.g., Farming Simulator 25, 2GB free disk space"
              rows="2"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="recReq">Recommended Requirements</label>
            <textarea 
              id="recReq"
              v-model="formData.requirements.recommended" 
              placeholder="e.g., Farming Simulator 25 with latest patch, 4GB free disk space"
              rows="2"
            ></textarea>
          </div>
        </div>

        <div class="form-group">
          <label>Compatibility Tags</label>
          <div class="checkbox-grid">
            <label 
              v-for="option in compatibilityOptions" 
              :key="option"
              class="checkbox-item"
            >
              <input 
                type="checkbox" 
                :value="option"
                @change="toggleCompatibility(option)"
                :checked="formData.compatibilityTags.includes(option)"
              >
              <span class="checkmark"></span>
              {{ option }}
            </label>
          </div>
        </div>
      </div>

      <!-- Additional Information -->
      <div class="form-section">
        <h2><i class="fas fa-clipboard-list"></i> Additional Information</h2>
        
        <div class="form-group">
          <label for="changelog">Changelog</label>
          <textarea 
            id="changelog"
            v-model="formData.changelog" 
            placeholder="Version history and changes made to the mod..."
            rows="3"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="installationNotes">Installation Notes</label>
          <textarea 
            id="installationNotes"
            v-model="formData.installationNotes" 
            placeholder="Any special installation instructions..."
            rows="3"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="knownIssues">Known Issues</label>
          <textarea 
            id="knownIssues"
            v-model="formData.knownIssues" 
            placeholder="Any known bugs or compatibility issues..."
            rows="2"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="credits">Credits</label>
          <textarea 
            id="credits"
            v-model="formData.credits" 
            placeholder="Credits to other modders, original authors, etc..."
            rows="2"
          ></textarea>
        </div>
      </div>

      <!-- Contact Information -->
      <div class="form-section">
        <h2><i class="fas fa-envelope"></i> Contact Information</h2>
        
        <div class="form-grid">
          <div class="form-group">
            <label for="contactEmail">Email Address *</label>
            <input 
              id="contactEmail"
              v-model="formData.contactEmail" 
              type="email" 
              placeholder="your@email.com"
              required
            >
            <small>We'll use this to contact you about your submission</small>
          </div>

          <div class="form-group">
            <label for="contactDiscord">Discord Username</label>
            <input 
              id="contactDiscord"
              v-model="formData.contactDiscord" 
              type="text" 
              placeholder="username#1234"
            >
          </div>
        </div>
      </div>

      <!-- Terms and Conditions -->
      <div class="form-section">
        <h2><i class="fas fa-shield-alt"></i> Terms & Verification</h2>
        
        <div class="checkbox-group">
          <label class="checkbox-item">
            <input type="checkbox" v-model="formData.isOriginalWork" required>
            <span class="checkmark"></span>
            I confirm this is my original work or I have proper permission to distribute it *
          </label>

          <label class="checkbox-item">
            <input type="checkbox" v-model="formData.hasPermission" required>
            <span class="checkmark"></span>
            I have the right to upload and distribute this mod *
          </label>

          <label class="checkbox-item">
            <input type="checkbox" v-model="formData.agreeToTerms" required>
            <span class="checkmark"></span>
            I agree to the terms of service and community guidelines *
          </label>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="form-submit">
        <button 
          type="submit" 
          class="btn btn-primary btn-large"
          :disabled="!isFormValid || isSubmitting"
        >
          <i v-if="isSubmitting" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-upload"></i>
          {{ isSubmitting ? 'Submitting...' : 'Submit Mod for Review' }}
        </button>
        
        <p class="submit-note">
          Your mod will be reviewed by our team within 24-48 hours. You'll receive an email notification once it's approved or if we need more information.
        </p>
      </div>
    </form>
  </div>
</template>

<style scoped>
.upload-view {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.upload-header {
  text-align: center;
  margin-bottom: 3rem;
}

.upload-header h1 {
  font-size: 2.5rem;
  color: var(--darker);
  margin-bottom: 1rem;
}

.upload-header p {
  font-size: 1.1rem;
  color: var(--text-light);
  max-width: 600px;
  margin: 0 auto;
}

/* Alerts */
.alert {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  border-left: 4px solid;
}

.alert-success {
  background: rgba(39, 174, 96, 0.1);
  border-left-color: #27ae60;
  color: #27ae60;
}

.alert-error {
  background: rgba(231, 76, 60, 0.1);
  border-left-color: #e74c3c;
  color: #e74c3c;
}

.alert i {
  font-size: 1.5rem;
  margin-top: 0.25rem;
}

.alert h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.alert p {
  margin: 0;
  opacity: 0.9;
}

/* Form Styling */
.upload-form {
  background: white;
  border-radius: 12px;
  box-shadow: var(--shadow);
  overflow: hidden;
}

.form-section {
  padding: 2rem;
  border-bottom: 1px solid #e2e8f0;
}

.form-section:last-child {
  border-bottom: none;
}

.form-section h2 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.4rem;
  color: var(--darker);
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--primary);
}

.form-section h2 i {
  color: var(--primary);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--darker);
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: var(--transition);
  background: white;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
}

.form-group small {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.85rem;
  color: var(--text-light);
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

/* Dynamic Input Lists */
.feature-input,
.image-input {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  align-items: center;
}

.feature-input input,
.image-input input {
  flex: 1;
}

/* Checkbox Styling */
.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.checkbox-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.25rem;
}

.checkbox-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  cursor: pointer;
  font-weight: 500;
  color: var(--text);
  padding: 1.25rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  transition: all 0.2s ease;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  min-height: 60px;
  width: 100%;
  box-sizing: border-box;
}

.checkbox-item:hover {
  border-color: var(--primary);
  background: rgba(var(--primary-rgb), 0.03);
  box-shadow: 0 2px 8px rgba(var(--primary-rgb), 0.1);
  transform: translateY(-1px);
}

.checkbox-item input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 24px;
  height: 24px;
  border: 2px solid #cbd5e0;
  border-radius: 6px;
  position: relative;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-top: 2px;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkbox-item:hover .checkmark {
  border-color: var(--primary);
  box-shadow: 0 2px 6px rgba(var(--primary-rgb), 0.2);
}

.checkbox-item input[type="checkbox"]:checked + .checkmark {
  background: var(--primary);
  border-color: var(--primary);
  box-shadow: 0 2px 8px rgba(var(--primary-rgb), 0.3);
}

.checkbox-item input[type="checkbox"]:checked + .checkmark::after {
  content: '✓';
  color: white;
  font-weight: bold;
  font-size: 16px;
  line-height: 1;
}

/* Radio Button Styling */
.radio-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.radio-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  cursor: pointer;
  padding: 1.25rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  transition: all 0.2s ease;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  min-height: 60px;
  width: 100%;
  box-sizing: border-box;
}

.radio-item:hover {
  border-color: var(--primary);
  background: rgba(var(--primary-rgb), 0.03);
  box-shadow: 0 2px 8px rgba(var(--primary-rgb), 0.1);
  transform: translateY(-1px);
}

.radio-item input[type="radio"] {
  display: none;
}

.radio-mark {
  width: 24px;
  height: 24px;
  border: 2px solid #cbd5e0;
  border-radius: 50%;
  position: relative;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-top: 2px;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.radio-item:hover .radio-mark {
  border-color: var(--primary);
  box-shadow: 0 2px 6px rgba(var(--primary-rgb), 0.2);
}

.radio-item input[type="radio"]:checked + .radio-mark {
  border-color: var(--primary);
  box-shadow: 0 2px 8px rgba(var(--primary-rgb), 0.3);
}

.radio-item input[type="radio"]:checked + .radio-mark::after {
  content: '';
  width: 12px;
  height: 12px;
  background: var(--primary);
  border-radius: 50%;
}

.radio-label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.radio-label strong {
  color: var(--darker);
  font-size: 1rem;
}

.radio-label small {
  color: var(--text-light);
  font-size: 0.85rem;
  font-weight: normal;
}

/* Pricing Styles */
.pricing-details {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: rgba(var(--primary-rgb), 0.02);
  border-radius: 8px;
  border: 1px solid rgba(var(--primary-rgb), 0.1);
}

.price-input {
  display: flex;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  transition: var(--transition);
}

.price-input:focus-within {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
}

.currency-select {
  border: none;
  padding: 0.75rem;
  background: #f8f9fa;
  font-weight: 600;
  color: var(--darker);
  border-right: 1px solid #e2e8f0;
  min-width: 80px;
}

.currency-select:focus {
  outline: none;
}

.currency-display {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background: #f8f9fa;
  font-weight: 600;
  color: var(--darker);
  border-right: 1px solid #e2e8f0;
  min-width: 60px;
  justify-content: center;
}

.price-input input {
  border: none;
  flex: 1;
  padding: 0.75rem;
}

.price-input input:focus {
  outline: none;
}

/* Buttons */
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
  text-decoration: none;
  font-size: 0.95rem;
  white-space: nowrap;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.btn-add {
  background: #27ae60;
  color: white;
  font-size: 0.9rem;
  padding: 0.6rem 1rem;
}

.btn-add:hover {
  background: #229954;
}

.btn-remove {
  background: #e74c3c;
  color: white;
  padding: 0.5rem;
  min-width: 40px;
  justify-content: center;
}

.btn-remove:hover:not(:disabled) {
  background: #c0392b;
}

.btn-remove:disabled {
  background: #bdc3c7;
}

.btn-large {
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

/* Submit Section */
.form-submit {
  padding: 2rem;
  text-align: center;
  background: var(--light);
}

.submit-note {
  margin-top: 1rem;
  font-size: 0.9rem;
  color: var(--text-light);
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

/* Responsive Design */
@media (max-width: 768px) {
  .upload-view {
    padding: 1rem;
  }

  .upload-header h1 {
    font-size: 2rem;
  }

  .form-section {
    padding: 1.5rem;
  }

  .form-section h2 {
    font-size: 1.2rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .checkbox-grid {
    grid-template-columns: 1fr;
  }

  .radio-group {
    gap: 0.75rem;
  }

  .radio-item {
    padding: 0.75rem;
  }

  .pricing-details {
    padding: 1rem;
  }

  .price-input {
    flex-direction: column;
  }

  .currency-select,
  .currency-display {
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
    min-width: auto;
  }

  .feature-input,
  .image-input {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-remove {
    align-self: flex-end;
    margin-top: 0.5rem;
  }
}

@media (max-width: 480px) {
  .upload-view {
    padding: 0.5rem;
  }

  .upload-header h1 {
    font-size: 1.8rem;
  }

  .upload-header p {
    font-size: 1rem;
  }

  .form-section {
    padding: 1rem;
  }

  .form-section h2 {
    font-size: 1.1rem;
  }

  .form-group input,
  .form-group select,
  .form-group textarea {
    padding: 0.6rem;
  }

  .btn {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }

  .btn-large {
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
  }

  .form-submit {
    padding: 1.5rem 1rem;
  }
}

/* Loading States */
.fa-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Form Validation */
.form-group input:invalid,
.form-group select:invalid,
.form-group textarea:invalid {
  border-color: #e74c3c;
}

.form-group input:valid,
.form-group select:valid,
.form-group textarea:valid {
  border-color: #27ae60;
}
</style>