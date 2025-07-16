<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Mock user data - this would come from your auth store
const user = reactive({
  id: '1',
  username: 'ModCreator2024',
  email: 'user@example.com',
  avatar: 'https://via.placeholder.com/150x150/27ae60/ffffff?text=MC',
  bio: 'Passionate farming simulator mod creator with 5+ years of experience.',
  joinedDate: '2024-01-15',
  isVerified: true,
  role: 'user',
  stats: {
    modsUploaded: 12,
    totalDownloads: 45680,
    totalRatings: 234,
    averageRating: 4.7
  }
})

const activeTab = ref('overview')
const isEditingProfile = ref(false)

const editForm = reactive({
  username: user.username,
  bio: user.bio,
  email: user.email
})

const tabs = [
  { id: 'overview', label: 'Overview', icon: 'fas fa-chart-line' },
  { id: 'mods', label: 'My Mods', icon: 'fas fa-puzzle-piece' },
  { id: 'downloads', label: 'Downloads', icon: 'fas fa-download' },
  { id: 'reviews', label: 'Reviews', icon: 'fas fa-star' },
  { id: 'settings', label: 'Settings', icon: 'fas fa-cog' }
]

const userMods = ref([
  {
    id: '1',
    title: 'Advanced Harvester Pack',
    status: 'published',
    downloads: 15234,
    rating: 4.8,
    lastUpdated: '2024-07-10'
  },
  {
    id: '2',
    title: 'Realistic Weather System',
    status: 'pending',
    downloads: 0,
    rating: 0,
    lastUpdated: '2024-07-14'
  },
  {
    id: '3',
    title: 'Farm Equipment Expansion',
    status: 'published',
    downloads: 30446,
    rating: 4.6,
    lastUpdated: '2024-06-28'
  }
])

const changeTab = (tabId: string) => {
  activeTab.value = tabId
}

const startEditing = () => {
  isEditingProfile.value = true
  editForm.username = user.username
  editForm.bio = user.bio
  editForm.email = user.email
}

const saveProfile = () => {
  // TODO: Save to API
  user.username = editForm.username
  user.bio = editForm.bio
  user.email = editForm.email
  isEditingProfile.value = false
}

const cancelEditing = () => {
  isEditingProfile.value = false
}

const logout = () => {
  // TODO: Clear auth state
  router.push('/login')
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'published': return '#27ae60'
    case 'pending': return '#f39c12'
    case 'rejected': return '#e74c3c'
    default: return '#95a5a6'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<template>
  <div class="dashboard">
    <div class="dashboard-container">
      <!-- Profile Header -->
      <div class="profile-header">
        <div class="profile-info">
          <div class="avatar-section">
            <img :src="user.avatar" :alt="user.username" class="profile-avatar">
            <div v-if="user.isVerified" class="verified-badge">
              <i class="fas fa-check-circle"></i>
            </div>
          </div>
          
          <div class="user-details">
            <h1 class="username">
              {{ user.username }}
              <span class="role-badge" :class="user.role">{{ user.role }}</span>
            </h1>
            <p class="user-bio">{{ user.bio }}</p>
            <div class="user-meta">
              <span class="joined-date">
                <i class="fas fa-calendar-alt"></i>
                Joined {{ formatDate(user.joinedDate) }}
              </span>
            </div>
          </div>
        </div>

        <div class="profile-actions">
          <button @click="startEditing" class="btn btn-outline">
            <i class="fas fa-edit"></i>
            Edit Profile
          </button>
          <button @click="logout" class="btn btn-danger">
            <i class="fas fa-sign-out-alt"></i>
            Logout
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-upload"></i>
          </div>
          <div class="stat-content">
            <h3>{{ user.stats.modsUploaded }}</h3>
            <p>Mods Uploaded</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-download"></i>
          </div>
          <div class="stat-content">
            <h3>{{ user.stats.totalDownloads.toLocaleString() }}</h3>
            <p>Total Downloads</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-star"></i>
          </div>
          <div class="stat-content">
            <h3>{{ user.stats.averageRating }}</h3>
            <p>Average Rating</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-comments"></i>
          </div>
          <div class="stat-content">
            <h3>{{ user.stats.totalRatings }}</h3>
            <p>Total Reviews</p>
          </div>
        </div>
      </div>

      <!-- Dashboard Tabs -->
      <div class="dashboard-content">
        <div class="tab-navigation">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="changeTab(tab.id)"
            class="tab-btn"
            :class="{ active: activeTab === tab.id }"
          >
            <i :class="tab.icon"></i>
            {{ tab.label }}
          </button>
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
          <!-- Overview Tab -->
          <div v-if="activeTab === 'overview'" class="tab-panel">
            <div class="overview-grid">
              <div class="recent-activity">
                <h3>Recent Activity</h3>
                <div class="activity-list">
                  <div class="activity-item">
                    <i class="fas fa-upload activity-icon"></i>
                    <div class="activity-content">
                      <p><strong>Uploaded new mod:</strong> Realistic Weather System</p>
                      <span class="activity-time">2 days ago</span>
                    </div>
                  </div>
                  
                  <div class="activity-item">
                    <i class="fas fa-star activity-icon"></i>
                    <div class="activity-content">
                      <p><strong>Received 5-star rating</strong> on Advanced Harvester Pack</p>
                      <span class="activity-time">5 days ago</span>
                    </div>
                  </div>
                  
                  <div class="activity-item">
                    <i class="fas fa-download activity-icon"></i>
                    <div class="activity-content">
                      <p><strong>1,000+ downloads milestone</strong> reached on Farm Equipment Expansion</p>
                      <span class="activity-time">1 week ago</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="quick-actions">
                <h3>Quick Actions</h3>
                <div class="action-buttons">
                  <RouterLink to="/upload" class="action-btn">
                    <i class="fas fa-plus"></i>
                    Upload New Mod
                  </RouterLink>
                  
                  <button @click="changeTab('mods')" class="action-btn">
                    <i class="fas fa-edit"></i>
                    Manage Mods
                  </button>
                  
                  <button @click="changeTab('settings')" class="action-btn">
                    <i class="fas fa-cog"></i>
                    Account Settings
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- My Mods Tab -->
          <div v-if="activeTab === 'mods'" class="tab-panel">
            <div class="mods-header">
              <h3>My Mods ({{ userMods.length }})</h3>
              <RouterLink to="/upload" class="btn btn-primary">
                <i class="fas fa-plus"></i>
                Upload New Mod
              </RouterLink>
            </div>
            
            <div class="mods-list">
              <div v-for="mod in userMods" :key="mod.id" class="mod-item">
                <div class="mod-info">
                  <h4>{{ mod.title }}</h4>
                  <div class="mod-meta">
                    <span class="mod-status" :style="{ color: getStatusColor(mod.status) }">
                      <i class="fas fa-circle"></i>
                      {{ mod.status.charAt(0).toUpperCase() + mod.status.slice(1) }}
                    </span>
                    <span class="mod-updated">Updated {{ formatDate(mod.lastUpdated) }}</span>
                  </div>
                </div>
                
                <div class="mod-stats">
                  <div class="stat">
                    <i class="fas fa-download"></i>
                    {{ mod.downloads.toLocaleString() }}
                  </div>
                  <div class="stat">
                    <i class="fas fa-star"></i>
                    {{ mod.rating || 'N/A' }}
                  </div>
                </div>
                
                <div class="mod-actions">
                  <button class="btn-icon">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn-icon">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button class="btn-icon danger">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Other tabs content -->
          <div v-if="activeTab === 'downloads'" class="tab-panel">
            <h3>Download History</h3>
            <p class="empty-state">Your download history will appear here.</p>
          </div>

          <div v-if="activeTab === 'reviews'" class="tab-panel">
            <h3>Reviews & Ratings</h3>
            <p class="empty-state">Reviews for your mods will appear here.</p>
          </div>

          <div v-if="activeTab === 'settings'" class="tab-panel">
            <h3>Account Settings</h3>
            
            <!-- Edit Profile Form -->
            <div v-if="isEditingProfile" class="edit-form">
              <div class="form-group">
                <label>Username</label>
                <input v-model="editForm.username" type="text" class="form-control">
              </div>
              
              <div class="form-group">
                <label>Email</label>
                <input v-model="editForm.email" type="email" class="form-control">
              </div>
              
              <div class="form-group">
                <label>Bio</label>
                <textarea v-model="editForm.bio" class="form-control" rows="4"></textarea>
              </div>
              
              <div class="form-actions">
                <button @click="saveProfile" class="btn btn-primary">Save Changes</button>
                <button @click="cancelEditing" class="btn btn-outline">Cancel</button>
              </div>
            </div>
            
            <!-- Profile Display -->
            <div v-else class="profile-display">
              <div class="setting-item">
                <label>Username</label>
                <p>{{ user.username }}</p>
              </div>
              
              <div class="setting-item">
                <label>Email</label>
                <p>{{ user.email }}</p>
              </div>
              
              <div class="setting-item">
                <label>Bio</label>
                <p>{{ user.bio }}</p>
              </div>
              
              <button @click="startEditing" class="btn btn-primary">Edit Profile</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Profile Modal (optional overlay) -->
    <div v-if="isEditingProfile" class="modal-overlay" @click="cancelEditing">
      <div class="modal-content" @click.stop>
        <!-- Modal content would go here if you prefer modal editing -->
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: var(--light);
  padding: 2rem 0;
}

.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Profile Header */
.profile-header {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 2rem;
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex: 1;
}

.avatar-section {
  position: relative;
}

.profile-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid var(--primary);
}

.verified-badge {
  position: absolute;
  bottom: 5px;
  right: 5px;
  background: var(--primary);
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
}

.user-details {
  flex: 1;
}

.username {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  color: var(--darker);
}

.role-badge {
  background: var(--primary);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: capitalize;
}

.role-badge.admin {
  background: #e74c3c;
}

.role-badge.moderator {
  background: #f39c12;
}

.user-bio {
  color: var(--text);
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  line-height: 1.6;
}

.user-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--text-light);
  font-size: 0.9rem;
}

.joined-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.profile-actions {
  display: flex;
  gap: 1rem;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--shadow);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: white;
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-content h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.8rem;
  color: var(--darker);
  font-weight: 700;
}

.stat-content p {
  margin: 0;
  color: var(--text-light);
  font-size: 0.9rem;
}

/* Dashboard Content */
.dashboard-content {
  background: white;
  border-radius: 16px;
  box-shadow: var(--shadow);
  overflow: hidden;
}

.tab-navigation {
  display: flex;
  border-bottom: 1px solid var(--gray);
  background: var(--light);
  overflow-x: auto;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  color: var(--text-light);
  cursor: pointer;
  transition: var(--transition);
  white-space: nowrap;
  font-weight: 500;
  border-bottom: 3px solid transparent;
}

.tab-btn:hover {
  background: rgba(39, 174, 96, 0.1);
  color: var(--primary);
}

.tab-btn.active {
  background: white;
  color: var(--primary);
  border-bottom-color: var(--primary);
}

.tab-content {
  padding: 2rem;
}

/* Overview Tab */
.overview-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.recent-activity h3,
.quick-actions h3 {
  margin: 0 0 1.5rem 0;
  color: var(--darker);
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: var(--light);
  border-radius: 8px;
}

.activity-icon {
  color: var(--primary);
  margin-top: 0.25rem;
  font-size: 1.1rem;
}

.activity-content p {
  margin: 0 0 0.25rem 0;
  color: var(--text);
}

.activity-time {
  font-size: 0.8rem;
  color: var(--text-light);
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--light);
  border: 2px solid transparent;
  border-radius: 8px;
  color: var(--text);
  text-decoration: none;
  transition: var(--transition);
  font-weight: 500;
}

.action-btn:hover {
  background: rgba(39, 174, 96, 0.1);
  border-color: var(--primary);
  color: var(--primary);
}

/* Mods Tab */
.mods-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.mods-header h3 {
  margin: 0;
  color: var(--darker);
}

.mods-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.mod-item {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 2rem;
  align-items: center;
  padding: 1.5rem;
  background: var(--light);
  border-radius: 12px;
  border: 2px solid transparent;
  transition: var(--transition);
}

.mod-item:hover {
  border-color: var(--primary);
  background: rgba(39, 174, 96, 0.05);
}

.mod-info h4 {
  margin: 0 0 0.5rem 0;
  color: var(--darker);
  font-size: 1.2rem;
}

.mod-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.9rem;
}

.mod-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.mod-status i {
  font-size: 0.7rem;
}

.mod-updated {
  color: var(--text-light);
}

.mod-stats {
  display: flex;
  gap: 1rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-light);
  font-size: 0.9rem;
}

.mod-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  background: var(--gray);
  color: var(--text-light);
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon:hover {
  background: var(--primary);
  color: white;
}

.btn-icon.danger:hover {
  background: #e74c3c;
}

/* Form Styles */
.edit-form,
.profile-display {
  max-width: 600px;
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

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--gray);
  border-radius: 8px;
  font-size: 1rem;
  transition: var(--transition);
}

.form-control:focus {
  outline: none;
  border-color: var(--primary);
}

.form-actions {
  display: flex;
  gap: 1rem;
}

.setting-item {
  margin-bottom: 1.5rem;
}

.setting-item label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--text-light);
  font-size: 0.9rem;
}

.setting-item p {
  margin: 0;
  color: var(--text);
  font-size: 1.1rem;
}

.empty-state {
  text-align: center;
  color: var(--text-light);
  font-style: italic;
  padding: 3rem;
}

/* Button Styles */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: var(--transition);
  font-size: 0.9rem;
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
  color: var(--primary);
  border: 2px solid var(--primary);
}

.btn-outline:hover {
  background: var(--primary);
  color: white;
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background: #c0392b;
}

/* Responsive Design */
@media (max-width: 968px) {
  .dashboard-container {
    padding: 0 1rem;
  }
  
  .profile-header {
    flex-direction: column;
    text-align: center;
  }
  
  .profile-info {
    flex-direction: column;
    text-align: center;
  }
  
  .overview-grid {
    grid-template-columns: 1fr;
  }
  
  .mod-item {
    grid-template-columns: 1fr;
    gap: 1rem;
    text-align: center;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}

@media (max-width: 640px) {
  .dashboard {
    padding: 1rem 0;
  }
  
  .tab-content {
    padding: 1rem;
  }
  
  .profile-header {
    padding: 1.5rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>
