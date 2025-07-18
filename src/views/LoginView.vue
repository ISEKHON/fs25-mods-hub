<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  email: '',
  password: ''
})

const isLoading = ref(false)
const showPassword = ref(false)
const errors = ref<string[]>([])

const handleLogin = async () => {
  errors.value = []
  
  // Basic validation
  if (!form.email || !form.password) {
    errors.value.push('Please fill in all fields')
    return
  }

  if (!form.email.includes('@')) {
    errors.value.push('Please enter a valid email address')
    return
  }

  if (form.password.length < 6) {
    errors.value.push('Password must be at least 6 characters long')
    return
  }

  isLoading.value = true

  try {
    const result = await authStore.login(form.email, form.password)
    
    if (result.success) {
      // Redirect to home
      router.push('/')
    } else {
      errors.value.push(result.message || 'Login failed')
    }
    
  } catch (error) {
    console.error('Login error:', error)
    errors.value.push('Login failed. Please check your connection.')
  } finally {
    isLoading.value = false
  }
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const goToRegister = () => {
  router.push('/register')
}

const forgotPassword = () => {
  router.push('/forgot-password')
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-container">
      <!-- Left side - Branding -->
      <div class="auth-branding">
        <div class="branding-content">
          <div class="logo-section">
            <i class="fas fa-tractor"></i>
            <h1>FS25 Mods Hub</h1>
          </div>
          <p class="tagline">Join the ultimate farming simulation community</p>
          
          <div class="features-list">
            <div class="feature-item">
              <div class="feature-icon">
                <i class="fas fa-download"></i>
              </div>
              <div class="feature-content">
                <h4>Download Premium Mods</h4>
                <p>Access thousands of high-quality mods</p>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <i class="fas fa-star"></i>
              </div>
              <div class="feature-content">
                <h4>Rate & Review</h4>
                <p>Share your experience with the community</p>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <i class="fas fa-users"></i>
              </div>
              <div class="feature-content">
                <h4>Connect with Developers</h4>
                <p>Join a thriving modding community</p>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <i class="fas fa-cloud-upload-alt"></i>
              </div>
              <div class="feature-content">
                <h4>Upload Your Mods</h4>
                <p>Share your creations with farmers worldwide</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="auth-decoration">
          <div class="floating-icon icon-1">
            <i class="fas fa-tractor"></i>
          </div>
          <div class="floating-icon icon-2">
            <i class="fas fa-seedling"></i>
          </div>
          <div class="floating-icon icon-3">
            <i class="fas fa-wheat-awn"></i>
          </div>
        </div>
      </div>

      <!-- Right side - Login Form -->
      <div class="auth-form-section">
        <div class="auth-form">
          <div class="form-header">
            <h2>Welcome Back!</h2>
            <p>Sign in to your account to continue</p>
          </div>

          <!-- Error Messages -->
          <div v-if="errors.length > 0" class="error-messages">
            <div v-for="error in errors" :key="error" class="error-message">
              <i class="fas fa-exclamation-triangle"></i>
              {{ error }}
            </div>
          </div>

          <form @submit.prevent="handleLogin" class="login-form">
            <!-- Email Field -->
            <div class="form-group">
              <label for="email">Email Address</label>
              <div class="input-wrapper">
                <i class="fas fa-envelope"></i>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  placeholder="Enter your email"
                  class="form-control"
                  :disabled="isLoading"
                  autocomplete="email"
                />
              </div>
            </div>

            <!-- Password Field -->
            <div class="form-group">
              <label for="password">Password</label>
              <div class="input-wrapper">
                <i class="fas fa-lock"></i>
                <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Enter your password"
                  class="form-control"
                  :disabled="isLoading"
                  autocomplete="current-password"
                />
                <button
                  type="button"
                  class="password-toggle"
                  @click="togglePasswordVisibility"
                  :disabled="isLoading"
                >
                  <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
            </div>

            <!-- Remember Me & Forgot Password -->
            <div class="form-options">
              <label class="checkbox-wrapper">
                <input type="checkbox" />
                <span class="checkmark"></span>
                Remember me
              </label>
              <button type="button" class="forgot-password" @click="forgotPassword">
                Forgot password?
              </button>
            </div>

            <!-- Submit Button -->
            <button type="submit" class="btn-submit" :disabled="isLoading">
              <div v-if="isLoading" class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
              </div>
              <span v-else>
                <i class="fas fa-sign-in-alt"></i>
                Sign In
              </span>
            </button>
          </form>

          <!-- Register Link -->
          <div class="auth-footer">
            <p>Don't have an account? 
              <button @click="goToRegister" class="link-button">
                Create one here
              </button>
            </p>
          </div>

          <!-- Social Login -->
          <div class="social-login">
            <div class="divider">
              <span>Or continue with</span>
            </div>
            <div class="social-buttons">
              <button class="social-btn google">
                <i class="fab fa-google"></i>
                Google
              </button>
              <button class="social-btn discord">
                <i class="fab fa-discord"></i>
                Discord
              </button>
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

.auth-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  max-width: 1200px;
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
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
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
  max-width: 400px;
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
.login-form {
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

.password-toggle {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: var(--text-light);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: var(--transition);
}

.password-toggle:hover {
  color: var(--primary);
  background: rgba(39, 174, 96, 0.1);
}

/* Form Options */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  font-size: 0.9rem;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: var(--text);
}

.checkbox-wrapper input {
  display: none;
}

.checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid #e2e8f0;
  border-radius: 4px;
  position: relative;
  transition: var(--transition);
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

.forgot-password {
  background: none;
  border: none;
  color: var(--primary);
  cursor: pointer;
  text-decoration: none;
  font-size: 0.9rem;
  transition: var(--transition);
}

.forgot-password:hover {
  text-decoration: underline;
}

/* Submit Button */
.btn-submit {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
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
  box-shadow: 0 4px 15px rgba(39, 174, 96, 0.3);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(39, 174, 96, 0.4);
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

/* Social Login */
.social-login {
  margin-top: 2rem;
}

.divider {
  position: relative;
  text-align: center;
  margin-bottom: 1.5rem;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e2e8f0;
}

.divider span {
  background: white;
  padding: 0 1rem;
  color: var(--text-light);
  font-size: 0.9rem;
}

.social-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: var(--transition);
  font-weight: 500;
}

.social-btn:hover {
  border-color: var(--primary);
  background: rgba(39, 174, 96, 0.05);
}

.social-btn.google {
  color: #4285f4;
}

.social-btn.discord {
  color: #5865f2;
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

  .form-header h2 {
    font-size: 1.75rem;
  }

  .features-list {
    grid-template-columns: 1fr;
  }

  .social-buttons {
    grid-template-columns: 1fr;
  }
}
</style>
