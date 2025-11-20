<template>
  <div class="wrap">
    <div class="top-bar">
      <div class="logo">Mockmee</div>
      <div class="candidate-info text-sm">
        <div>
          <p>{{ 'Candidate ID: ' + candidateId }}</p>
          <p>{{ 'Center: ' + (testData?.center?.name || 'N/A') }}</p>
        </div>
        <button class="logout-btn" @click="logout">Logout</button>
      </div>
    </div>

    <div class="container">
      <h1>IELTS Mock Exam</h1>

      <div v-if="isLoading" class="loading">
        <p>Loading assignment data...</p>
      </div>
      <div v-else-if="error" class="error">
        <p>{{ error }}</p>
      </div>
      <div v-else>
        <p>
          Today: <span>{{ currentDate }}</span>
        </p>
        <hr />
      </div>

      <div class="tests">
        <div v-if="tests.length === 0" class="no-tests">
          <p>
            No tests available at the moment. Please check back later or contact your administrator.
          </p>
        </div>

        <div
          v-for="test in tests"
          :key="test.id"
          class="one-test"
          :class="{
            completed: testData?.status === 'completed',
            in_progress: testData?.status === 'in_progress',
          }"
          :data-test-id="test.id"
        >
          <div class="test-header">
            <h4 class="test-name">{{ test.name }} - {{ test.title }}</h4>
          </div>
          <div class="timing-info">
            <span
              >Timing: <span class="timing">{{ test.timing }}</span></span
            >
          </div>
          <div class="test-description">
            <p>{{ test.description }}</p>
          </div>
          <button
            class="start-test"
            :class="{ 'completed-btn': testData?.status === 'completed' }"
            @click="handleTestAction(test.id)"
            :disabled="testData?.status === 'completed'"
          >
            {{ getButtonText() }}
          </button>
        </div>
      </div>
    </div>
    <div
      class="logout-modal"
      :class="{ show: showLogoutModal }"
      :style="{ display: showLogoutModal ? 'flex' : 'none' }"
      @click="hideLogoutModalOnBackdrop"
    >
      <div class="logout-modal-content">
        <h2>Confirm Logout</h2>
        <p>
          Are you sure you want to logout? This will clear all your test progress and you'll need to
          login again.
        </p>
        <div class="logout-modal-buttons">
          <button class="logout-modal-btn logout-confirm-btn" @click="performLogout">
            Yes, Logout
          </button>
          <button class="logout-modal-btn logout-cancel-btn" @click="hideLogoutModal">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { get, post, removeAccessToken } from '@/utils/api'

interface TestItem {
  id: string
  name: string
  timing: string
  url: string
  videoUrl: string
  description: string
  testId: string
  title: string
  isActive: boolean
}

interface TestData {
  id: string
  candidate_id: string
  student_id: string
  student: {
    id: string
    name: string
    phone: string
    email: string
    password: string
    email_verification_otp: string | null
    email_verification_otp_expires: string | null
    email_verified: boolean
    login_otp: string | null
    login_otp_expires: string | null
    google_id: string | null
    avatar_url: string | null
    provider: string
    center_id: string
    is_active: boolean
    created_at: string
    updated_at: string
  }
  test_id: string
  test: {
    id: string
    title: string
    description: string
    center_id: string
    created_by: string
    updated_by: string
    test_type: string
    is_active: boolean
    created_at: string
    updated_at: string
  }
  center_id: string
  center: {
    id: string
    name: string
    subdomain: string
    address: string
    owner_id: string
    phone: string
    email: string
    description: string | null
    is_active: boolean
    created_at: string
    updated_at: string
  }
  assigned_by: string
  test_start_time: string
  test_end_time: string
  status: string
  completed_at: string | null
  test_results: any
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// Reactive state
const router = useRouter()
const candidateId = ref('')
const testData = ref<TestData | null>(null)
const currentDate = ref('')
const showLogoutModal = ref(false)
const isLoading = ref(true)
const error = ref('')

// Generate tests data from fetched data
const tests = computed(() => {
  console.log('Computing test from data:', testData.value)

  if (!testData.value) {
    console.log('No test data found')
    return []
  }

  const testDataArray: TestItem[] = []

  // Single test object
  testDataArray.push({
    id: testData.value.test.id,
    name: 'IELTS Mock Test',
    timing: '180 minutes',
    url: `/test/${testData.value.test.id}`,
    videoUrl: 'https://static.gelnet.org/cdielts/intro.mp4',
    description:
      testData.value.test.description ||
      'Complete IELTS Mock Test including Listening, Reading, and Writing sections.',
    testId: testData.value.test.id,
    title: testData.value.test.title,
    isActive: testData.value.test.is_active,
  })

  console.log('Final test data:', testDataArray)
  return testDataArray
})

// Logout functions
const logout = () => {
  showLogoutModal.value = true
}

const hideLogoutModal = () => {
  showLogoutModal.value = false
}

const hideLogoutModalOnBackdrop = (event: Event) => {
  if (event.target === event.currentTarget) {
    hideLogoutModal()
  }
}

const performLogout = async () => {
  try {
    // Call the logout endpoint
    await post('/auth/logout')
    removeAccessToken()
    // Redirect to login
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
    // Still logout locally
    removeAccessToken()
    router.push('/login')
  }
}

// Function to format dates
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Function to start test
const startTest = async (testId: string) => {
  try {
    const response = await fetch('/api/tests/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      const data = await response.json()
      console.log('Test started successfully:', data)
      // Redirect to the test page or update status
      window.location.href = `/tests/listening/${testId}`
    } else {
      console.error('Failed to start test')
      alert('Failed to start test. Please try again.')
    }
  } catch (error) {
    console.error('Error starting test:', error)
    alert('Error starting test. Please try again.')
  }
}

// Function to handle test actions based on status
const handleTestAction = (testId: string) => {
  if (testData.value?.status === 'completed') {
    // Maybe show results or redirect to review
    alert('Test already completed. Check your results.')
    return
  }
  startTest(testId)
}

// Function to get button text based on test status
const getButtonText = () => {
  switch (testData.value?.status) {
    case 'completed':
      return '✓ Test Completed'
    case 'in_progress':
      return '▶ Continue Test'
    default:
      return '→ Start Test'
  }
}

// Keyboard event handler
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && showLogoutModal.value) {
    hideLogoutModal()
  }
}

// Lifecycle hooks
onMounted(async () => {
  console.log('Home component mounted')

  // Display current date
  const now = new Date()
  const options = {
    weekday: 'long' as const,
    year: 'numeric' as const,
    month: 'long' as const,
    day: 'numeric' as const,
  }
  currentDate.value = now.toLocaleDateString('en-US', options)

  // Add keyboard event listener
  document.addEventListener('keydown', handleKeydown)

  // Fetch assignment data
  try {
    const response = await get('/student/assignment')
    testData.value = response.data
    candidateId.value = response.data.candidate_id || response.data.student.name // Assuming candidate_id or use name
  } catch (err) {
    console.error('Error fetching assignment:', err)
    error.value = 'Failed to load assignment data.'
  } finally {
    isLoading.value = false
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.wrap {
  min-height: 100vh;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  font-family:
    'Poppins',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    'Roboto',
    'Oxygen',
    'Ubuntu',
    'Cantarell',
    'Fira Sans',
    'Droid Sans',
    'Helvetica Neue',
    sans-serif;
}

.top-bar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
}

.logo {
  font-size: 1.8rem;
  font-weight: 700;
  color: #dc2626;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.candidate-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.logout-btn {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
}

.logout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.container h1 {
  text-align: center;
  color: white;
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1rem;
}

.date {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.date p {
  margin: 0;
  font-size: 1.2rem;
  color: #374151;
  font-weight: 600;
}

.date span {
  color: #dc2626;
  font-weight: 700;
}

.date hr {
  border: none;
  height: 2px;
  background: linear-gradient(90deg, #dc2626 0%, #b91c1c 100%);
  margin: 1rem 0;
}

.tests {
  display: grid;
  gap: 2rem;
}

.one-test {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.one-test:hover {
  transform: translateY(-5px);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15);
}

.test-header {
  margin-bottom: 1.5rem;
}

.test-name {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.timing-info {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: #6b7280;
  font-weight: 500;
}

.timing-info::before {
  content: '⏱️';
  margin-right: 0.5rem;
  font-size: 1.2rem;
}

.timing {
  color: #dc2626;
  font-weight: 700;
  margin-left: 0.25rem;
}

.test-description {
  margin-bottom: 2rem;
}

.test-description p {
  color: #4b5563;
  line-height: 1.6;
  font-size: 1rem;
  margin: 0;
}

.start-test {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 30px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(220, 38, 38, 0.3);
  position: relative;
  overflow: hidden;
}

.start-test::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.start-test:hover::before {
  left: 100%;
}

.start-test:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(220, 38, 38, 0.4);
}

.start-test.completed-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
  cursor: not-allowed;
}

.start-test.completed-btn:hover {
  transform: none;
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
}

.one-test.completed {
  border: 2px solid #10b981;
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
}

.one-test.completed::before {
  background: linear-gradient(90deg, #10b981 0%, #059669 50%, #047857 100%);
}

.one-test.in_progress {
  border: 2px solid #f59e0b;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
}

.one-test.in_progress::before {
  background: linear-gradient(90deg, #f59e0b 0%, #d97706 50%, #b45309 100%);
}

.no-tests {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.no-tests p {
  margin: 0;
  font-size: 1.2rem;
  color: #6b7280;
  font-style: normal;
}

.no-tests::before {
  content: '📝';
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.loading,
.error {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.loading p,
.error p {
  margin: 0;
  font-size: 1.2rem;
  color: #6b7280;
}

/* Logout Modal */
.logout-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.logout-modal.show {
  opacity: 1;
  visibility: visible;
}

.logout-modal-content {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  transform: scale(0.9);
  transition: transform 0.3s ease;
}

.logout-modal.show .logout-modal-content {
  transform: scale(1);
}

.logout-modal-content h2 {
  margin: 0 0 1rem 0;
  color: #1f2937;
  font-size: 1.5rem;
  text-align: center;
}

.logout-modal-content p {
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 2rem;
  text-align: center;
}

.logout-modal-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.logout-modal-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
}

.logout-confirm-btn {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
}

.logout-confirm-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
}

.logout-cancel-btn {
  background: #f3f4f6;
  color: #374151;
  border: 2px solid #e5e7eb;
}

.logout-cancel-btn:hover {
  background: #e5e7eb;
  transform: translateY(-2px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }

  .container h1 {
    font-size: 2rem;
  }

  .top-bar {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }

  .candidate-info {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }

  .one-test {
    padding: 1.5rem;
  }

  .test-name {
    font-size: 1.5rem;
  }

  .logout-modal-content {
    padding: 1.5rem;
  }

  .logout-modal-buttons {
    flex-direction: column;
  }
}
</style>
