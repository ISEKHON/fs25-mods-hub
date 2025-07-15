<script setup lang="ts">
const contactMethods = [
  {
    name: 'Discord',
    icon: 'fab fa-discord',
    link: 'https://discord.gg/GcaakuhbVk',
    label: 'Join our Discord server and message the mod team'
  },
  {
    name: 'Telegram',
    icon: 'fab fa-telegram',
    link: 'https://t.me/MrCode_403',
    label: 'Message us directly on Telegram'
  },
  {
    name: 'Email',
    icon: 'fas fa-envelope',
    link: 'jagdeepsekhon101@gmail.com',
    label: 'Send us an email with your mod details'
  }
]
</script>

<template>
  <div class="contact-view">
    <div class="section-title">
      <h2>Submit Your Mod</h2>
      <p>Contact our admin team to upload your FS25 mod for free</p>
    </div>
    
    <div class="contact-container">
      <div class="contact-icon">
        <i class="fas fa-headset"></i>
      </div>
      
      <div class="contact-content">
        <h3>How to Submit Your Mod</h3>
        <p>To upload your mod, please contact us through one of these methods:</p>
        
        <div class="method-grid">
          <a 
            v-for="method in contactMethods" 
            :key="method.name" 
            :href="method.link" 
            target="_blank" 
            class="method-card"
          >
            <div class="method-icon">
              <i :class="method.icon"></i>
            </div>
            <div class="method-info">
              <h4>{{ method.name }}</h4>
              <p>{{ method.label }}</p>
            </div>
          </a>
        </div>
      </div>
      
      <div class="upload-info">
        <h3>Submission Guidelines</h3>
        <p>When contacting us about your mod, please include:</p>
        <ul>
          <li><i class="fas fa-check-circle"></i> Mod name and version</li>
          <li><i class="fas fa-check-circle"></i> Brief description</li>
          <li><i class="fas fa-check-circle"></i> Download link to your mod files</li>
          <li><i class="fas fa-check-circle"></i> Any preview images or videos</li>
        </ul>
        <p class="note">Note: All mods are manually reviewed before being published to ensure quality and compatibility.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contact-view {
  padding: 4rem 2rem;
  max-width: 900px;
  margin: 0 auto;
}

.section-title {
  text-align: center;
  margin-bottom: 2rem;
}

.section-title h2 {
  color: var(--dark);
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.section-title p {
  color: var(--text-light);
  font-size: 1.1rem;
}

.contact-container {
  background: white;
  padding: 3rem;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.contact-icon {
  font-size: 4.5rem;
  color: var(--primary);
  text-align: center;
}

.contact-content {
  text-align: center;
}

.contact-content h3 {
  margin-bottom: 1rem;
  color: var(--dark);
  font-size: 1.5rem;
}

.contact-content p {
  margin-bottom: 2rem;
  color: var(--text-light);
  font-size: 1.1rem;
}

.method-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.method-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 8px;
  background: var(--light);
  transition: var(--transition);
  text-decoration: none;
  color: var(--dark);
  border: 1px solid var(--gray-light);
}

.method-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  border-color: var(--primary);
}

.method-icon {
  font-size: 2rem;
  color: var(--primary);
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(39, 174, 96, 0.1);
  border-radius: 50%;
}

.method-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1.2rem;
}

.method-info p {
  margin: 0;
  color: var(--text-light);
  font-size: 0.9rem;
}

.upload-info {
  background: var(--light);
  padding: 2rem;
  border-radius: 8px;
}

.upload-info h3 {
  margin-bottom: 1rem;
  color: var(--dark);
}

.upload-info p {
  margin-bottom: 1rem;
  color: var(--text-light);
}

.upload-info ul {
  list-style: none;
  padding: 0;
  margin: 1.5rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.upload-info li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--dark);
}

.upload-info li i {
  color: var(--primary);
}

.note {
  font-style: italic;
  font-size: 0.9rem;
  color: var(--text-light);
}

/* Enhanced Responsive Design */
@media (max-width: 1200px) {
  .contact-view {
    padding: 3.5rem 1.5rem;
    max-width: 100%;
  }
  
  .contact-container {
    padding: 2.5rem;
  }
  
  .method-grid {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }
}

@media (max-width: 992px) {
  .contact-view {
    padding: 3rem 1.5rem;
  }
  
  .section-title h2 {
    font-size: 1.8rem;
  }
  
  .contact-container {
    padding: 2.25rem;
    gap: 2.5rem;
  }
  
  .contact-content h3 {
    font-size: 1.4rem;
  }
  
  .contact-content p {
    font-size: 1rem;
  }
  
  .contact-icon {
    font-size: 4rem;
  }
}

@media (max-width: 768px) {
  .contact-view {
    padding: 2rem 1rem;
  }
  
  .section-title {
    margin-bottom: 1.5rem;
  }
  
  .section-title h2 {
    font-size: 1.7rem;
  }
  
  .section-title p {
    font-size: 1rem;
  }
  
  .contact-container {
    padding: 2rem 1rem;
    gap: 2rem;
  }
  
  .contact-content {
    text-align: center;
  }
  
  .contact-content h3 {
    font-size: 1.3rem;
    margin-bottom: 0.75rem;
  }
  
  .contact-content p {
    font-size: 0.95rem;
    margin-bottom: 1.5rem;
  }
  
  .contact-icon {
    font-size: 3.5rem;
  }
  
  .method-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
  
  .method-card {
    padding: 1.25rem;
    text-align: center;
    flex-direction: column;
  }
  
  .method-icon {
    margin-bottom: 0.75rem;
    width: 50px;
    height: 50px;
    font-size: 1.8rem;
  }
  
  .upload-info {
    padding: 1.5rem;
  }
  
  .upload-info h3 {
    font-size: 1.2rem;
  }
  
  .upload-info p, .upload-info li {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .contact-view {
    padding: 1.5rem 1rem;
  }
  
  .section-title h2 {
    font-size: 1.5rem;
  }
  
  .section-title p {
    font-size: 0.95rem;
  }
  
  .contact-container {
    padding: 1.5rem 1rem;
    gap: 1.5rem;
  }
  
  .contact-content h3 {
    font-size: 1.2rem;
  }
  
  .contact-content p {
    font-size: 0.9rem;
    margin-bottom: 1.25rem;
  }
  
  .contact-icon {
    font-size: 3rem;
  }
  
  .method-card {
    padding: 1rem;
  }
  
  .method-icon {
    width: 45px;
    height: 45px;
    font-size: 1.6rem;
    margin-bottom: 0.5rem;
  }
  
  .method-info h4 {
    font-size: 1.1rem;
    margin-bottom: 0.25rem;
  }
  
  .method-info p {
    font-size: 0.85rem;
  }
  
  .upload-info {
    padding: 1.25rem;
  }
  
  .upload-info h3 {
    font-size: 1.1rem;
    margin-bottom: 0.75rem;
  }
  
  .upload-info p {
    font-size: 0.85rem;
    margin-bottom: 0.75rem;
  }
  
  .upload-info ul {
    margin: 1rem 0;
    gap: 0.6rem;
  }
  
  .upload-info li {
    font-size: 0.85rem;
  }
  
  .note {
    font-size: 0.8rem;
  }
}

@media (max-width: 360px) {
  .contact-view {
    padding: 1.25rem 0.75rem;
  }
  
  .section-title h2 {
    font-size: 1.4rem;
  }
  
  .contact-container {
    padding: 1.25rem 0.75rem;
  }
  
  .contact-icon {
    font-size: 2.75rem;
  }
  
  .method-card {
    padding: 0.85rem;
  }
  
  .upload-info {
    padding: 1rem;
  }
}
</style>