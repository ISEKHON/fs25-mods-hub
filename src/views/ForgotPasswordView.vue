<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = reactive({
  email: ''
})

const isLoading = ref(false)
const isSuccess = ref(false)
const errors = ref<string[]>([])

const handleForgotPassword = async () => {
  errors.value = []
  
  // Basic validation
  if (!form.email) {
    errors.value.push('Please enter your email address')
    return
  }

  if (!form.email.includes('@')) {
    errors.value.push('Please enter a valid email address')
    return
  }

  isLoading.value = true

  try {
    // TODO: Replace with actual API call to Supabase
    console.log('Password reset request for:', form.email)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    isSuccess.value = true
    
  } catch (error) {
    errors.value.push('Failed to send reset email. Please try again.')
  } finally {
    isLoading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}

const resendEmail = () => {
  isSuccess.value = false
  handleForgotPassword()
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-container forgot-container">
      <!-- Left side - Branding -->
      <div class="auth-branding">
        <div class="branding-content">
          <div class="logo-section">
            <i class="fas fa-shield-alt"></i>
            <h1>Password Reset</h1>
          </div>
          <p class="tagline">Don't worry, we'll help you get back into your account</p>
          
          <div class="features-list">
            <div class="feature-item">
              <div class="feature-icon">
                <i class="fas fa-envelope"></i>
              </div>
              <div class="feature-content">
                <h4>Secure Email Verification</h4>
                <p>Get a secure reset link sent to your email</p>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <i class="fas fa-lock"></i>
              </div>
              <div class="feature-content">
                <h4>Strong Password Protection</h4>
                <p>Your new password will be encrypted and secure</p>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <i class="fas fa-clock"></i>
              </div>
              <div class="feature-content">
                <h4>Quick & Easy Process</h4>
                <p>Reset your password in just a few simple steps</p>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <i class="fas fa-user-shield"></i>
              </div>
              <div class="feature-content">
                <h4>Account Security Priority</h4>
                <p>Your account safety is our top priority</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="auth-decoration">
          <div class="floating-icon icon-1">
            <i class="fas fa-key"></i>
          </div>
          <div class="floating-icon icon-2">
            <i class="fas fa-envelope"></i>
          </div>
          <div class="floating-icon icon-3">
            <i class="fas fa-shield-alt"></i>
          </div>
        </div>
      </div>

      <!-- Right side - Reset Form -->
      <div class="auth-form-section">
        <div class="auth-form">
          <!-- Success State -->
          <div v-if="isSuccess" class="success-state">
            <div class="success-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <h2>Check Your Email!</h2>
            <p class="success-message">
              We've sent a password reset link to <strong>{{ form.email }}</strong>
            </p>
            <p class="success-note">
              Please check your email and click the link to reset your password. The link will expire in 24 hours.
            </p>
            
            <div class="success-actions">
              <button @click="goToLogin" class="btn btn-primary">
                <i class="fas fa-arrow-left"></i>
                Back to Login
              </button>
              <button @click="resendEmail" class="btn btn-outline">
                <i class="fas fa-redo"></i>
                Resend Email
              </button>
            </div>
            
            <div class="help-note">
              <p>Didn't receive the email? Check your spam folder or 
                <button @click="resendEmail" class="link-button">try again</button>
              </p>
            </div>
          </div>

          <!-- Form State -->
          <div v-else>
            <div class="form-header">
              <h2>Forgot Password?</h2>
              <p>Enter your email address and we'll send you a link to reset your password</p>
            </div>

            <!-- Error Messages -->
            <div v-if="errors.length > 0" class="error-messages">
              <div v-for="error in errors" :key="error" class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                {{ error }}
              </div>
            </div>

            <form @submit.prevent="handleForgotPassword" class="reset-form">
              <!-- Email Field -->
              <div class="form-group">
                <label for="email">Email Address</label>
                <div class="input-wrapper">
                  <i class="fas fa-envelope"></i>
                  <input
                    id="email"
                    v-model="form.email"
                    type="email"
                    placeholder="Enter your email address"
                    class="form-control"
                    :disabled="isLoading"
                    autocomplete="email"
                  />
                </div>
              </div>

              <!-- Submit Button -->
              <button type="submit" class="btn-submit" :disabled="isLoading">
                <div v-if="isLoading" class="loading-spinner">
                  <i class="fas fa-spinner fa-spin"></i>
                  Sending Reset Link...
                </div>
                <span v-else>
                  <i class="fas fa-paper-plane"></i>
                  Send Reset Link
                </span>
              </button>
            </form>

            <!-- Back to Login -->
            <div class="auth-footer">
              <p>Remember your password? 
                <button @click="goToLogin" class="link-button">
                  Sign in here
                </button>
              </p>
            </div>

            <!-- Help Section -->
            <div class="help-section">
              <div class="help-item">
                <i class="fas fa-info-circle"></i>
                <span>If you don't have an account, you can <RouterLink to="/register" class="help-link">create one here</RouterLink></span>
              </div>
              <div class="help-item">
                <i class="fas fa-question-circle"></i>
                <span>Need help? <RouterLink to="/contact" class="help-link">Contact our support team</RouterLink></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--darker) 0%, #1a1a1a 50%, var(--darker) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.auth-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 80%, rgba(39, 174, 96, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(243, 156, 18, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.forgot-container {
  max-width: 1100px;
}

.auth-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: 100%;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  position: relative;
  z-index: 1;
}

/* Left Side - Branding */
.auth-branding {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.branding-content {
  position: relative;
  z-index: 2;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.logo-section i {
  font-size: 3rem;
  color: rgba(255, 255, 255, 0.9);
}

.logo-section h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(45deg, white, rgba(255, 255, 255, 0.8));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.tagline {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 3rem;
  line-height: 1.6;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.feature-item {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.feature-icon {
  background: rgba(255, 255, 255, 0.2);
  padding: 1rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  height: 60px;
}

.feature-icon i {
  font-size: 1.5rem;
  color: white;
}

.feature-content h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.feature-content p {
  margin: 0;
  opacity: 0.9;
  font-size: 0.95rem;
  line-height: 1.5;
}

/* Floating Decorations */
.auth-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.floating-icon {
  position: absolute;
  opacity: 0.1;
  animation: float 6s ease-in-out infinite;
}

.icon-1 {
  top: 20%;
  right: 20%;
  font-size: 4rem;
  animation-delay: 0s;
}

.icon-2 {
  bottom: 30%;
  right: 15%;
  font-size: 3rem;
  animation-delay: 2s;
}

.icon-3 {
  top: 60%;
  right: 10%;
  font-size: 2.5rem;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

/* Right Side - Form */
.auth-form-section {
  padding: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-form {
  width: 100%;
  max-width: 450px;
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.form-header h2 {
  font-size: 2rem;
  color: var(--darker);
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.form-header p {
  color: var(--text-light);
  font-size: 1rem;
  line-height: 1.6;
}

/* Success State */
.success-state {
  text-align: center;
}

.success-icon {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: white;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin: 0 auto 2rem;
  animation: scaleIn 0.5s ease-out;
}

@keyframes scaleIn {
  0% { transform: scale(0); }
  100% { transform: scale(1); }
}

.success-state h2 {
  font-size: 2rem;
  color: var(--darker);
  margin-bottom: 1rem;
  font-weight: 700;
}

.success-message {
  color: var(--text);
  font-size: 1.1rem;
  margin-bottom: 1rem;
  line-height: 1.6;
}

.success-note {
  color: var(--text-light);
  font-size: 0.95rem;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.success-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.help-note {
  background: var(--light);
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid var(--primary);
}

.help-note p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text);
}

/* Error Messages */
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

/* Form Styles */
.reset-form {
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--darker);
  font-size: 0.95rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper i {
  position: absolute;
  left: 1rem;
  color: var(--text-light);
  z-index: 2;
}

.form-control {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
}

.form-control:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.1);
}

.form-control:disabled {
  background: #f7fafc;
  cursor: not-allowed;
}

/* Submit Button */
.btn-submit {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(231, 76, 60, 0.4);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Auth Footer */
.auth-footer {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-footer p {
  color: var(--text-light);
  margin: 0;
}

.link-button {
  background: none;
  border: none;
  color: var(--primary);
  cursor: pointer;
  font-weight: 600;
  text-decoration: none;
  transition: var(--transition);
}

.link-button:hover {
  text-decoration: underline;
}

/* Help Section */
.help-section {
  background: var(--light);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.help-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: var(--text);
}

.help-item:last-child {
  margin-bottom: 0;
}

.help-item i {
  color: var(--primary);
  margin-top: 0.1rem;
  flex-shrink: 0;
}

.help-link {
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
}

.help-link:hover {
  text-decoration: underline;
}

/* Button Styles */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: var(--transition);
  font-size: 0.9rem;
  width: 100%;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
}

.btn-outline {
  background: transparent;
  color: var(--text);
  border: 2px solid #e2e8f0;
}

.btn-outline:hover {
  border-color: var(--primary);
  background: rgba(39, 174, 96, 0.05);
  color: var(--primary);
}

/* Responsive Design */
@media (max-width: 968px) {
  .auth-container {
    grid-template-columns: 1fr;
    max-width: 500px;
  }

  .auth-branding {
    padding: 2rem;
    text-align: center;
  }

  .logo-section {
    justify-content: center;
  }

  .logo-section h1 {
    font-size: 2rem;
  }

  .features-list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
}

@media (max-width: 640px) {
  .auth-page {
    padding: 1rem;
  }

  .auth-form-section {
    padding: 2rem 1.5rem;
  }

  .form-header h2, .success-state h2 {
    font-size: 1.75rem;
  }

  .features-list {
    grid-template-columns: 1fr;
  }

  .success-actions {
    flex-direction: column;
  }
}
</style>
