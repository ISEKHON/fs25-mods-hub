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
                <p class="submission-description">{{ submission.description }}</p>
                <div class="submission-meta">
                  <span class="version">v{{ submission.version }}</span>
                </div>
                <div class="submission-actions">
                  <button
                    @click="approveSubmission(submission.id)"
                    :disabled="processingSubmission === submission.id"
                    class="btn btn-success"
                  >
                    <i class="fas fa-check"></i> Approve
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
    const activeTab = ref('submissions')
    const processingSubmission = ref(null)

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
      try {
        processingSubmission.value = submissionId
        await adminApi.approveSubmission(submissionId, 'Approved via admin panel')
        
        // Remove from pending submissions
        submissions.value = submissions.value.filter(s => s.id !== submissionId)
        // Update stats
        stats.value.pending_submissions--
        stats.value.total_mods++
        alert('Submission approved successfully!')
      } catch (error) {
        console.error('Approval error:', error)
        alert('Failed to approve submission: ' + error.message)
      } finally {
        processingSubmission.value = null
      }
    }

    const rejectSubmission = async (submissionId) => {
      const reason = prompt('Please enter rejection reason:')
      if (!reason) return

      try {
        processingSubmission.value = submissionId
        await adminApi.rejectSubmission(submissionId, reason)
        
        // Remove from pending submissions
        submissions.value = submissions.value.filter(s => s.id !== submissionId)
        stats.value.pending_submissions--
        alert('Submission rejected')
      } catch (error) {
        console.error('Rejection error:', error)
        alert('Failed to reject submission: ' + error.message)
      } finally {
        processingSubmission.value = null
      }
    }

    const toggleUserStatus = async (userId, field, value) => {
      try {
        await adminApi.updateUserStatus(userId, { [field]: value })
        
        // Update user in list
        const user = users.value.find(u => u.id === userId)
        if (user) {
          user[field] = value
        }
      } catch (error) {
        console.error('User update error:', error)
        alert('Failed to update user: ' + error.message)
      }
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString()
    }

    const logout = () => {
      authStore.logout()
      router.push('/login')
    }

    onMounted(() => {
      if (!authStore.isAuthenticated) {
        router.push('/login')
        return
      }
      loadAdminData()
    })

    return {
      loading,
      accessDenied,
      stats,
      submissions,
      users,
      adminInfo,
      activeTab,
      processingSubmission,
      tabs,
      approveSubmission,
      rejectSubmission,
      toggleUserStatus,
      formatDate,
      logout
    }
  }
}
</script>
