<template>
  <div
    class="min-h-screen bg-linear-to-br from-blue-600 to-blue-800 dark:from-slate-900 dark:to-slate-800"
  >
    <div
      class="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-white/20 dark:border-slate-700/50 px-8 py-4 flex justify-between items-center shadow-lg"
    >
      <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">Mockmee</div>
      <div class="flex items-center gap-4 text-sm">
        <div>
          <p class="text-gray-700 dark:text-slate-300">{{ 'Candidate ID: ' + candidateId }}</p>
          <p class="text-gray-700 dark:text-slate-300">
            {{ 'Center: ' + (testData?.center?.name || 'N/A') }}
          </p>
        </div>
        <button
          @click="toggleTheme"
          class="p-2 rounded-full border-2 border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition-all"
          title="Toggle theme"
        >
          <Sun v-if="isDark" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <Moon v-else class="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </button>
        <button
          class="bg-linear-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white px-6 py-2 rounded-full font-semibold transition-all hover:-translate-y-0.5 hover:shadow-xl shadow-blue-500/30"
          @click="logout"
        >
          Logout
        </button>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-8 py-8">
      <h1 class="text-center text-white dark:text-slate-100 text-5xl font-extrabold mb-8">
        IELTS Mock Exam
      </h1>

      <div
        v-if="isLoading"
        class="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-3xl px-12 py-12 text-center shadow-2xl border border-white/20 dark:border-slate-700/50"
      >
        <p class="text-xl text-gray-600 dark:text-slate-300">Loading assignment data...</p>
      </div>
      <div
        v-else-if="error"
        class="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-3xl px-12 py-12 text-center shadow-2xl border border-white/20 dark:border-slate-700/50"
      >
        <p class="text-xl text-gray-600 dark:text-slate-300">{{ error }}</p>
      </div>

      <div v-else class="grid gap-8">
        <div
          v-if="tests.length === 0"
          class="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-3xl px-12 py-12 text-center shadow-2xl border border-white/20 dark:border-slate-700/50"
        >
          <div class="text-5xl mb-4">📝</div>
          <p class="text-xl text-gray-600 dark:text-slate-300">
            No tests available at the moment. Please check back later or contact your administrator.
          </p>
        </div>

        <div
          v-else
          v-for="test in tests"
          :key="test.id"
          class="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-3xl px-8 py-8 shadow-2xl border border-white/20 dark:border-slate-700/50 transition-all hover:-translate-y-1 hover:shadow-3xl relative overflow-hidden"
          :class="{
            'border-2 !border-green-500 dark:!border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20':
              testData?.status === 'completed',
            'border-2 !border-amber-500 dark:!border-amber-400 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20':
              testData?.status === 'in_progress',
          }"
          :data-test-id="test.id"
        >
          <div class="mb-6">
            <h4
              class="text-3xl font-bold text-gray-900 dark:text-slate-100 bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent"
            >
              {{ test.name }} - {{ test.title }}
            </h4>
          </div>
          <div class="flex items-center mb-4 text-lg text-gray-600 dark:text-slate-400 font-medium">
            <span class="text-xl mr-2">⏱️</span>
            <span
              >Timing:
              <span class="text-blue-600 dark:text-blue-400 font-bold ml-1">{{
                test.timing
              }}</span></span
            >
          </div>
          <div class="mb-8">
            <p class="text-gray-700 dark:text-slate-300 leading-relaxed">{{ test.description }}</p>
          </div>
          <button
            class="px-8 py-4 rounded-full font-semibold text-lg transition-all relative overflow-hidden shadow-lg"
            :class="
              testData?.status === 'completed'
                ? 'bg-linear-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white shadow-green-500/30 cursor-not-allowed'
                : 'bg-linear-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white shadow-blue-500/30 hover:-translate-y-0.5 hover:shadow-xl'
            "
            @click="handleTestAction(test.id)"
            :disabled="testData?.status === 'completed'"
          >
            {{ getButtonText() }}
          </button>
        </div>
      </div>
    </div>
    <div
      class="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex justify-center items-center z-[1000] transition-all"
      :class="showLogoutModal ? 'opacity-100 visible' : 'opacity-0 invisible'"
      :style="{ display: showLogoutModal ? 'flex' : 'none' }"
      @click="hideLogoutModalOnBackdrop"
    >
      <div
        class="bg-white dark:bg-slate-800 rounded-3xl px-8 py-8 max-w-md w-11/12 shadow-2xl transition-transform"
        :class="showLogoutModal ? 'scale-100' : 'scale-90'"
      >
        <h2 class="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-4 text-center">
          Confirm Logout
        </h2>
        <p class="text-gray-600 dark:text-slate-400 leading-relaxed mb-8 text-center">
          Are you sure you want to logout? This will clear all your test progress and you'll need to
          login again.
        </p>
        <div class="flex gap-4 justify-center">
          <button
            class="flex-1 px-6 py-3 rounded-full font-semibold transition-all bg-linear-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 hover:shadow-xl"
            @click="performLogout"
          >
            Yes, Logout
          </button>
          <button
            class="flex-1 px-6 py-3 rounded-full font-semibold transition-all bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 border-2 border-gray-300 dark:border-slate-600 hover:bg-gray-200 dark:hover:bg-slate-600 hover:-translate-y-0.5"
            @click="hideLogoutModal"
          >
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
import { useDark, useToggle } from '@vueuse/core'
import { Sun, Moon } from 'lucide-vue-next'
import { useTestStatusStore } from '@/stores/testStatus'

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
const testStatusStore = useTestStatusStore()
const candidateId = ref('')
const testData = ref<TestData | null>(null)
const currentDate = ref('')
const showLogoutModal = ref(false)
const isLoading = ref(true)
const error = ref('')

// Dark mode
const isDark = useDark()
const toggleDark = useToggle(isDark)

const toggleTheme = () => {
  toggleDark()
}

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
    testStatusStore.resetAllTests()
    removeAccessToken()
    // Redirect to login
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
    // Still logout locally
    testStatusStore.resetAllTests()
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
    const response = await post('/student/start-test')

    console.log('Test started successfully:', response.data)
    // Redirect to the test page or update status
    router.push(`/tests/dashboard?test_id=${testId}`)
  } catch (error) {
    console.error('Error starting test:', error)
    alert('Failed to start test. Please try again.')
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
      return 'Continue Test'
    default:
      return 'Start Test'
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
  } catch (err: any) {
    console.error('Error fetching assignment:', err)
    if (err?.response?.status === 404) {
      error.value = err?.response?.data?.message || 'No assignment found for your account.'
    } else {
      error.value = 'Failed to load assignment data.'
    }
  } finally {
    isLoading.value = false
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>
