<script setup lang="ts">
import { ref } from 'vue';

const contactMethods = ref([
  {
    name: 'Discord',
    icon: 'fab fa-discord',
    link: 'https://discord.gg/GcaakuhbVk',
    label: 'Join our Discord server'
  },
  {
    name: 'Telegram',
    icon: 'fab fa-telegram',
    link: 'https://t.me/MrCode403',
    label: 'Message us on Telegram'
  },
  {
    name: 'Email',
    icon: 'fas fa-envelope',
    link: 'mailto:jagdeepsekhon101@gmail.com',
    label: 'Send us an email'
  }
]);

const form = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
});

const submitForm = () => {
  // In a real app, you would send this to your backend
  console.log('Form submitted:', form.value);
  alert('Thank you for your message! We will contact you soon.');
  form.value = { name: '', email: '', subject: '', message: '' };
};
</script>

<template>
  <div class="contact-page">
    <!-- Page Header -->
    <section class="page-header">
      <div class="container">
        <div class="header-content">
          <h1>Contact Us</h1>
          <p>Get in touch with the FS25 Mods Hub team</p>
        </div>
      </div>
    </section>

    <!-- Contact Content -->
    <div class="contact-container">
      <div class="container">
        <div class="contact-grid">
          <!-- Contact Methods -->
          <div class="contact-methods">
            <h2><i class="fas fa-comments"></i> Quick Contact</h2>
            <p>Reach out to us through these channels for fast response:</p>
            
            <div class="method-list">
              <a 
                v-for="method in contactMethods" 
                :key="method.name"
                :href="method.link"
                target="_blank"
                rel="noopener noreferrer"
                class="method-card"
              >
                <div class="method-icon">
                  <i :class="method.icon"></i>
                </div>
                <div class="method-info">
                  <h3>{{ method.name }}</h3>
                  <p>{{ method.label }}</p>
                </div>
              </a>
            </div>

            <div class="contact-info">
              <h3><i class="fas fa-info-circle"></i> Our Team</h3>
              <div class="info-item">
                <i class="fas fa-clock"></i> 
                <span>Response time: Usually within 24 hours</span>
              </div>
              <div class="info-item">
                <i class="fas fa-upload"></i> 
                <span>For mod submissions, include all relevant details</span>
              </div>
              <div class="info-item">
                <i class="fas fa-shield-alt"></i> 
                <span>All messages are handled securely and privately</span>
              </div>
            </div>
          </div>

          <!-- Contact Form -->
          <div class="contact-form">
            <h2><i class="fas fa-envelope"></i> Send Us a Message</h2>
            <p class="form-description">Fill out the form below and we'll get back to you as soon as possible.</p>
            <form @submit.prevent="submitForm">
              <div class="form-group">
                <label for="name">Your Name *</label>
                <input 
                  v-model="form.name"
                  type="text" 
                  id="name" 
                  required
                  placeholder="Enter your name"
                >
              </div>

              <div class="form-group">
                <label for="email">Email Address *</label>
                <input 
                  v-model="form.email"
                  type="email" 
                  id="email" 
                  required
                  placeholder="Enter your email"
                >
              </div>

              <div class="form-group">
                <label for="subject">Subject *</label>
                <input 
                  v-model="form.subject"
                  type="text" 
                  id="subject" 
                  required
                  placeholder="What's this about?"
                >
              </div>

              <div class="form-group">
                <label for="message">Message *</label>
                <textarea 
                  v-model="form.message"
                  id="message" 
                  required
                  rows="6"
                  placeholder="Type your message here..."
                ></textarea>
              </div>

              <button type="submit" class="submit-btn">
                <i class="fas fa-paper-plane"></i> Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Additional Info -->
    <div class="additional-info">
      <div class="container">
        <h2><i class="fas fa-users"></i> About Our Team</h2>
        <div class="info-grid">
          <div class="info-card">
            <i class="fas fa-users"></i>
            <h3>Community Driven</h3>
            <p>We're a team of FS25 enthusiasts dedicated to supporting mod creators</p>
          </div>
          <div class="info-card">
            <i class="fas fa-shield-alt"></i>
            <h3>Quality Control</h3>
            <p>All mods are manually reviewed to ensure safety and compatibility</p>
          </div>
          <div class="info-card">
            <i class="fas fa-heart"></i>
            <h3>Free Support</h3>
            <p>We provide free assistance to both mod creators and players</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Contact Page Styles - Following Website Design System */
.contact-page {
  min-height: 100vh;
  background: var(--bg);
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Page Header */
.page-header {
  background: linear-gradient(135deg, var(--darker) 0%, var(--dark) 100%);
  position: relative;
  overflow: hidden;
  padding: 6rem 0 4rem;
}

.page-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1" fill="white" opacity="0.05"/><circle cx="80" cy="20" r="1" fill="white" opacity="0.05"/><circle cx="40" cy="60" r="1" fill="white" opacity="0.05"/><circle cx="90" cy="90" r="1" fill="white" opacity="0.05"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.1;
}

.header-content {
  text-align: center;
  position: relative;
  z-index: 2;
}

.page-header h1 {
  font-size: 3.5rem;
  margin-bottom: 1.5rem;
  color: white;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.page-header p {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  font-weight: 300;
}

/* Contact Container */
.contact-container {
  padding: 5rem 0;
  background: var(--bg);
}

.contact-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: start;
}

/* Contact Methods */
.contact-methods {
  background: var(--card-bg);
  padding: 3rem;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  border: var(--border);
  height: fit-content;
}

.contact-methods h2 {
  color: var(--dark);
  margin-bottom: 1.5rem;
  font-size: 2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.contact-methods h2 i {
  color: var(--primary);
  font-size: 1.8rem;
}

.contact-methods > p {
  color: var(--text-light);
  margin-bottom: 2.5rem;
  font-size: 1.1rem;
  line-height: 1.6;
}

.method-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.method-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.75rem;
  background: var(--bg);
  border-radius: var(--radius);
  text-decoration: none;
  color: var(--text);
  transition: var(--transition);
  border: var(--border);
  position: relative;
  overflow: hidden;
}

.method-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 100%;
  background: linear-gradient(90deg, var(--primary), var(--accent));
  transition: var(--transition);
  opacity: 0.1;
}

.method-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.method-card:hover::before {
  width: 100%;
}

.method-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 1.8rem;
  position: relative;
  z-index: 2;
  flex-shrink: 0;
}

.method-card:nth-child(1) .method-icon {
  color: #5865F2;
  background: rgba(88, 101, 242, 0.1);
}

.method-card:nth-child(2) .method-icon {
  color: #26A5E4;
  background: rgba(38, 165, 228, 0.1);
}

.method-card:nth-child(3) .method-icon {
  color: var(--secondary);
  background: rgba(231, 76, 60, 0.1);
}

.method-info {
  position: relative;
  z-index: 2;
}

.method-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--dark);
}

.method-info p {
  margin: 0;
  font-size: 1rem;
  color: var(--text-light);
  line-height: 1.4;
}

.contact-info {
  margin-top: 2.5rem;
  padding-top: 2.5rem;
  border-top: 1px solid var(--gray);
}

.contact-info h3 {
  margin-bottom: 1.5rem;
  color: var(--dark);
  font-size: 1.4rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.contact-info h3 i {
  color: var(--primary);
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  color: var(--text);
  font-size: 1rem;
}

.info-item i {
  color: var(--primary);
  width: 20px;
  text-align: center;
}

/* Contact Form */
.contact-form {
  background: var(--card-bg);
  padding: 3rem;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  border: var(--border);
}

.contact-form h2 {
  color: var(--dark);
  margin-bottom: 1rem;
  font-size: 2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.contact-form h2 i {
  color: var(--primary);
  font-size: 1.8rem;
}

.form-description {
  color: var(--text-light);
  margin-bottom: 2.5rem;
  font-size: 1.1rem;
  line-height: 1.6;
}

.form-group {
  margin-bottom: 2rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 600;
  color: var(--dark);
  font-size: 1rem;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 1rem 1.25rem;
  border: 1px solid var(--gray);
  border-radius: var(--radius);
  font-size: 1rem;
  font-family: inherit;
  transition: var(--transition);
  background: var(--bg);
  color: var(--text);
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 140px;
  line-height: 1.6;
}

.submit-btn {
  background: var(--primary);
  color: white;
  border: none;
  padding: 1rem 2.5rem;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
  width: fit-content;
}

.submit-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(39, 174, 96, 0.3);
}

/* Additional Info */
.additional-info {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 5rem 0;
  text-align: center;
}

.additional-info h2 {
  color: var(--dark);
  margin-bottom: 3rem;
  font-size: 2.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.additional-info h2 i {
  color: var(--primary);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2.5rem;
}

.info-card {
  background: var(--card-bg);
  padding: 3rem 2rem;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  border: var(--border);
  transition: var(--transition);
  position: relative;
  overflow: hidden;
}

.info-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 4px;
  background: var(--primary);
  transition: var(--transition);
}

.info-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0,0,0,0.1);
}

.info-card:hover::before {
  width: 100%;
}

.info-card i {
  font-size: 3rem;
  color: var(--primary);
  margin-bottom: 1.5rem;
}

.info-card h3 {
  margin: 0 0 1.5rem 0;
  color: var(--dark);
  font-size: 1.5rem;
  font-weight: 600;
}

.info-card p {
  color: var(--text-light);
  margin: 0;
  font-size: 1.1rem;
  line-height: 1.6;
}

/* Enhanced Responsive Design */
@media (max-width: 1200px) {
  .container {
    padding: 0 1.5rem;
  }
  
  .contact-grid {
    gap: 3rem;
  }
  
  .contact-methods,
  .contact-form {
    padding: 2.5rem;
  }
}

@media (max-width: 992px) {
  .contact-grid {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
  
  .contact-methods {
    order: 2;
  }
  
  .contact-form {
    order: 1;
  }
  
  .page-header h1 {
    font-size: 3rem;
  }
  
  .info-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
  
  .page-header {
    padding: 4rem 0 3rem;
  }
  
  .page-header h1 {
    font-size: 2.5rem;
  }
  
  .page-header p {
    font-size: 1.1rem;
  }
  
  .contact-container {
    padding: 3rem 0;
  }
  
  .contact-methods,
  .contact-form {
    padding: 2rem;
  }
  
  .contact-methods h2,
  .contact-form h2 {
    font-size: 1.8rem;
  }
  
  .method-card {
    padding: 1.5rem;
    gap: 1.25rem;
  }
  
  .method-icon {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
  }
  
  .method-info h3 {
    font-size: 1.2rem;
  }
  
  .additional-info {
    padding: 4rem 0;
  }
  
  .additional-info h2 {
    font-size: 2.2rem;
    margin-bottom: 2rem;
  }
  
  .info-card {
    padding: 2.5rem 1.5rem;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: 3rem 0 2rem;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .page-header p {
    font-size: 1rem;
  }
  
  .contact-container {
    padding: 2rem 0;
  }
  
  .contact-methods,
  .contact-form {
    padding: 1.5rem;
  }
  
  .contact-methods h2,
  .contact-form h2 {
    font-size: 1.6rem;
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
  
  .method-card {
    padding: 1.25rem;
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .submit-btn {
    width: 100%;
    justify-content: center;
  }
  
  .additional-info {
    padding: 3rem 0;
  }
  
  .additional-info h2 {
    font-size: 1.8rem;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .info-card {
    padding: 2rem 1.25rem;
  }
}

@media (max-width: 360px) {
  .container {
    padding: 0 0.75rem;
  }
  
  .page-header h1 {
    font-size: 1.8rem;
  }
  
  .contact-methods,
  .contact-form {
    padding: 1.25rem;
  }
  
  .method-card {
    padding: 1rem;
  }
  
  .info-card {
    padding: 1.5rem 1rem;
  }
}
</style>