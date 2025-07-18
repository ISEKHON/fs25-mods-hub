<template>
  <div class="admin-view">
    <!-- Admin Header -->
    <div class="admin-header">
      <div class="admin-header-content">
        <div class="admin-header-info">
          <h1>Admin Dashboard</h1>
          <p>Manage your FS25 Mods Hub</p>
        </div>
        <div class="admin-header-actions">
          <button @click="loadAdminData" class="btn btn-secondary" style="margin-right: 10px;">
            <i class="fas fa-sync-alt"></i> Refresh Data
          </button>
          <span class="admin-welcome">Welcome, {{ adminInfo.username }}</span>
          <button @click="logout" class="btn btn-danger">
            <i class="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading admin data...</p>
    </div>

    <!-- Access Denied -->
    <div v-else-if="accessDenied" class="access-denied">
      <div class="access-denied-content">
        <i class="fas fa-shield-alt"></i>
        <h2>Access Denied</h2>
        <p>You don't have administrator privileges to access this page.</p>
        <router-link to="/" class="btn btn-primary">
          <i class="fas fa-home"></i> Return to Home
        </router-link>
      </div>
    </div>

    <!-- Admin Content -->
          <!-- Admin Content -->
      <div v-else class="admin-content">
      <!-- Stats Grid -->
      <div class="stats-section">
        <h2 class="section-title">Dashboard Overview</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-cubes"></i>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.total_mods || 0 }}</div>
              <div class="stat-label">Total Mods</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon pending">
              <i class="fas fa-clock"></i>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.pending_submissions || 0 }}</div>
              <div class="stat-label">Pending Submissions</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon users">
              <i class="fas fa-users"></i>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.total_users || 0 }}</div>
              <div class="stat-label">Total Users</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon categories">
              <i class="fas fa-tags"></i>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.total_categories || 0 }}</div>
              <div class="stat-label">Categories</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Admin Tabs -->
      <div class="admin-tabs-section">
        <div class="tabs-header">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="tab-button"
            :class="{ active: activeTab === tab.id }"
          >
            {{ tab.name }}
            <span v-if="tab.count" class="tab-count">{{ tab.count }}</span>
          </button>
        </div>

        <div class="tab-content">
          <!-- Pending Submissions Tab -->
          <div v-if="activeTab === 'submissions'" class="submissions-tab">
            <div class="tab-header">
              <h3>Pending Submissions</h3>
              <p>Review and approve new mod submissions</p>
            </div>
            
            <div v-if="submissions.length === 0" class="empty-state">
              <i class="fas fa-inbox"></i>
              <h4>No pending submissions</h4>
              <p>All submissions have been reviewed</p>
            </div>
            
            <div v-else class="submissions-grid">
              <div
                v-for="submission in submissions"
                :key="submission.id"
                class="submission-card"
              >
                <div class="submission-header">
                  <h4>{{ submission.title }}</h4>
                  <span class="submission-date">{{ formatDate(submission.submitted_at) }}</span>
                </div>
                
                <div class="submission-details">
                  <p class="submission-description">{{ submission.description }}</p>
                  
                  <div class="submission-meta">
                    <div class="meta-item">
                      <i class="fas fa-user"></i>
                      <span><strong>Author:</strong> {{ submission.author_name }}</span>
                    </div>
                    <div class="meta-item">
                      <i class="fas fa-tag"></i>
                      <span><strong>Version:</strong> v{{ submission.version }}</span>
                    </div>
                    <div class="meta-item">
                      <i class="fas fa-folder"></i>
                      <span><strong>Category:</strong> {{ getCategoryName(submission.category_id) }}</span>
                    </div>
                    <div class="meta-item">
                      <i class="fas fa-envelope"></i>
                      <span><strong>Contact:</strong> {{ submission.contact_email || 'Not provided' }}</span>
                    </div>
                    <div v-if="submission.contact_discord" class="meta-item">
                      <i class="fab fa-discord"></i>
                      <span><strong>Discord:</strong> {{ submission.contact_discord }}</span>
                    </div>
                    <div v-if="submission.download_url" class="meta-item">
                      <i class="fas fa-download"></i>
                      <a :href="submission.download_url" target="_blank" class="download-link">
                        View Download Link
                      </a>
                    </div>
                    <div v-if="submission.image_urls" class="meta-item">
                      <i class="fas fa-image"></i>
                      <a :href="submission.image_urls" target="_blank" class="image-link">
                        View Screenshots
                      </a>
                    </div>
                  </div>
                </div>
                
                <div class="submission-actions">
                  <button
                    @click="approveSubmission(submission.id)"
                    :disabled="processingSubmission === submission.id"
                    class="btn btn-success"
                  >
                    <i class="fas fa-check"></i> 
                    {{ processingSubmission === submission.id ? 'Processing...' : 'Approve' }}
                  </button>
                  <button
                    @click="rejectSubmission(submission.id)"
                    :disabled="processingSubmission === submission.id"
                    class="btn btn-danger"
                  >
                    <i class="fas fa-times"></i> Reject
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Users Tab -->
          <div v-if="activeTab === 'users'" class="users-tab">
            <div class="tab-header">
              <h3>User Management</h3>
              <p>Manage user accounts and permissions</p>
            </div>
            
            <div class="users-table-container">
              <table class="users-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in users" :key="user.id">
                    <td>
                      <div class="user-info">
                        <div class="user-avatar">
                          {{ user.username.charAt(0).toUpperCase() }}
                        </div>
                        <div>
                          <div class="user-name">{{ user.display_name || user.username }}</div>
                          <div class="user-username">@{{ user.username }}</div>
                        </div>
                      </div>
                    </td>
                    <td>{{ user.email }}</td>
                    <td>
                      <span class="status-badge" :class="{ active: user.is_active, verified: user.is_verified }">
                        {{ user.is_active ? 'Active' : 'Inactive' }}
                        {{ user.is_verified ? ' • Verified' : '' }}
                      </span>
                    </td>
                    <td>
                      <span class="role-badge" :class="user.role">
                        {{ user.role || 'User' }}
                      </span>
                    </td>
                    <td>{{ formatDate(user.join_date) }}</td>
                    <td>
                      <div class="user-actions">
                        <button
                          @click="toggleUserStatus(user.id, 'is_verified', !user.is_verified)"
                          class="btn btn-sm"
                          :class="user.is_verified ? 'btn-warning' : 'btn-success'"
                        >
                          {{ user.is_verified ? 'Unverify' : 'Verify' }}
                        </button>
                        <button
                          @click="toggleUserStatus(user.id, 'is_active', !user.is_active)"
                          class="btn btn-sm"
                          :class="user.is_active ? 'btn-danger' : 'btn-success'"
                        >
                          {{ user.is_active ? 'Deactivate' : 'Activate' }}
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Mods Tab -->
          <div v-if="activeTab === 'mods'" class="mods-tab">
            <div class="tab-header">
              <h3>Mod Management</h3>
              <p>Manage approved mods and their settings</p>
            </div>
            <div class="empty-state">
              <i class="fas fa-tools"></i>
              <h4>Mod management features</h4>
              <p>Advanced mod management tools coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { adminApi } from '@/services/api'

export default {
  name: 'AdminView',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const loading = ref(true)
    const accessDenied = ref(false)
    const stats = ref({})
    const submissions = ref([])
    const users = ref([])
    const adminInfo = ref({})
    const categories = ref([])
    const processingSubmission = ref(null)
    const activeTab = ref('submissions')

    const tabs = computed(() => [
      { id: 'submissions', name: 'Pending Submissions', count: stats.value.pending_submissions },
      { id: 'users', name: 'Users', count: stats.value.total_users },
      { id: 'mods', name: 'Mods', count: stats.value.total_mods }
    ])

    const loadAdminData = async () => {
      try {
        loading.value = true
        
        // Load admin stats
        const statsData = await adminApi.getStats()
        stats.value = statsData
        adminInfo.value = statsData.admin_info || {}

        // Load pending submissions
        const submissionsData = await adminApi.getPendingSubmissions(1, 10)
        submissions.value = submissionsData.submissions || []

        // Load users
        const usersData = await adminApi.getUsers(1, 20)
        users.value = usersData.users || []

        // Load categories for category name lookup
        try {
          const categoriesData = await fetch('http://localhost:3001/api/categories')
          const categoriesResponse = await categoriesData.json()
          if (categoriesResponse.success) {
            categories.value = categoriesResponse.data
          }
        } catch (error) {
          console.error('Failed to load categories:', error)
        }

        loading.value = false
      } catch (error) {
        console.error('Admin data loading error:', error)
        if (error.message.includes('Admin') || error.message.includes('privileges')) {
          accessDenied.value = true
        }
        loading.value = false
      }
    }

    const approveSubmission = async (submissionId) => {
      // Create a more sophisticated approval dialog
      const result = window.confirm('Are you sure you want to approve this mod submission?\n\nThis will:\n• Publish the mod to the public catalog\n• Send approval notification to the submitter\n• Update submission status to approved')
      
      if (!result) return
      
      const approvalMessage = prompt('Enter an approval message for the submitter (optional):\nThis message will be sent to notify them of the approval.') || 'Your mod has been approved and is now available in our catalog!'
      
      try {
        processingSubmission.value = submissionId
        await adminApi.approveSubmission(submissionId, approvalMessage)
        
        // Remove from pending submissions
        submissions.value = submissions.value.filter(s => s.id !== submissionId)
        // Update stats
        stats.value.pending_submissions--
        stats.value.total_mods++
        
        // Show success message
        alert(`✅ Submission approved successfully!\n\nApproval message sent: "${approvalMessage}"`)
        
        // Refresh data to show updated counts
        await loadAdminData()
        
      } catch (error) {
        console.error('Approval error:', error)
        alert('❌ Failed to approve submission: ' + error.message)
      } finally {
        processingSubmission.value = null
      }
    }

    const rejectSubmission = async (submissionId) => {
      // Enhanced rejection dialog
      const submission = submissions.value.find(s => s.id === submissionId)
      const result = window.confirm(`Are you sure you want to reject "${submission?.title || 'this submission'}"?\n\nThis action will:\n• Remove the submission from pending queue\n• Send rejection notification to the submitter\n• Mark submission as rejected`)
      
      if (!result) return
      
      const reason = prompt('Please enter a detailed rejection reason:\nThis will be sent to the submitter to help them improve their mod.')
      if (!reason || reason.trim().length < 10) {
        alert('Please provide a detailed rejection reason (at least 10 characters) to help the submitter understand what needs improvement.')
        return
      }

      try {
        processingSubmission.value = submissionId
        await adminApi.rejectSubmission(submissionId, reason)
        
        // Remove from pending submissions
        submissions.value = submissions.value.filter(s => s.id !== submissionId)
        // Update stats
        stats.value.pending_submissions--
        
        // Show success message
        alert(`✅ Submission rejected successfully!\n\nRejection reason sent: "${reason}"`)
        
        // Refresh data to show updated counts
        await loadAdminData()
        
      } catch (error) {
        console.error('Rejection error:', error)
        alert('❌ Failed to reject submission: ' + error.message)
      } finally {
        processingSubmission.value = null
      }
    }

    const toggleUserStatus = async (userId, field, value) => {
      try {
        const updates = { [field]: value }
        await adminApi.updateUserStatus(userId, updates)
        
        // Update local user data
        const userIndex = users.value.findIndex(u => u.id === userId)
        if (userIndex !== -1) {
          users.value[userIndex][field] = value
        }
        
        alert('User status updated successfully!')
      } catch (error) {
        console.error('Update error:', error)
        alert('Failed to update user status: ' + error.message)
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString()
    }

    const getCategoryName = (categoryId) => {
      const category = categories.value.find(cat => cat.id === categoryId)
      return category ? category.name : 'Unknown Category'
    }

    const logout = () => {
      authStore.logout()
      router.push('/')
    }

    onMounted(() => {
      loadAdminData()
    })

    return {
      loading,
      accessDenied,
      stats,
      submissions,
      users,
      adminInfo,
      categories,
      activeTab,
      processingSubmission,
      tabs,
      loadAdminData,
      approveSubmission,
      rejectSubmission,
      toggleUserStatus,
      formatDate,
      getCategoryName,
      logout
    }
  }
}
</script>

<style scoped>
.admin-view {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8f9fa 0%, #e6f0ff 100%);
}

.admin-header {
  background: white;
  box-shadow: var(--shadow);
  border-bottom: 1px solid var(--gray);
}

.admin-header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.admin-header-info h1 {
  font-size: 2.5rem;
  color: var(--dark);
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.admin-header-info p {
  color: var(--text-light);
  font-size: 1.1rem;
}

.admin-header-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.admin-welcome {
  color: var(--text-light);
  font-size: 1rem;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--gray);
  border-top: 4px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.access-denied {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem;
}

.access-denied-content {
  background: white;
  padding: 3rem;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  text-align: center;
  max-width: 500px;
  border: 2px solid #fee;
}

.access-denied-content i {
  font-size: 3rem;
  color: #dc3545;
  margin-bottom: 1.5rem;
}

.access-denied-content h2 {
  color: #dc3545;
  margin-bottom: 1rem;
}

.admin-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.stats-section {
  margin-bottom: 3rem;
}

.section-title {
  font-size: 2rem;
  color: var(--dark);
  margin-bottom: 2rem;
  text-align: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 2rem;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: var(--transition);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.15);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary);
  color: white;
  font-size: 1.5rem;
}

.stat-icon.pending {
  background: var(--secondary);
}

.stat-icon.users {
  background: var(--accent);
}

.stat-icon.categories {
  background: #9b59b6;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--dark);
  margin-bottom: 0.25rem;
}

.stat-label {
  color: var(--text-light);
  font-size: 1rem;
}

.admin-tabs-section {
  background: white;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
}

.tabs-header {
  display: flex;
  border-bottom: 1px solid var(--gray);
  background: #f8f9fa;
}

.tab-button {
  flex: 1;
  padding: 1.25rem 2rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: var(--text-light);
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.tab-button:hover {
  background: #e9ecef;
  color: var(--dark);
}

.tab-button.active {
  background: var(--primary);
  color: white;
}

.tab-count {
  background: rgba(255,255,255,0.2);
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
}

.tab-button.active .tab-count {
  background: rgba(255,255,255,0.3);
}

.tab-content {
  padding: 2rem;
}

.tab-header {
  margin-bottom: 2rem;
}

.tab-header h3 {
  font-size: 1.5rem;
  color: var(--dark);
  margin-bottom: 0.5rem;
}

.tab-header p {
  color: var(--text-light);
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-light);
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--gray);
}

.empty-state h4 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: var(--dark);
}

.submissions-grid {
  display: grid;
  gap: 1.5rem;
}

.submission-card {
  background: white;
  padding: 2rem;
  border-radius: var(--radius);
  border: var(--border);
  transition: var(--transition);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.submission-card:hover {
  border-color: var(--primary);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  transform: translateY(-2px);
}

.submission-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.submission-header h4 {
  font-size: 1.4rem;
  color: var(--dark);
  margin: 0;
  font-weight: 600;
}

.submission-date {
  color: var(--text-light);
  font-size: 0.875rem;
  background: #f8f9fa;
  padding: 0.5rem 1rem;
  border-radius: 20px;
}

.submission-details {
  margin-bottom: 2rem;
}

.submission-description {
  color: var(--text);
  margin-bottom: 1.5rem;
  line-height: 1.6;
  font-size: 1rem;
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid var(--primary);
}

.submission-meta {
  display: grid;
  gap: 0.75rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;
  padding: 0.5rem 0;
}

.meta-item i {
  color: var(--primary);
  width: 20px;
  text-align: center;
}

.meta-item strong {
  color: var(--dark);
  min-width: 80px;
}

.download-link, .image-link {
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
  border-bottom: 1px solid transparent;
  transition: var(--transition);
}

.download-link:hover, .image-link:hover {
  border-bottom-color: var(--primary);
}

.version {
  background: linear-gradient(45deg, var(--primary), #2c7a2c);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.875rem;
  font-weight: 500;
  margin-left: auto;
}

.submission-actions {
  display: flex;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
}

.users-table-container {
  overflow-x: auto;
  border-radius: var(--radius);
  border: var(--border);
}

.users-table {
  width: 100%;
  background: white;
  border-collapse: collapse;
}

.users-table th {
  background: #f8f9fa;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--dark);
  border-bottom: 1px solid var(--gray);
}

.users-table td {
  padding: 1rem;
  border-bottom: 1px solid #f1f3f4;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
}

.user-name {
  font-weight: 600;
  color: var(--dark);
}

.user-username {
  color: var(--text-light);
  font-size: 0.875rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.875rem;
  font-weight: 500;
  background: #6c757d;
  color: white;
}

.status-badge.active {
  background: var(--primary);
}

.status-badge.verified {
  background: var(--accent);
}

.role-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.875rem;
  font-weight: 500;
  background: #6c757d;
  color: white;
}

.role-badge.admin {
  background: #9b59b6;
}

.user-actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: var(--transition);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-dark);
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover {
  background: #218838;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

.btn-warning {
  background: var(--secondary);
  color: white;
}

.btn-warning:hover {
  background: #e0a800;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  position: relative;
}

.btn:disabled::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 20px;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: translateY(-50%) rotate(0deg); }
  100% { transform: translateY(-50%) rotate(360deg); }
}

@media (max-width: 768px) {
  .admin-header-content {
    padding: 1.5rem;
    flex-direction: column;
    text-align: center;
  }

  .admin-content {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .tabs-header {
    flex-direction: column;
  }

  .tab-content {
    padding: 1rem;
  }

  .submission-header {
    flex-direction: column;
    gap: 0.5rem;
  }

  .submission-actions {
    flex-direction: column;
  }

  .users-table-container {
    font-size: 0.875rem;
  }

  .user-actions {
    flex-direction: column;
  }
}
</style>
