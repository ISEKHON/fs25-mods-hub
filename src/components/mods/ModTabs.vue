<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Mod } from '@/types'

const props = defineProps<{
  mod: Mod
}>()

const activeTab = ref('features')

const tabs = [
  { id: 'features', label: 'Features' },
  { id: 'requirements', label: 'Requirements' },
  { id: 'installation', label: 'Installation' },
  { id: 'changelog', label: 'Changelog' },
  { id: 'reviews', label: `Reviews (${props.mod.ratingCount})` }
]

const installationSteps = [
  'Download the mod package (usually a .zip file)',
  'Extract the contents if necessary',
  'Copy the mod folder to your Farming Simulator 25 mods directory',
  'Launch the game and activate the mod in the mod manager',
  'The mod should now be available in your game'
]

const changeTab = (tabId: string) => {
  activeTab.value = tabId
}

const requirements = computed(() => [
  { icon: 'laptop', title: 'Minimum Requirements', text: props.mod.requirements.min },
  { icon: 'desktop', title: 'Recommended Requirements', text: props.mod.requirements.recommended },
  { icon: 'gamepad', title: 'Supported Input', text: 'Keyboard + Mouse, Gamepad' },
  { icon: 'code-branch', title: 'Compatibility', text: 'Works with all official maps' }
])
</script>

<template>
  <div class="mod-tabs">
    <div class="mod-tab-header">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="mod-tab-link"
        :class="{ active: activeTab === tab.id }"
        @click="changeTab(tab.id)"
      >
        {{ tab.label }}
      </button>
    </div>
    
    <div class="mod-tab-content" :class="{ active: activeTab === 'features' }">
      <h3>Key Features</h3>
      <div class="mod-features">
        <div v-for="(feature, index) in mod.features" :key="index" class="mod-feature">
          <i class="fas fa-check-circle"></i>
          <span>{{ feature }}</span>
        </div>
      </div>
      
      <h3>Detailed Description</h3>
      <div class="mod-description-content" v-html="mod.description"></div>
    </div>
    
    <div class="mod-tab-content" :class="{ active: activeTab === 'requirements' }">
      <div class="mod-requirements">
        <h3>System Requirements</h3>
        <div class="requirements-grid">
          <div v-for="req in requirements" :key="req.title" class="requirement-item">
            <i class="fas" :class="`fa-${req.icon}`"></i>
            <div>
              <h4>{{ req.title }}</h4>
              <p>{{ req.text }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="mod-tab-content" :class="{ active: activeTab === 'installation' }">
      <h3>Installation Instructions</h3>
      <div class="installation-steps">
        <div v-for="(step, index) in installationSteps" :key="index" class="installation-step">
          <div class="step-number">{{ index + 1 }}</div>
          <div class="step-content">{{ step }}</div>
        </div>
      </div>
      
      <h3>Troubleshooting</h3>
      <div class="troubleshooting">
        <p>If you encounter issues, try these solutions:</p>
        <ul>
          <li>Make sure you're using the latest version of Farming Simulator 25</li>
          <li>Verify the mod is placed in the correct mods folder</li>
          <li>Check for conflicts with other mods</li>
          <li>Ensure your game meets the minimum requirements</li>
        </ul>
      </div>
    </div>
    
    <div class="mod-tab-content" :class="{ active: activeTab === 'changelog' }">
      <div class="mod-changelog">
        <h3>Version History</h3>
        <div v-for="(version, index) in mod.changelog || []" :key="index" class="changelog-item">
          <div class="changelog-version">
            <h4>Version {{ version.version }}</h4>
            <span>{{ version.date }}</span>
          </div>
          <div class="changelog-changes">
            <ul>
              <li v-for="(change, i) in version.changes" :key="i">{{ change }}</li>
            </ul>
          </div>
        </div>
        <div v-if="!mod.changelog?.length" class="no-changelog">
          No changelog available for this mod.
        </div>
      </div>
    </div>
    
    <div class="mod-tab-content" :class="{ active: activeTab === 'reviews' }">
      <div class="mod-reviews">
        <h3>User Reviews</h3>
        <div class="review-list">
          <div class="no-reviews" v-if="mod.ratingCount === 0">
            <i class="fas fa-comment-alt"></i>
            <p>No reviews yet. Be the first to review this mod!</p>
            <button class="btn">
              <i class="fas fa-pen"></i> Write a Review
            </button>
          </div>
          <div v-else>
            <!-- In a real app, you would map through actual reviews here -->
            <div class="review-item">
              <div class="review-header">
                <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="User">
                <div class="review-author">
                  <strong>ModEnthusiast123</strong>
                  <div class="review-rating">
                    <i v-for="n in 5" :key="n" class="fas fa-star"></i>
                  </div>
                </div>
                <span class="review-date">2 weeks ago</span>
              </div>
              <div class="review-content">
                <p>This is one of the best tractor mods I've used. The physics are incredibly realistic and the detail is amazing!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mod-tabs {
  margin-bottom: 3rem;
}

.mod-tab-header {
  display: flex;
  border-bottom: 1px solid var(--gray);
  margin-bottom: 2rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.mod-tab-link {
  padding: 1rem 1.5rem;
  cursor: pointer;
  font-weight: 500;
  color: var(--text-light);
  position: relative;
  transition: var(--transition);
  background: none;
  border: none;
  white-space: nowrap;
}

.mod-tab-link::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 0;
  height: 3px;
  background: var(--primary);
  transition: var(--transition);
}

.mod-tab-link.active, .mod-tab-link:hover {
  color: var(--primary);
}

.mod-tab-link.active::after {
  width: 100%;
}

.mod-tab-content {
  display: none;
  animation: fadeIn 0.5s ease;
}

.mod-tab-content.active {
  display: block;
}

.mod-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.mod-feature {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.mod-feature i {
  color: var(--primary);
  font-size: 1.2rem;
  margin-top: 0.2rem;
}

.mod-description-content {
  line-height: 1.8;
  color: var(--text);
}

.mod-requirements {
  background: white;
  border-radius: var(--radius);
  padding: 2rem;
  box-shadow: var(--shadow);
  margin-bottom: 2rem;
}

.mod-requirements h3 {
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.requirements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.requirement-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.requirement-item i {
  color: var(--secondary);
  font-size: 1.5rem;
}

.requirement-item h4 {
  margin-bottom: 0.3rem;
  font-size: 1.1rem;
}

.requirement-item p {
  color: var(--text-light);
}

.installation-steps {
  margin-bottom: 2rem;
}

.installation-step {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px dashed var(--gray);
}

.installation-step:last-child {
  border-bottom: none;
}

.step-number {
  width: 30px;
  height: 30px;
  background: var(--primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-weight: bold;
}

.step-content {
  flex: 1;
  color: var(--text);
}

.troubleshooting {
  background: rgba(231, 76, 60, 0.05);
  padding: 1.5rem;
  border-radius: var(--radius);
  margin-top: 2rem;
}

.troubleshooting p {
  margin-bottom: 1rem;
  font-weight: 500;
}

.troubleshooting ul {
  padding-left: 1.5rem;
  color: var(--text-light);
  line-height: 1.8;
}

.mod-changelog {
  background: white;
  border-radius: var(--radius);
  padding: 2rem;
  box-shadow: var(--shadow);
}

.changelog-item {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px dashed var(--gray);
}

.changelog-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.changelog-version {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.8rem;
}

.changelog-version h4 {
  color: var(--primary);
}

.changelog-version span {
  color: var(--text-light);
  font-size: 0.9rem;
}

.changelog-changes ul {
  list-style-position: inside;
  color: var(--text-light);
}

.changelog-changes li {
  margin-bottom: 0.5rem;
}

.no-changelog {
  text-align: center;
  padding: 2rem;
  color: var(--text-light);
}

.mod-reviews {
  background: white;
  border-radius: var(--radius);
  padding: 2rem;
  box-shadow: var(--shadow);
}

.no-reviews {
  text-align: center;
  padding: 2rem;
}

.no-reviews i {
  font-size: 3rem;
  color: var(--primary);
  margin-bottom: 1rem;
}

.no-reviews p {
  color: var(--text-light);
  margin-bottom: 1.5rem;
}

.review-item {
  padding: 1.5rem 0;
  border-bottom: 1px solid var(--gray);
}

.review-item:last-child {
  border-bottom: none;
}

.review-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.review-header img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.review-author {
  flex: 1;
}

.review-author strong {
  display: block;
  margin-bottom: 0.2rem;
}

.review-rating {
  color: var(--secondary);
}

.review-date {
  color: var(--text-light);
  font-size: 0.9rem;
}

.review-content {
  color: var(--text);
  line-height: 1.7;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Enhanced Responsive Design */
@media (max-width: 992px) {
  .mod-tabs {
    margin: 2rem 0;
  }
  
  .mod-tab-link {
    padding: 0.9rem 1.5rem;
    font-size: 0.95rem;
  }
  
  .mod-features {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }
  
  .requirements-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .mod-tabs {
    margin: 1.5rem 0;
  }
  
  .mod-tab-links {
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
  }
  
  .mod-tab-link {
    padding: 0.8rem 1rem;
    font-size: 0.9rem;
    flex: 1;
    min-width: calc(33.333% - 0.33rem);
    text-align: center;
  }
  
  .mod-features {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
  
  .requirements-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
  
  .mod-feature {
    gap: 0.75rem;
  }
  
  .requirement-item {
    gap: 0.75rem;
  }
  
  .installation-step {
    gap: 0.75rem;
  }
  
  .step-number {
    width: 28px;
    height: 28px;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .mod-tab-links {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .mod-tab-link {
    padding: 0.75rem 0.8rem;
    font-size: 0.85rem;
    min-width: auto;
    width: 100%;
    border-radius: 6px;
  }
  
  .mod-tab-content {
    padding: 1.5rem 0;
  }
  
  .mod-features {
    gap: 1rem;
  }
  
  .mod-feature {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
    padding: 1rem;
    background: rgba(0,0,0,0.02);
    border-radius: 8px;
  }
  
  .mod-feature i {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }
  
  .requirements-grid {
    gap: 1rem;
  }
  
  .requirement-item {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
    padding: 1rem;
    background: rgba(0,0,0,0.02);
    border-radius: 8px;
  }
  
  .requirement-item i {
    font-size: 1.8rem;
    margin-bottom: 0.5rem;
  }
  
  .installation-step {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
    padding: 1rem;
    background: rgba(0,0,0,0.02);
    border-radius: 8px;
    border-bottom: none;
    margin-bottom: 1rem;
  }
  
  .step-number {
    width: 32px;
    height: 32px;
    font-size: 1rem;
    margin: 0 auto 0.5rem;
  }
  
  .step-content {
    text-align: left;
  }
}

@media (max-width: 360px) {
  .mod-tab-link {
    padding: 0.7rem 0.6rem;
    font-size: 0.8rem;
  }
  
  .mod-tab-content {
    padding: 1.25rem 0;
  }
}
</style>