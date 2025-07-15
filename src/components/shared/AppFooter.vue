<script setup lang="ts">
const currentYear = new Date().getFullYear()

// Function to scroll to top
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// Handle footer link clicks
const handleFooterLinkClick = () => {
  // Small delay to allow navigation to complete
  setTimeout(() => {
    scrollToTop()
  }, 100)
}
</script>

<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-col">
        <h3>FS25 Mods Hub</h3>
        <p>Your premier source for free Farming Simulator 25 mods. All mods are free to download with no registration required.</p>
        <div class="social-links">
          <a href="#" aria-label="Discord" class="social-link">
            <i class="fab fa-discord"></i>
          </a>
          <a href="#" aria-label="YouTube" class="social-link">
            <i class="fab fa-youtube"></i>
          </a>
        </div>
      </div>
    </div>
    
    <div class="copyright">
      &copy; {{ currentYear }} FS25 Mods Hub. All rights reserved. 
      <span class="legal-links">
        <RouterLink to="/privacy" @click="handleFooterLinkClick">Privacy Policy</RouterLink> | 
        <RouterLink to="/terms" @click="handleFooterLinkClick">Terms of Service</RouterLink> | 
        <RouterLink to="/contact" @click="handleFooterLinkClick">Contact Us</RouterLink>
      </span>
      <p class="disclaimer">
        Farming Simulator is a registered trademark of GIANTS Software. 
        This website is not affiliated with GIANTS Software.
      </p>
      <div class="permission-notice">
        <p><strong>Modification & Redistribution:</strong> All content requires explicit written permission. Contact jagdeepsekhon101@gmail.com for authorization requests.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: var(--darker);
  color: white;
  padding: 5rem 2rem 2rem;
  position: relative;
}

.footer-container {
  display: flex;
  justify-content: center;
  max-width: 1400px;
  margin: 0 auto;
}

.footer-col {
  margin-bottom: 2rem;
  text-align: center;
  max-width: 600px;
}

.footer-col h3 {
  font-size: 1.5rem;
  margin-bottom: 1.8rem;
  position: relative;
  padding-bottom: 0.8rem;
}

.footer-col h3::after {
  content: '';
  position: absolute;
  width: 50px;
  height: 4px;
  background: var(--primary);
  bottom: 0;
  left: 0;
  border-radius: 2px;
}

.footer-col p {
  color: #bbb;
  line-height: 1.8;
  margin-bottom: 1.5rem;
}

.footer-col ul {
  list-style: none;
}

.footer-col li {
  margin-bottom: 1rem;
}

.footer-link {
  color: #bbb;
  text-decoration: none;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.footer-link:hover {
  color: var(--primary);
  padding-left: 5px;
}

.footer-link i {
  font-size: 0.8rem;
}

.social-links {
  display: flex;
  gap: 1.2rem;
  margin-top: 1.5rem;
  justify-content: center;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 45px;
  height: 45px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  color: white;
  transition: var(--transition);
  font-size: 1.2rem;
}

.social-link:hover {
  background: var(--primary);
  transform: translateY(-5px);
}

.newsletter-form {
  display: flex;
  margin-top: 1.5rem;
  border-radius: 50px;
  overflow: hidden;
}

.newsletter-form input {
  flex: 1;
  padding: 0.9rem 1.2rem;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.newsletter-form input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.newsletter-form button {
  background: var(--primary);
  color: white;
  border: none;
  padding: 0 1.5rem;
  cursor: pointer;
  transition: var(--transition);
}

.newsletter-form button:hover {
  background: var(--primary-dark);
}

.copyright {
  text-align: center;
  padding-top: 3rem;
  margin-top: 4rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: #777;
  font-size: 1rem;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
}

.legal-links {
  margin: 0 0.5rem;
}

.legal-links a {
  color: #bbb;
  transition: var(--transition);
}

.legal-links a:hover {
  color: var(--primary);
}

.disclaimer {
  margin-top: 1rem;
  font-size: 0.85rem;
  color: #666;
}

.permission-notice {
  margin-top: 1.5rem;
  padding: 1rem;
  background: rgba(39, 174, 96, 0.1);
  border-radius: 8px;
  border-left: 3px solid var(--primary);
}

.permission-notice p {
  margin: 0;
  font-size: 0.9rem;
  color: #bbb;
  line-height: 1.5;
}

.permission-notice strong {
  color: var(--primary);
}

/* Enhanced Responsive Design */
@media (max-width: 1200px) {
  .footer-container {
    padding: 0 1rem;
  }
  
  .footer-col {
    max-width: 500px;
  }
}

@media (max-width: 992px) {
  .footer {
    padding: 4rem 1.5rem 1.5rem;
  }
  
  .footer-col h3 {
    font-size: 1.3rem;
  }
  
  .footer-col {
    max-width: 450px;
  }
}

@media (max-width: 768px) {
  .footer {
    padding: 3rem 1.5rem 1.5rem;
  }
  
  .footer-col {
    margin-bottom: 0;
    text-align: center;
    max-width: 350px;
  }
  
  .footer-col h3 {
    font-size: 1.2rem;
    margin-bottom: 1.5rem;
  }
  
  .footer-col p {
    font-size: 0.95rem;
  }
  
  .social-links {
    justify-content: center;
    gap: 1rem;
  }
  
  .social-link {
    width: 40px;
    height: 40px;
    font-size: 1.1rem;
  }
  
  .copyright {
    text-align: center;
    padding-top: 2rem;
    margin-top: 2rem;
    font-size: 0.9rem;
  }
  
  .legal-links {
    display: block;
    margin-top: 0.5rem;
  }
  
  .disclaimer {
    margin-top: 1rem;
    font-size: 0.8rem;
  }
  
  .permission-notice {
    margin-top: 1rem;
    padding: 0.8rem;
  }
  
  .permission-notice p {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .footer {
    padding: 2.5rem 1rem 1rem;
  }
  
  .footer-col {
    max-width: 300px;
  }
  
  .footer-col h3 {
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }
  
  .footer-col p {
    font-size: 0.9rem;
    line-height: 1.6;
  }
  
  .social-links {
    gap: 0.8rem;
    margin-top: 1rem;
  }
  
  .social-link {
    width: 36px;
    height: 36px;
    font-size: 1rem;
  }
  
  .copyright {
    padding-top: 1.5rem;
    margin-top: 1.5rem;
    font-size: 0.85rem;
    line-height: 1.5;
  }
  
  .legal-links a {
    font-size: 0.85rem;
  }
  
  .disclaimer {
    font-size: 0.75rem;
    line-height: 1.4;
  }
  
  .permission-notice {
    margin-top: 1rem;
    padding: 0.75rem;
  }
  
  .permission-notice p {
    font-size: 0.75rem;
  }
}

@media (max-width: 360px) {
  .footer {
    padding: 2rem 0.75rem 1rem;
  }
  
  .footer-col {
    max-width: 280px;
  }
  
  .footer-col h3 {
    font-size: 1rem;
  }
  
  .footer-col p {
    font-size: 0.85rem;
  }
}
</style>