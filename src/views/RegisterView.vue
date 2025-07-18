<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeToTerms: false
})

const isLoading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const errors = ref<string[]>([])

const passwordStrength = computed(() => {
  const password = form.password
  if (!password) return { strength: 0, label: '', color: '' }
  
  let strength = 0
  if (password.length >= 8) strength++
  if (/[a-z]/.test(password)) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[^A-Za-z0-9]/.test(password)) strength++
  
  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['#ff4757', '#ff6b7a', '#ffa502', '#2ed573', '#5f27cd']
  
  return {
    strength: (strength / 5) * 100,
    label: labels[strength - 1] || 'Very Weak',
    color: colors[strength - 1] || '#ff4757'
  }
})

const handleRegister = async () => {
  errors.value = []
  
  // Validation
  if (!form.username || !form.email || !form.password || !form.confirmPassword) {
    errors.value.push('Please fill in all fields')
    return
  }

  if (form.username.length < 3) {
    errors.value.push('Username must be at least 3 characters long')
    return
  }

  if (!form.email.includes('@')) {
    errors.value.push('Please enter a valid email address')
    return
  }

  if (form.password.length < 8) {
    errors.value.push('Password must be at least 8 characters long')
    return
  }

  if (form.password !== form.confirmPassword) {
    errors.value.push('Passwords do not match')
    return
  }

  if (!form.agreeToTerms) {
    errors.value.push('Please agree to the Terms of Service and Privacy Policy')
    return
  }

  isLoading.value = true

  try {
    const response = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: form.username,
        email: form.email,
        password: form.password
      })
    })

    const data = await response.json()

    if (data.success) {
      // Store token in localStorage
      localStorage.setItem('token', data.data.token)
      localStorage.setItem('user', JSON.stringify(data.data.user))
      
      // Redirect to home
      router.push('/')
    } else {
      errors.value.push(data.message || 'Registration failed')
    }
    
  } catch (error) {
    console.error('Registration error:', error)
    errors.value.push('Registration failed. Please check your connection.')
  } finally {
    isLoading.value = false
  }
}

const togglePasswordVisibility = (field: 'password' | 'confirmPassword') => {
  if (field === 'password') {
    showPassword.value = !showPassword.value
  } else {
    showConfirmPassword.value = !showConfirmPassword.value
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-container register-container">
      <!-- Left side - Branding -->
      <div class="auth-branding">
        <div class="branding-content">
          <div class="logo-section">
            <i class="fas fa-tractor"></i>
            <h1>Join FS25 Hub</h1>
          </div>
          <p class="tagline">Create your account and start your farming journey</p>
          
          <div class="benefits-list">
            <div class="benefit-item">
              <div class="benefit-icon">
                <i class="fas fa-gift"></i>
              </div>
              <div class="benefit-content">
                <h4>Free Account</h4>
                <p>Sign up for free and get instant access to thousands of mods</p>
              </div>
            </div>
            
            <div class="benefit-item">
              <div class="benefit-icon">
                <i class="fas fa-shield-alt"></i>
              </div>
              <div class="benefit-content">
                <h4>Safe & Secure</h4>
                <p>Your data is protected with industry-standard security</p>
              </div>
            </div>
            
            <div class="benefit-item">
              <div class="benefit-icon">
                <i class="fas fa-users"></i>
              </div>
              <div class="benefit-content">
                <h4>Active Community</h4>
                <p>Join thousands of farmers and mod creators worldwide</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="auth-decoration">
          <div class="floating-icon icon-1">
            <i class="fas fa-seedling"></i>
          </div>
          <div class="floating-icon icon-2">
            <i class="fas fa-wheat-awn"></i>
          </div>
          <div class="floating-icon icon-3">
            <i class="fas fa-barn"></i>
          </div>
        </div>
      </div>

      <!-- Right side - Register Form -->
      <div class="auth-form-section">
        <div class="auth-form">
          <div class="form-header">
            <h2>Create Account</h2>
            <p>Join our community of farming enthusiasts</p>
          </div>

          <!-- Error Messages -->
          <div v-if="errors.length > 0" class="error-messages">
            <div v-for="error in errors" :key="error" class="error-message">
              <i class="fas fa-exclamation-triangle"></i>
              {{ error }}
            </div>
          </div>

          <form @submit.prevent="handleRegister" class="register-form">
            <!-- Username Field -->
            <div class="form-group">
              <label for="username">Username</label>
              <div class="input-wrapper">
                <i class="fas fa-user"></i>
                <input
                  id="username"
                  v-model="form.username"
                  type="text"
                  placeholder="Choose a username"
                  class="form-control"
                  :disabled="isLoading"
                  autocomplete="username"
                />
              </div>
            </div>

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
                  placeholder="Create a password"
                  class="form-control"
                  :disabled="isLoading"
                  autocomplete="new-password"
                />
                <button
                  type="button"
                  class="password-toggle"
                  @click="togglePasswordVisibility('password')"
                  :disabled="isLoading"
                >
                  <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
              
              <!-- Password Strength Indicator -->
              <div v-if="form.password" class="password-strength">
                <div class="strength-bar">
                  <div 
                    class="strength-fill" 
                    :style="{ 
                      width: passwordStrength.strength + '%', 
                      backgroundColor: passwordStrength.color 
                    }"
                  ></div>
                </div>
                <span class="strength-label" :style="{ color: passwordStrength.color }">
                  {{ passwordStrength.label }}
                </span>
              </div>
            </div>

            <!-- Confirm Password Field -->
            <div class="form-group">
              <label for="confirmPassword">Confirm Password</label>
              <div class="input-wrapper">
                <i class="fas fa-lock"></i>
                <input
                  id="confirmPassword"
                  v-model="form.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="Confirm your password"
                  class="form-control"
                  :class="{ 
                    'password-match': form.confirmPassword && form.password === form.confirmPassword,
                    'password-mismatch': form.confirmPassword && form.password !== form.confirmPassword
                  }"
                  :disabled="isLoading"
                  autocomplete="new-password"
                />
                <button
                  type="button"
                  class="password-toggle"
                  @click="togglePasswordVisibility('confirmPassword')"
                  :disabled="isLoading"
                >
                  <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
            </div>

            <!-- Terms Agreement -->
            <div class="form-group">
              <label class="checkbox-wrapper" :class="{ 'checkbox-error': !form.agreeToTerms && errors.length > 0 }">
                <input 
                  v-model="form.agreeToTerms" 
                  type="checkbox" 
                  id="agreeToTerms"
                  :disabled="isLoading"
                />
                <span class="checkmark"></span>
                <span class="checkbox-text">
                  I agree to the 
                  <RouterLink to="/terms" target="_blank" class="terms-link">Terms of Service</RouterLink> 
                  and 
                  <RouterLink to="/privacy" target="_blank" class="terms-link">Privacy Policy</RouterLink>
                </span>
              </label>
            </div>

            <!-- Submit Button -->
            <button type="submit" class="btn-submit" :disabled="isLoading">
              <div v-if="isLoading" class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                Creating Account...
              </div>
              <span v-else>
                <i class="fas fa-user-plus"></i>
                Create Account
              </span>
            </button>
          </form>

          <!-- Login Link -->
          <div class="auth-footer">
            <p>Already have an account? 
              <button @click="goToLogin" class="link-button">
                Sign in here
              </button>
            </p>
          </div>

          <!-- Social Register -->
          <div class="social-login">
            <div class="divider">
              <span>Or sign up with</span>
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

.register-container {
  max-width: 1300px;
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

.benefits-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.benefit-item {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.benefit-icon {
  background: rgba(255, 255, 255, 0.2);
  padding: 1rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  height: 60px;
}

.benefit-icon i {
  font-size: 1.5rem;
  color: white;
}

.benefit-content h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.benefit-content p {
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
  top: 15%;
  right: 15%;
  font-size: 4rem;
  animation-delay: 0s;
}

.icon-2 {
  bottom: 25%;
  right: 20%;
  font-size: 3rem;
  animation-delay: 2s;
}

.icon-3 {
  top: 50%;
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
.register-form {
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

.form-control.password-match {
  border-color: #38a169;
}

.form-control.password-mismatch {
  border-color: #e53e3e;
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

/* Password Strength */
.password-strength {
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 2px;
}

.strength-label {
  font-size: 0.8rem;
  font-weight: 500;
  min-width: 80px;
}

/* Checkbox */
.checkbox-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
  color: var(--text);
  line-height: 1.5;
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
  flex-shrink: 0;
  margin-top: 2px;
  background: white;
}

.checkbox-wrapper:hover .checkmark {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(39, 174, 96, 0.1);
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

.checkbox-wrapper.checkbox-error .checkmark {
  border-color: #e53e3e;
  animation: shake 0.3s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}

.checkbox-text {
  font-size: 0.9rem;
}

.terms-link {
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
}

.terms-link:hover {
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
@media (max-width: 1100px) {
  .register-container {
    max-width: 900px;
  }
  
  .auth-branding {
    padding: 2rem;
  }
  
  .auth-form-section {
    padding: 2rem;
  }
}

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

  .benefits-list {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .benefit-item {
    justify-content: center;
    text-align: center;
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

  .social-buttons {
    grid-template-columns: 1fr;
  }

  .benefit-item {
    flex-direction: column;
    text-align: center;
  }
}
</style>
