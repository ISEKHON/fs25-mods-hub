<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isLoading = ref(false)
const isEditing = ref(false)
const activeTab = ref('profile')
const showAvatarUpload = ref(false)

const userProfile = ref({
  id: '',
  username: '',
  displayName: '',
  bio: '',
  avatar: '',
  location: '',
  website: '',
  socialLinks: {
    discord: '',
    youtube: '',
    twitch: '',
    twitter: ''
  },
  preferences: {
    email_notifications: true,
    mod_updates: true,
    review_notifications: true,
    newsletter: false
  },
  stats: {
    mods_uploaded: 0,
    reviews_written: 0,
    downloads_received: 0,
    rating_average: 0
  },
  verification: {
    emailVerified: false,
    developerVerified: false
  },
  joinedAt: '',
  lastSeen: ''
})

const editForm = reactive({
  display_name: '',
  bio: '',
  location: '',
  website: '',
  social_links: {
    discord: '',
    youtube: '',
    twitch: '',
    twitter: ''
  }
})

const debugAuth = () => {
  console.log('Auth Store State:', {
    isAuthenticated: authStore.isAuthenticated,
    user: authStore.user,
    userName: authStore.userName,
    token: !!authStore.token
  })
  console.log('Route params:', route.params)
  console.log('Local storage:', {
    token: !!localStorage.getItem('token'),
    user: localStorage.getItem('user')
  })
}

const isOwnProfile = computed(() => {
  return authStore.isAuthenticated && 
         (authStore.user?.username === route.params.username || 
          authStore.user?.id === route.params.username)
})

const formattedJoinDate = computed(() => {
  if (userProfile.value.joinedAt) {
    return new Date(userProfile.value.joinedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  return ''
})

const formattedLastSeen = computed(() => {
  if (userProfile.value.lastSeen) {
    const lastSeen = new Date(userProfile.value.lastSeen)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Online now'
    if (diffInHours < 24) return `${diffInHours} hours ago`
    if (diffInHours < 48) return 'Yesterday'
    return lastSeen.toLocaleDateString()
  }
  return 'Never'
})

const loadUserProfile = async () => {
  isLoading.value = true
  try {
    const username = route.params.username as string
    const response = await fetch(`http://localhost:3001/api/users/${username}`)
    const data = await response.json()

    if (data.success) {
      userProfile.value = data.data
      
      // Populate edit form if it's own profile
      if (isOwnProfile.value) {
        editForm.display_name = data.data.displayName
        editForm.bio = data.data.bio
        editForm.location = data.data.location
        editForm.website = data.data.website
        editForm.social_links = { ...data.data.socialLinks }
      }
    } else {
      router.push('/404')
    }
  } catch (error) {
    console.error('Error loading profile:', error)
    router.push('/404')
  } finally {
    isLoading.value = false
  }
}

const startEditing = () => {
  isEditing.value = true
}

const cancelEditing = () => {
  isEditing.value = false
  // Reset form
  editForm.display_name = userProfile.value.displayName
  editForm.bio = userProfile.value.bio
  editForm.location = userProfile.value.location
  editForm.website = userProfile.value.website
  editForm.social_links = { ...userProfile.value.socialLinks }
}

const saveProfile = async () => {
  if (!authStore.isAuthenticated) return

  isLoading.value = true
  try {
    const response = await fetch('http://localhost:3001/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authStore.getAuthHeaders()
      },
      body: JSON.stringify(editForm)
    })

    const data = await response.json()

    if (data.success) {
      // Update local profile data
      userProfile.value.displayName = data.data.displayName
      userProfile.value.bio = data.data.bio
      userProfile.value.location = data.data.location
      userProfile.value.website = data.data.website
      userProfile.value.socialLinks = data.data.socialLinks
      
      isEditing.value = false
    } else {
      alert('Failed to update profile: ' + data.message)
    }
  } catch (error) {
    console.error('Error updating profile:', error)
    alert('Failed to update profile')
  } finally {
    isLoading.value = false
  }
}

const uploadAvatar = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file || !authStore.isAuthenticated) return

  const formData = new FormData()
  formData.append('avatar', file)

  isLoading.value = true
  try {
    const response = await fetch('http://localhost:3001/api/users/avatar', {
      method: 'POST',
      headers: authStore.getAuthHeaders(),
      body: formData
    })

    const data = await response.json()

    if (data.success) {
      userProfile.value.avatar = data.data.avatarUrl
      showAvatarUpload.value = false
    } else {
      alert('Failed to upload avatar: ' + data.message)
    }
  } catch (error) {
    console.error('Error uploading avatar:', error)
    alert('Failed to upload avatar')
  } finally {
    isLoading.value = false
  }
}

const updatePreferences = async () => {
  if (!authStore.isAuthenticated) return

  try {
    const response = await fetch('http://localhost:3001/api/users/preferences', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authStore.getAuthHeaders()
      },
      body: JSON.stringify({ preferences: userProfile.value.preferences })
    })

    const data = await response.json()

    if (data.success) {
      alert('Preferences updated successfully!')
    } else {
      alert('Failed to update preferences: ' + data.message)
    }
  } catch (error) {
    console.error('Error updating preferences:', error)
    alert('Failed to update preferences')
  }
}

onMounted(() => {
  debugAuth()
  loadUserProfile()
})
</script>

<template>
  <div class="profile-page">
    <div class="profile-container">
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Loading profile...</p>
      </div>

      <!-- Profile Content -->
      <div v-else class="profile-content">
        <!-- Profile Header -->
        <div class="profile-header">
          <div class="profile-avatar-section">
            <div class="avatar-container">
              <img 
                :src="userProfile.avatar || '/default-avatar.png'" 
                :alt="userProfile.displayName"
                class="profile-avatar"
              >
              <button 
                v-if="isOwnProfile" 
                @click="showAvatarUpload = true"
                class="avatar-edit-btn"
                title="Change Avatar"
              >
                <i class="fas fa-camera"></i>
              </button>
            </div>

            <!-- Avatar Upload Modal -->
            <div v-if="showAvatarUpload" class="modal-overlay" @click="showAvatarUpload = false">
              <div class="modal-content" @click.stop>
                <h3>Upload New Avatar</h3>
                <input 
                  type="file" 
                  accept="image/*" 
                  @change="uploadAvatar"
                  class="file-input"
                >
                <div class="modal-actions">
                  <button @click="showAvatarUpload = false" class="btn btn-secondary">Cancel</button>
                </div>
              </div>
            </div>
          </div>

          <div class="profile-info">
            <div class="profile-name-section">
              <h1 class="profile-name">{{ userProfile.displayName || userProfile.username }}</h1>
              <span class="profile-username">@{{ userProfile.username }}</span>
              
              <div class="profile-badges">
                <span v-if="userProfile.verification.emailVerified" class="badge verified">
                  <i class="fas fa-check-circle"></i> Verified
                </span>
                <span v-if="userProfile.verification.developerVerified" class="badge developer">
                  <i class="fas fa-code"></i> Developer
                </span>
              </div>
            </div>

            <div class="profile-stats">
              <div class="stat-item">
                <span class="stat-number">{{ userProfile.stats.mods_uploaded }}</span>
                <span class="stat-label">Mods</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ userProfile.stats.reviews_written }}</span>
                <span class="stat-label">Reviews</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ userProfile.stats.downloads_received?.toLocaleString() || '0' }}</span>
                <span class="stat-label">Downloads</span>
              </div>
              <div class="stat-item" v-if="userProfile.stats.rating_average > 0">
                <span class="stat-number">{{ userProfile.stats.rating_average?.toFixed(1) || '0.0' }}</span>
                <span class="stat-label">Rating</span>
              </div>
            </div>

            <div class="profile-meta">
              <p class="join-date">
                <i class="fas fa-calendar-alt"></i>
                Joined {{ formattedJoinDate }}
              </p>
              <p class="last-seen">
                <i class="fas fa-clock"></i>
                Last seen {{ formattedLastSeen }}
              </p>
            </div>
          </div>

          <div class="profile-actions" v-if="isOwnProfile">
            <button v-if="!isEditing" @click="startEditing" class="btn btn-primary">
              <i class="fas fa-edit"></i> Edit Profile
            </button>
            <div v-else class="edit-actions">
              <button @click="saveProfile" class="btn btn-primary" :disabled="isLoading">
                <i class="fas fa-save"></i> Save
              </button>
              <button @click="cancelEditing" class="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>

        <!-- Profile Tabs -->
        <div class="profile-tabs">
          <button 
            @click="activeTab = 'profile'" 
            :class="{ active: activeTab === 'profile' }"
            class="tab-btn"
          >
            <i class="fas fa-user"></i> Profile
          </button>
          <button 
            @click="activeTab = 'mods'" 
            :class="{ active: activeTab === 'mods' }"
            class="tab-btn"
          >
            <i class="fas fa-cube"></i> Mods ({{ userProfile.stats.mods_uploaded }})
          </button>
          <button 
            @click="activeTab = 'reviews'" 
            :class="{ active: activeTab === 'reviews' }"
            class="tab-btn"
          >
            <i class="fas fa-star"></i> Reviews ({{ userProfile.stats.reviews_written }})
          </button>
          <button 
            v-if="isOwnProfile"
            @click="activeTab = 'settings'" 
            :class="{ active: activeTab === 'settings' }"
            class="tab-btn"
          >
            <i class="fas fa-cog"></i> Settings
          </button>
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
          <!-- Profile Tab -->
          <div v-if="activeTab === 'profile'" class="profile-tab">
            <div class="profile-details">
              <!-- Bio Section -->
              <div class="detail-section">
                <h3>About</h3>
                <div v-if="!isEditing" class="detail-content">
                  <p v-if="userProfile.bio" class="bio">{{ userProfile.bio }}</p>
                  <p v-else class="no-bio">No bio available.</p>
                </div>
                <div v-else class="edit-content">
                  <textarea 
                    v-model="editForm.bio" 
                    placeholder="Tell us about yourself..."
                    rows="4"
                    maxlength="500"
                    class="form-textarea"
                  ></textarea>
                  <span class="char-count">{{ editForm.bio.length }}/500</span>
                </div>
              </div>

              <!-- Location & Website -->
              <div class="detail-section">
                <h3>Details</h3>
                <div v-if="!isEditing" class="detail-content">
                  <div v-if="userProfile.location" class="detail-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>{{ userProfile.location }}</span>
                  </div>
                  <div v-if="userProfile.website" class="detail-item">
                    <i class="fas fa-globe"></i>
                    <a :href="userProfile.website" target="_blank" rel="noopener">{{ userProfile.website }}</a>
                  </div>
                </div>
                <div v-else class="edit-content">
                  <div class="form-group">
                    <label>Display Name</label>
                    <input 
                      v-model="editForm.display_name" 
                      type="text" 
                      placeholder="Your display name"
                      class="form-input"
                    >
                  </div>
                  <div class="form-group">
                    <label>Location</label>
                    <input 
                      v-model="editForm.location" 
                      type="text" 
                      placeholder="Your location"
                      class="form-input"
                    >
                  </div>
                  <div class="form-group">
                    <label>Website</label>
                    <input 
                      v-model="editForm.website" 
                      type="url" 
                      placeholder="https://your-website.com"
                      class="form-input"
                    >
                  </div>
                </div>
              </div>

              <!-- Social Links -->
              <div class="detail-section">
                <h3>Social Links</h3>
                <div v-if="!isEditing" class="detail-content">
                  <div class="social-links">
                    <a v-if="userProfile.socialLinks.discord" :href="'https://discord.com/users/' + userProfile.socialLinks.discord" target="_blank" class="social-link discord">
                      <i class="fab fa-discord"></i> Discord
                    </a>
                    <a v-if="userProfile.socialLinks.youtube" :href="userProfile.socialLinks.youtube" target="_blank" class="social-link youtube">
                      <i class="fab fa-youtube"></i> YouTube
                    </a>
                    <a v-if="userProfile.socialLinks.twitch" :href="userProfile.socialLinks.twitch" target="_blank" class="social-link twitch">
                      <i class="fab fa-twitch"></i> Twitch
                    </a>
                    <a v-if="userProfile.socialLinks.twitter" :href="'https://twitter.com/' + userProfile.socialLinks.twitter" target="_blank" class="social-link twitter">
                      <i class="fab fa-twitter"></i> Twitter
                    </a>
                  </div>
                  <p v-if="!userProfile.socialLinks.discord && !userProfile.socialLinks.youtube && !userProfile.socialLinks.twitch && !userProfile.socialLinks.twitter" class="no-social">
                    No social links added.
                  </p>
                </div>
                <div v-else class="edit-content">
                  <div class="form-group">
                    <label>Discord Username</label>
                    <input 
                      v-model="editForm.social_links.discord" 
                      type="text" 
                      placeholder="username#1234"
                      class="form-input"
                    >
                  </div>
                  <div class="form-group">
                    <label>YouTube Channel</label>
                    <input 
                      v-model="editForm.social_links.youtube" 
                      type="url" 
                      placeholder="https://youtube.com/channel/..."
                      class="form-input"
                    >
                  </div>
                  <div class="form-group">
                    <label>Twitch Channel</label>
                    <input 
                      v-model="editForm.social_links.twitch" 
                      type="url" 
                      placeholder="https://twitch.tv/username"
                      class="form-input"
                    >
                  </div>
                  <div class="form-group">
                    <label>Twitter Handle</label>
                    <input 
                      v-model="editForm.social_links.twitter" 
                      type="text" 
                      placeholder="@username"
                      class="form-input"
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Mods Tab -->
          <div v-if="activeTab === 'mods'" class="mods-tab">
            <div class="coming-soon">
              <i class="fas fa-cube"></i>
              <h3>Mods Coming Soon</h3>
              <p>User's uploaded mods will be displayed here.</p>
            </div>
          </div>

          <!-- Reviews Tab -->
          <div v-if="activeTab === 'reviews'" class="reviews-tab">
            <div class="coming-soon">
              <i class="fas fa-star"></i>
              <h3>Reviews Coming Soon</h3>
              <p>User's reviews will be displayed here.</p>
            </div>
          </div>

          <!-- Settings Tab -->
          <div v-if="activeTab === 'settings' && isOwnProfile" class="settings-tab">
            <div class="settings-section">
              <h3>Notification Preferences</h3>
              <div class="preference-item">
                <input 
                  v-model="userProfile.preferences.email_notifications" 
                  type="checkbox" 
                  id="email-notifications"
                  @change="updatePreferences"
                >
                <label for="email-notifications">Email notifications</label>
              </div>
              <div class="preference-item">
                <input 
                  v-model="userProfile.preferences.mod_updates" 
                  type="checkbox" 
                  id="mod-updates"
                  @change="updatePreferences"
                >
                <label for="mod-updates">Mod update notifications</label>
              </div>
              <div class="preference-item">
                <input 
                  v-model="userProfile.preferences.review_notifications" 
                  type="checkbox" 
                  id="review-notifications"
                  @change="updatePreferences"
                >
                <label for="review-notifications">Review notifications</label>
              </div>
              <div class="preference-item">
                <input 
                  v-model="userProfile.preferences.newsletter" 
                  type="checkbox" 
                  id="newsletter"
                  @change="updatePreferences"
                >
                <label for="newsletter">Newsletter subscription</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Follow the website's design system */
.profile-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
  color: var(--text);
}

.profile-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.loading-spinner {
  text-align: center;
  padding: 6rem 2rem;
  background: var(--card-bg);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  margin: 2rem 0;
}

.loading-spinner i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--primary);
}

.loading-spinner p {
  color: var(--text-light);
  font-size: 1.1rem;
}

.profile-content {
  background: var(--card-bg);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
  margin: 2rem 0;
}

.profile-header {
  background: linear-gradient(135deg, var(--dark) 0%, var(--darker) 100%);
  color: white;
  padding: 4rem 3rem;
  position: relative;
}

.profile-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(to right, var(--primary), var(--accent));
}

.profile-header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 3rem;
  align-items: start;
}

.profile-avatar-section {
  position: relative;
}

.avatar-container {
  position: relative;
  display: inline-block;
}

.profile-avatar {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  border: 4px solid rgba(255, 255, 255, 0.2);
  object-fit: cover;
  transition: var(--transition);
}

.avatar-edit-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  background: var(--primary);
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  color: white;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.avatar-edit-btn:hover {
  background: var(--primary-dark);
  transform: scale(1.1);
}

.profile-name {
  font-size: 2.8rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  font-family: 'Poppins', sans-serif;
}

.profile-username {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
  display: block;
}

.profile-badges {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.badge {
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: var(--transition);
}

.badge.verified {
  background: var(--primary);
}

.badge.developer {
  background: var(--secondary);
}

.profile-stats {
  display: flex;
  gap: 3rem;
  margin-bottom: 2rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: var(--accent);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.profile-meta p {
  margin: 0.75rem 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  display: flex;
  align-items: center;
}

.profile-meta i {
  margin-right: 0.75rem;
  width: 18px;
  color: var(--accent);
}

.profile-actions {
  align-self: start;
}

.edit-actions {
  display: flex;
  gap: 0.75rem;
}

.profile-tabs {
  display: flex;
  background: var(--light);
  border-bottom: var(--border);
  overflow-x: auto;
}

.tab-btn {
  padding: 1.25rem 2rem;
  border: none;
  background: none;
  cursor: pointer;
  transition: var(--transition);
  border-bottom: 3px solid transparent;
  font-weight: 500;
  color: var(--text);
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tab-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: var(--primary);
}

.tab-btn.active {
  background: var(--card-bg);
  border-bottom-color: var(--primary);
  color: var(--primary);
}

.tab-content {
  padding: 3rem;
  min-height: 400px;
}

.detail-section {
  margin-bottom: 3rem;
  padding: 2rem;
  background: var(--light);
  border-radius: var(--radius);
  border: var(--border);
}

.detail-section h3 {
  color: var(--dark);
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  font-family: 'Poppins', sans-serif;
  position: relative;
  padding-bottom: 0.75rem;
}

.detail-section h3::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 3px;
  background: linear-gradient(to right, var(--primary), var(--accent));
  border-radius: 3px;
}

.detail-item {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--card-bg);
  border-radius: 8px;
  border: var(--border);
}

.detail-item i {
  color: var(--primary);
  width: 18px;
  font-size: 1.1rem;
}

.social-links {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.social-link {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius);
  text-decoration: none;
  color: white;
  font-weight: 600;
  transition: var(--transition);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.social-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.social-link.discord { background: #5865f2; }
.social-link.youtube { background: #ff0000; }
.social-link.twitch { background: #9146ff; }
.social-link.twitter { background: #1da1f2; }

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 600;
  color: var(--dark);
  font-size: 1rem;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 1rem;
  border: 2px solid var(--gray);
  border-radius: var(--radius);
  font-size: 1rem;
  transition: var(--transition);
  background: var(--card-bg);
  color: var(--text);
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.1);
}

.char-count {
  display: block;
  text-align: right;
  font-size: 0.875rem;
  color: var(--text-light);
  margin-top: 0.5rem;
}

.coming-soon {
  text-align: center;
  padding: 6rem 2rem;
  color: var(--text-light);
}

.coming-soon i {
  font-size: 4rem;
  margin-bottom: 2rem;
  color: var(--gray);
}

.coming-soon h3 {
  font-size: 1.8rem;
  margin-bottom: 1rem;
  color: var(--dark);
}

.settings-section {
  max-width: 700px;
}

.preference-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1.5rem;
  border: var(--border);
  border-radius: var(--radius);
  background: var(--card-bg);
  transition: var(--transition);
}

.preference-item:hover {
  box-shadow: var(--shadow);
}

.preference-item input[type="checkbox"] {
  width: 20px;
  height: 20px;
  accent-color: var(--primary);
}

.preference-item label {
  font-weight: 500;
  color: var(--text);
  cursor: pointer;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: var(--card-bg);
  padding: 2.5rem;
  border-radius: var(--radius);
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-content h3 {
  margin-bottom: 1.5rem;
  color: var(--dark);
  font-family: 'Poppins', sans-serif;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  font-weight: 600;
  transition: var(--transition);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1rem;
  min-height: 48px;
}

.btn-primary {
  background: var(--primary);
  color: white;
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(39, 174, 96, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: var(--gray);
  color: var(--dark);
  border: 2px solid var(--gray);
}

.btn-secondary:hover {
  background: transparent;
  border-color: var(--primary);
  color: var(--primary);
}

.no-bio, .no-social {
  color: var(--text-light);
  font-style: italic;
  padding: 1rem;
  text-align: center;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .profile-header {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 2rem;
    padding: 3rem 2rem;
  }

  .profile-stats {
    justify-content: center;
    gap: 2rem;
  }

  .tab-content {
    padding: 2rem;
  }
}

@media (max-width: 768px) {
  .profile-container {
    padding: 1rem;
  }

  .profile-header {
    padding: 2rem 1.5rem;
  }

  .profile-name {
    font-size: 2.2rem;
  }

  .profile-stats {
    gap: 1.5rem;
  }

  .stat-number {
    font-size: 1.6rem;
  }

  .profile-tabs {
    flex-wrap: wrap;
  }

  .tab-btn {
    flex: 1;
    min-width: 0;
    padding: 1rem;
  }

  .tab-content {
    padding: 1.5rem;
  }

  .detail-section {
    padding: 1.5rem;
    margin-bottom: 2rem;
  }

  .social-links {
    justify-content: center;
  }

  .edit-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .profile-header {
    padding: 1.5rem 1rem;
  }

  .profile-avatar {
    width: 100px;
    height: 100px;
  }

  .profile-name {
    font-size: 1.8rem;
  }

  .profile-stats {
    flex-direction: column;
    gap: 1rem;
  }

  .tab-btn {
    font-size: 0.9rem;
    padding: 0.75rem 0.5rem;
  }

  .modal-content {
    padding: 1.5rem;
    margin: 1rem;
  }
}
</style>
