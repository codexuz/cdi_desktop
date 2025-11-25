<template>
  <div class="min-h-screen bg-white dark:bg-slate-900">
    <!-- Top Bar from HomeView -->
    <div
      class="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-200 dark:border-slate-700 px-8 py-4 flex justify-between items-center shadow-sm"
    >
      <a href="/" class="text-3xl font-bold text-blue-600 dark:text-blue-400">Mockmee</a>
      <div class="flex items-center gap-4 text-sm">
        <div class="dark:text-slate-200">
          <p>{{ 'Candidate ID: ' + candidateId }}</p>
          <p>{{ 'Center: ' + (centerName || 'N/A') }}</p>
        </div>
        <div class="flex items-center gap-3">
          <button
            class="flex items-center justify-center w-10 h-10 rounded-full border-2 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all hover:rotate-12"
            @click="toggleTheme"
          >
            <Sun v-if="!isDark" class="w-5 h-5" />
            <Moon v-else class="w-5 h-5" />
          </button>
          <button
            class="bg-gradient-to-br from-blue-500 to-blue-600 text-white px-6 py-2 rounded-full font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg shadow-blue-500/30"
            @click="logout"
          >
            Logout
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-6xl mx-auto px-8 py-8">
      <div class="flex flex-col gap-8 mt-8">
        <!-- Listening Card -->
        <Card
          class="bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-slate-900/50 transition-all hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-slate-900/70"
        >
          <CardHeader>
            <CardTitle class="text-2xl">Listening</CardTitle>
            <CardDescription
              class="text-lg font-bold"
              :class="
                testStatusStore.listeningStatus === 'completed' ? 'text-green-600' : 'text-red-600'
              "
            >
              {{ testStatusStore.listeningStatus === 'completed' ? 'Completed' : 'Not completed' }}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p class="text-gray-600 dark:text-slate-400 text-base mt-2">
              Timing: {{ listeningTiming }}
            </p>

            <Accordion
              v-if="testStatusStore.isListeningEnabled"
              type="single"
              collapsible
              class="w-full mt-4"
            >
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  <div>
                    <span class="test-info-trigger">Test information.</span>
                    <span
                      :class="
                        testStatusStore.listeningConfirmation === 'confirmed'
                          ? 'text-green-600'
                          : 'text-red-600'
                      "
                      class="ml-2 bg-gray-100 px-4 py-1 rounded-xl"
                    >
                      {{
                        testStatusStore.listeningConfirmation === 'confirmed'
                          ? 'Confirmed.'
                          : 'Not confirmed.'
                      }}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div class="video-container">
                    <video v-if="listeningVideoUrl" controls class="w-full rounded-lg">
                      <source :src="listeningVideoUrl" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    <p v-else class="text-gray-500">No video available</p>
                  </div>
                  <div class="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
                    <h3 class="text-xl font-semibold text-gray-800 dark:text-slate-200 mb-2">
                      Ready?
                    </h3>
                    <p class="text-gray-600 dark:text-slate-400 text-base mb-4">
                      Please confirm that you have understood the instructions above.
                    </p>
                    <button
                      v-if="testStatusStore.listeningConfirmation === 'not_confirmed'"
                      class="bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-md font-medium text-base transition-all hover:bg-gray-800 dark:hover:bg-slate-100 hover:-translate-y-0.5"
                      @click="confirmTest('listening')"
                    >
                      ✓ I confirm
                    </button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
          <CardFooter
            v-if="
              testStatusStore.listeningConfirmation === 'confirmed' &&
              testStatusStore.listeningStatus !== 'completed'
            "
          >
            <button
              class="w-52 bg-gradient-to-br from-blue-500 to-blue-600 text-white px-6 py-3 rounded-full font-semibold text-base transition-all hover:-translate-y-0.5 hover:shadow-lg shadow-blue-500/30"
              @click="startTest('listening')"
            >
              Start Test
            </button>
          </CardFooter>
          <CardFooter v-else-if="testStatusStore.listeningStatus === 'completed'">
            <button
              class="w-52 bg-gradient-to-br from-green-500 to-green-600 text-white px-6 py-3 rounded-full font-semibold text-base opacity-70 cursor-not-allowed"
              disabled
            >
              Completed
            </button>
          </CardFooter>
        </Card>

        <!-- Reading Card -->
        <Card
          class="bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-slate-900/50 transition-all hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-slate-900/70"
          :class="!testStatusStore.isReadingEnabled ? 'opacity-60 pointer-events-none' : ''"
        >
          <CardHeader>
            <CardTitle class="text-2xl">Reading</CardTitle>
            <CardDescription
              class="text-lg font-bold"
              :class="
                testStatusStore.readingStatus === 'completed' ? 'text-green-600' : 'text-red-600'
              "
            >
              {{ testStatusStore.readingStatus === 'completed' ? 'Completed' : 'Not completed' }}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p class="text-gray-600 dark:text-slate-400 text-base mt-2">
              Timing: {{ readingTiming }}
            </p>

            <Accordion
              v-if="testStatusStore.isReadingEnabled"
              type="single"
              collapsible
              class="w-full mt-4"
            >
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  <div>
                    <span class="text-amber-600 dark:text-amber-500 font-medium"
                      >Test information.</span
                    >
                    <span
                      :class="
                        testStatusStore.readingConfirmation === 'confirmed'
                          ? 'text-green-600'
                          : 'text-red-600'
                      "
                      class="ml-2 bg-gray-100 dark:bg-slate-700 px-4 py-1 rounded-xl"
                    >
                      {{
                        testStatusStore.readingConfirmation === 'confirmed'
                          ? 'Confirmed.'
                          : 'Not confirmed.'
                      }}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div class="mt-4">
                    <video v-if="readingVideoUrl" controls class="w-full rounded-lg">
                      <source :src="readingVideoUrl" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    <p v-else class="text-gray-500 dark:text-slate-400">No video available</p>
                  </div>
                  <div class="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
                    <h3 class="text-xl font-semibold text-gray-800 dark:text-slate-200 mb-2">
                      Ready?
                    </h3>
                    <p class="text-gray-600 dark:text-slate-400 text-base mb-4">
                      Please confirm that you have understood the instructions above.
                    </p>
                    <button
                      v-if="testStatusStore.readingConfirmation === 'not_confirmed'"
                      class="bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-md font-medium text-base transition-all hover:bg-gray-800 dark:hover:bg-slate-100 hover:-translate-y-0.5"
                      @click="confirmTest('reading')"
                    >
                      ✓ I confirm
                    </button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <p v-else class="text-gray-500 dark:text-slate-400 mt-4">
              Complete Listening test first to unlock this section.
            </p>
          </CardContent>
          <CardFooter
            v-if="
              testStatusStore.readingConfirmation === 'confirmed' &&
              testStatusStore.readingStatus !== 'completed'
            "
          >
            <button
              class="w-52 bg-linear-to-br from-blue-500 to-blue-600 text-white px-6 py-3 rounded-full font-semibold text-base transition-all hover:-translate-y-0.5 hover:shadow-lg shadow-blue-500/30"
              @click="startTest('reading')"
            >
              Start Test
            </button>
          </CardFooter>
          <CardFooter v-else-if="testStatusStore.readingStatus === 'completed'">
            <button
              class="w-52 bg-linear-to-br from-green-500 to-green-600 text-white px-6 py-3 rounded-full font-semibold text-base opacity-70 cursor-not-allowed"
              disabled
            >
              Completed
            </button>
          </CardFooter>
        </Card>

        <!-- Writing Card -->
        <Card
          class="bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-slate-900/50 transition-all hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-slate-900/70"
          :class="!testStatusStore.isWritingEnabled ? 'opacity-60 pointer-events-none' : ''"
        >
          <CardHeader>
            <CardTitle class="text-2xl">Writing</CardTitle>
            <CardDescription
              class="text-lg font-bold"
              :class="
                testStatusStore.writingStatus === 'completed' ? 'text-green-600' : 'text-red-600'
              "
            >
              {{ testStatusStore.writingStatus === 'completed' ? 'Completed' : 'Not completed' }}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p class="text-gray-600 dark:text-slate-400 text-base mt-2">
              Timing: {{ writingTiming }}
            </p>

            <Accordion
              v-if="testStatusStore.isWritingEnabled"
              type="single"
              collapsible
              class="w-full mt-4"
            >
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  <div>
                    <span class="text-amber-600 dark:text-amber-500 font-medium"
                      >Test information.</span
                    >
                    <span
                      :class="
                        testStatusStore.writingConfirmation === 'confirmed'
                          ? 'text-green-600'
                          : 'text-red-600'
                      "
                      class="ml-2 bg-gray-100 dark:bg-slate-700 px-4 py-1 rounded-xl"
                    >
                      {{
                        testStatusStore.writingConfirmation === 'confirmed'
                          ? 'Confirmed.'
                          : 'Not confirmed.'
                      }}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div class="mt-4">
                    <video v-if="writingVideoUrl" controls class="w-full rounded-lg">
                      <source :src="writingVideoUrl" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    <p v-else class="text-gray-500 dark:text-slate-400">No video available</p>
                  </div>
                  <div class="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
                    <h3 class="text-xl font-semibold text-gray-800 dark:text-slate-200 mb-2">
                      Ready?
                    </h3>
                    <p class="text-gray-600 dark:text-slate-400 text-base mb-4">
                      Please confirm that you have understood the instructions above.
                    </p>
                    <button
                      v-if="testStatusStore.writingConfirmation === 'not_confirmed'"
                      class="bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-md font-medium text-base transition-all hover:bg-gray-800 dark:hover:bg-slate-100 hover:-translate-y-0.5"
                      @click="confirmTest('writing')"
                    >
                      ✓ I confirm
                    </button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <p v-else class="text-gray-500 dark:text-slate-400 mt-4">
              Complete Reading test first to unlock this section.
            </p>
          </CardContent>
          <CardFooter
            v-if="
              testStatusStore.writingConfirmation === 'confirmed' &&
              testStatusStore.writingStatus !== 'completed'
            "
          >
            <button
              class="w-52 bg-linear-to-br from-blue-500 to-blue-600 text-white px-6 py-3 rounded-full font-semibold text-base transition-all hover:-translate-y-0.5 hover:shadow-lg shadow-blue-500/30"
              @click="startTest('writing')"
            >
              Start Test
            </button>
          </CardFooter>
          <CardFooter v-else-if="testStatusStore.writingStatus === 'completed'">
            <button
              class="w-52 bg-linear-to-br from-green-500 to-green-600 text-white px-6 py-3 rounded-full font-semibold text-base opacity-70 cursor-not-allowed"
              disabled
            >
              Completed
            </button>
          </CardFooter>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useDark, useToggle } from '@vueuse/core'
import { Sun, Moon } from 'lucide-vue-next'
import { get, removeAccessToken } from '@/utils/api'
import { useTestStatusStore } from '@/stores/testStatus'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const router = useRouter()
const route = useRoute()
const testStatusStore = useTestStatusStore()

// Dark mode
const isDark = useDark()
const toggleDark = useToggle(isDark)

const toggleTheme = () => {
  toggleDark()
}

// Get testId from query parameter
const testId = computed(() => route.query.test_id as string)

// User info
const candidateId = ref('CDI-2024-001')
const centerName = ref('')

const listeningTiming = ref('30 minutes')
const readingTiming = ref('60 minutes')
const writingTiming = ref('60 minutes')

const listeningVideoUrl = ref(
  'https://backend.mockmee.uz/uploads/files-1764083917482-911386743.mp4',
)
const readingVideoUrl = ref('https://backend.mockmee.uz/uploads/files-1764083927410-253722480.mp4')
const writingVideoUrl = ref('https://backend.mockmee.uz/uploads/files-1764083933691-271415463.mp4')

onMounted(async () => {
  // Load test data from API
  try {
    const response = await get('/student/assignment')
    if (response.data) {
      // Update with actual data from API
      candidateId.value = response.data.candidate_id || candidateId.value
      centerName.value = response.data.center?.name || ''
    }
  } catch (error) {
    console.error('Failed to load test data:', error)
  }
})

const startTest = (testType: string) => {
  // Update status to in_progress and navigate
  if (testType === 'listening') {
    testStatusStore.startListening()
  } else if (testType === 'reading') {
    testStatusStore.startReading()
  } else if (testType === 'writing') {
    testStatusStore.startWriting()
  }
  router.push(`/${testType}/${testId.value}`)
}

const confirmTest = (testType: string) => {
  if (testType === 'listening') {
    testStatusStore.confirmListening()
  } else if (testType === 'reading') {
    testStatusStore.confirmReading()
  } else if (testType === 'writing') {
    testStatusStore.confirmWriting()
  }
}

const logout = () => {
  testStatusStore.resetAllTests()
  removeAccessToken()
  router.push('/login')
}
</script>
