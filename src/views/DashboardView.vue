<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(true)
const error = ref('')
const submissions = ref([])
const stats = ref({
  totalSubmissions: 0,
  pendingSubmissions: 0,
  approvedSubmissions: 0,
  rejectedSubmissions: 0
})

const currentPage = ref(1)
const totalPages = ref(1)
const activeFilter = ref('all')

// Check authentication
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  await fetchSubmissions()
})

const fetchSubmissions = async () => {
  isLoading.value = true
  error.value = ''
  
  try {
    const status = activeFilter.value === 'all' ? '' : activeFilter.value
    const response = await fetch(`http://localhost:3001/api/submissions/my-submissions?page=${currentPage.value}&limit=10${status ? `&status=${status}` : ''}`, {
      headers: {
        ...authStore.getAuthHeaders()
      }
    })

    const data = await response.json()
    
    if (data.success) {
      submissions.value = data.data.submissions
      totalPages.value = data.data.pagination.total_pages
      
      // Calculate stats
      const allSubmissions = data.data.submissions
      stats.value = {
        totalSubmissions: allSubmissions.length,
        pendingSubmissions: allSubmissions.filter(s => s.status === 'pending').length,
        approvedSubmissions: allSubmissions.filter(s => s.status === 'approved').length,
        rejectedSubmissions: allSubmissions.filter(s => s.status === 'rejected').length
      }
    } else {
      error.value = data.message || 'Failed to fetch submissions'
    }
  } catch (err) {
    error.value = 'Failed to fetch submissions'
    console.error('Error fetching submissions:', err)
  } finally {
    isLoading.value = false
  }
}

const filteredSubmissions = computed(() => {
  if (activeFilter.value === 'all') return submissions.value
  return submissions.value.filter(s => s.status === activeFilter.value)
})

const changeFilter = async (filter: string) => {
  activeFilter.value = filter
  currentPage.value = 1
  await fetchSubmissions()
}

const changePage = async (page: number) => {
  currentPage.value = page
  await fetchSubmissions()
}

const goToUpload = () => {
  router.push('/upload')
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getStatusClass = (status: string) => {
  return {
    'pending': status === 'pending',
    'approved': status === 'approved',
    'rejected': status === 'rejected'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending': return 'fas fa-clock'
    case 'approved': return 'fas fa-check-circle'
    case 'rejected': return 'fas fa-times-circle'
    default: return 'fas fa-question-circle'
  }
}
</script>

<template>
  <div class="dashboard-container">
    <!-- Header -->
    <div class="dashboard-header">
      <h1 class="dashboard-title">My Dashboard</h1>
      <p class="dashboard-subtitle">Track your mod submissions and manage your uploads</p>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-upload"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.totalSubmissions }}</div>
          <div class="stat-label">Total Submissions</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.pendingSubmissions }}</div>
          <div class="stat-label">Pending Review</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.approvedSubmissions }}</div>
          <div class="stat-label">Approved</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-times-circle"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.rejectedSubmissions }}</div>
          <div class="stat-label">Rejected</div>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error-message">
      <i class="fas fa-exclamation-triangle"></i>
      {{ error }}
    </div>

    <!-- Submissions Section -->
    <div class="submissions-section">
      <div class="section-header">
        <h2>My Submissions</h2>
        <button @click="goToUpload" class="btn btn-primary">
          <i class="fas fa-plus"></i>
          Upload New Mod
        </button>
      </div>

      <!-- Filter Tabs -->
      <div class="filter-tabs">
        <button 
          @click="changeFilter('all')" 
          :class="['filter-tab', { active: activeFilter === 'all' }]"
        >
          All
        </button>
        <button 
          @click="changeFilter('pending')" 
          :class="['filter-tab', { active: activeFilter === 'pending' }]"
        >
          Pending
        </button>
        <button 
          @click="changeFilter('approved')" 
          :class="['filter-tab', { active: activeFilter === 'approved' }]"
        >
          Approved
        </button>
        <button 
          @click="changeFilter('rejected')" 
          :class="['filter-tab', { active: activeFilter === 'rejected' }]"
        >
          Rejected
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        Loading your submissions...
      </div>

      <!-- Submissions Grid -->
      <div v-else-if="filteredSubmissions.length > 0" class="submissions-grid">
        <div 
          v-for="submission in filteredSubmissions" 
          :key="submission.id" 
          class="submission-card"
        >
          <div class="submission-header">
            <h3>{{ submission.title }}</h3>
            <div :class="['status-badge', getStatusClass(submission.status)]">
              <i :class="getStatusIcon(submission.status)"></i>
              {{ submission.status.charAt(0).toUpperCase() + submission.status.slice(1) }}
            </div>
          </div>
          
          <div class="submission-details">
            <p class="description">{{ submission.description.substring(0, 150) }}{{ submission.description.length > 150 ? '...' : '' }}</p>
            
            <div class="submission-meta">
              <div class="meta-item">
                <i class="fas fa-user"></i>
                <span>{{ submission.author_name }}</span>
              </div>
              <div class="meta-item">
                <i class="fas fa-tag"></i>
                <span>v{{ submission.version }}</span>
              </div>
              <div class="meta-item">
                <i class="fas fa-calendar"></i>
                <span>{{ formatDate(submission.submitted_at) }}</span>
              </div>
            </div>

            <div v-if="submission.admin_notes && submission.status !== 'pending'" class="admin-feedback">
              <h4>
                <i class="fas fa-comment-alt"></i>
                Admin Feedback
              </h4>
              <p>{{ submission.admin_notes }}</p>
              <div v-if="submission.reviewed_by" class="review-info">
                <small>
                  Reviewed by {{ submission.reviewed_by }} on {{ formatDate(submission.reviewed_at) }}
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <i class="fas fa-folder-open"></i>
        <h3>No submissions found</h3>
        <p>You haven't submitted any mods for review yet. Start by uploading your first mod!</p>
        <button @click="goToUpload" class="upload-first-btn">
          <i class="fas fa-plus"></i> Upload Your First Mod
        </button>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          @click="changePage(currentPage - 1)" 
          :disabled="currentPage === 1"
          class="page-btn"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        
        <button 
          v-for="page in totalPages" 
          :key="page"
          @click="changePage(page)"
          :class="['page-btn', { active: currentPage === page }]"
        >
          {{ page }}
        </button>
        
        <button 
          @click="changePage(currentPage + 1)" 
          :disabled="currentPage === totalPages"
          class="page-btn"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.dashboard-header {
  margin-bottom: 3rem;
}

.dashboard-title {
  font-size: 2.5rem;
  color: var(--primary);
  margin-bottom: 0.5rem;
}

.dashboard-subtitle {
  color: var(--text-muted);
  font-size: 1.1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-left: 4px solid var(--primary);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  font-size: 2.5rem;
  color: var(--primary);
  margin-bottom: 1rem;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: var(--text-dark);
  margin-bottom: 0.5rem;
}

.stat-label {
  color: var(--text-muted);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.submissions-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-header h2 {
  color: var(--text-dark);
  margin: 0;
  font-size: 1.8rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
}

.filter-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid var(--light);
}

.filter-tab {
  background: none;
  border: none;
  padding: 1rem 1.5rem;
  color: var(--text-muted);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  font-weight: 500;
  transition: all 0.2s ease;
}

.filter-tab.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}

.filter-tab:hover:not(.active) {
  color: var(--text-dark);
}

.submissions-grid {
  display: grid;
  gap: 1.5rem;
}

.submission-card {
  background: var(--light);
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid var(--border);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.submission-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.submission-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.submission-header h3 {
  color: var(--text-dark);
  margin: 0;
  font-size: 1.3rem;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.status-badge.approved {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-badge.rejected {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.submission-details .description {
  color: var(--text-muted);
  margin-bottom: 1rem;
  line-height: 1.6;
}

.submission-meta {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.meta-item i {
  color: var(--primary);
}

.admin-feedback {
  background: white;
  border-left: 4px solid var(--primary);
  padding: 1rem;
  border-radius: 0 8px 8px 0;
  margin-top: 1rem;
}

.admin-feedback h4 {
  margin: 0 0 0.5rem 0;
  color: var(--text-dark);
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.admin-feedback p {
  margin: 0 0 0.5rem 0;
  line-height: 1.5;
}

.review-info {
  color: var(--text-muted);
  font-style: italic;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
}

.page-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border);
  background: white;
  color: var(--text-dark);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-btn.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-muted);
}

.empty-state i {
  font-size: 4rem;
  color: var(--border);
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: var(--text-dark);
  margin-bottom: 0.5rem;
}

.upload-first-btn {
  background: var(--primary);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s ease;
  margin-top: 1rem;
}

.upload-first-btn:hover {
  background: var(--primary-dark);
}

.loading-spinner {
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #f5c6cb;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 1rem;
  }
  
  .dashboard-title {
    font-size: 2rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .submission-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .submission-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .filter-tabs {
    flex-wrap: wrap;
  }
  
  .pagination {
    flex-wrap: wrap;
  }
}
</style>
