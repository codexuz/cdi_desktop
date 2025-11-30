<template>
  <ExamLayout title="Writing">
    <Toaster />
    <template #header>
      <ExamHeader title="Writing" :timer="true" @finish="cleanup" />
    </template>
    <div class="min-w-0 flex-1 overflow-y-auto">
      <div class="h-full flex flex-col">
        <!-- Header Card -->
        <Card
          class="m-4 rounded-md shadow-none border px-4 py-3 bg-gray-100 dark:bg-[#1f2937] dark:border-[#1f2937]"
        >
          <CardContent>
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-semibold">Part {{ activePart }}</h2>
                <p v-if="currentTask">
                  You should spend about {{ currentTask.time_minutes }} minutes on this task. Write
                  at least {{ currentTask.min_words }} words.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Main Content with Split View -->
        <div v-if="isLoading" class="text-center py-12">
          <p class="text-lg text-gray-500">Loading writing test...</p>
        </div>
        <div v-else-if="error" class="text-center py-12">
          <p class="text-lg text-red-500">{{ error }}</p>
        </div>
        <ResizablePanelGroup
          v-else-if="writingData && currentTask"
          id="writing-panel-group"
          direction="horizontal"
          class="flex flex-col h-full flex-1 w-full"
        >
          <!-- Left Panel: Task Description -->
          <ResizablePanel id="writing-task-panel" :default-size="50">
            <ScrollArea class="w-full h-full px-4 py-4">
              <div class="space-y-4 max-w-3xl">
                <!-- Task Prompt -->
                <div class="text-gray-900 dark:text-gray-100 whitespace-pre-line">
                  {{ currentTask.prompt }}
                </div>

                <!-- Image if available -->
                <div v-if="currentTask.visual_url && currentTask.task === `TASK_1`" class="mt-4">
                  <img
                    :src="currentTask.visual_url"
                    alt="Task visual"
                    class="w-[90%] border rounded"
                  />
                </div>
              </div>
            </ScrollArea>
          </ResizablePanel>

          <ResizableHandle id="writing-handle" with-handle />

          <!-- Right Panel: Text Editor -->
          <ResizablePanel id="writing-editor-panel" :default-size="50">
            <div class="flex flex-col h-full">
              <div class="flex-1 relative">
                <Textarea
                  v-model="answers[currentTask.id]"
                  class="w-[90%] mx-auto p-4 rounded min-h-40 m-3 focus:outline-none bg-transparent text-gray-900 dark:text-gray-100"
                  placeholder="Write your answer here..."
                ></Textarea>
                <!-- Word Counter -->
                <div
                  class="absolute bottom-2 right-4 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1"
                >
                  Words: {{ wordCount }}
                </div>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>

        <!-- Footer Navigation -->
        <div class="rounded-none border-t dark:border-t-gray-700 relative flex h-16 w-full">
          <div
            :class="
              activePart === 1
                ? 'border-t-4 border-green-500 dark:border-blue-900'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            "
            class="flex w-1/2 h-full items-center cursor-pointer justify-start"
            @click="activePart = 1"
          >
            <div class="flex items-center gap-4 mx-4">
              <span class="font-bold px-4 py-2 rounded transition-colors"> Part 1 </span>
            </div>
          </div>
          <div
            :class="
              activePart === 2
                ? 'border-t-4 border-green-500 dark:border-blue-900'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            "
            class="flex w-1/2 h-full items-center cursor-pointer justify-start"
            @click="activePart = 2"
          >
            <div class="flex items-center gap-4 mx-4">
              <span class="font-bold px-4 py-2 rounded transition-colors"> Part 2 </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ExamLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { get, post } from '@/utils/api'
import ExamLayout from '@/layouts/ExamLayout.vue'
import ExamHeader from '@/components/ExamHeader.vue'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { Textarea } from '@/components/ui/textarea'
import { useExamAnswersStore } from '@/stores/examAnswers'
import { useTimerStore } from '@/stores/timer'
import { toast } from 'vue-sonner'
import { Toaster } from '@/components/ui/sonner'

const route = useRoute()
const router = useRouter()
const examAnswersStore = useExamAnswersStore()
const timerStore = useTimerStore()

const isLoading = ref(true)
const error = ref('')
const writingData = ref<any>(null)
const answers = ref<Record<string, string>>({})

const activePart = ref(parseInt(route.query.part as string) || 1)

const totalParts = computed(() => writingData.value?.tasks?.length || 2)

const currentTask = computed(() => {
  if (!writingData.value?.tasks || activePart.value < 1) return null
  // Find task by TASK_1 or TASK_2
  const taskName = `TASK_${activePart.value}`
  return writingData.value.tasks.find((t: any) => t.task === taskName) || null
})

const wordCount = computed(() => {
  if (!currentTask.value) return 0
  const text = (answers.value[currentTask.value.id] || '').trim()
  if (!text) return 0
  return text.split(/\s+/).length
})

// Fetch writing test data
onMounted(async () => {
  try {
    const response = await get('/student/writing')
    writingData.value = response.data

    // Load saved answers from store
    const savedAnswers = examAnswersStore.getWritingAnswers()

    // Initialize answers object
    if (writingData.value?.tasks) {
      for (let i = 0; i < writingData.value.tasks.length; i++) {
        const task = writingData.value.tasks[i]
        // Use saved answer if exists, otherwise empty string
        const savedTask = savedAnswers[i]
        answers.value[task.id] = savedTask?.task_1_answer || savedTask?.task_2_answer || ''
      }
    }

    // Initialize and start timer for writing (60 minutes)
    timerStore.initialize('writing', 60 * 60)
    timerStore.start()

    // Listen for timer finished event
    window.addEventListener('timer-finished', handleTimerFinished)
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Failed to load writing test.'
  } finally {
    isLoading.value = false
  }
})

// Handle timer finished
const handleTimerFinished = async () => {
  await submitAnswers()
    // Stop the timer
  timerStore.stop()
  // Clear timer from localStorage
  timerStore.clear()
  router.push('/') // Redirect to home or results page
}

// Cleanup on unmount
onUnmounted(() => {
  window.removeEventListener('timer-finished', handleTimerFinished);
  // Stop the timer
  timerStore.stop()
  // Clear timer from localStorage
  timerStore.clear()
})

// Watch answers and save to store
watch(
  answers,
  (newAnswers) => {
    if (writingData.value?.tasks) {
      const writingAnswers = writingData.value.tasks.map((task: any, index: number) => {
        const answer = newAnswers[task.id] || ''
        const text = answer.trim()
        const wordCount = text ? text.split(/\s+/).length : 0

        return {
          [`task_${index + 1}_answer`]: answer,
          word_count: wordCount,
        }
      })
      examAnswersStore.setWritingAnswers(writingAnswers)
    }
  },
  { deep: true },
)

const getPartQuestionCount = (part: number) => {
  if (!writingData.value?.tasks || part < 1 || part > writingData.value.tasks.length) return ''
  const task = writingData.value.tasks[part - 1]
  return `${task.min_words || 0} words`
}

const submitAnswers = async () => {
  try {
    // Set submission timestamp
    const submittedAt = new Date().toISOString()
    examAnswersStore.setSubmittedAt(submittedAt)

    // Calculate total time spent (in minutes)
    const totalTimeSpent = Math.floor(timerStore.totalTime - timerStore.remainingTime) / 60
    examAnswersStore.setTotalTimeSpent(totalTimeSpent)

    // Get the full test results from store
    const testResults = examAnswersStore.getTestResults()

    // Send the entire test_results structure matching API format
    const response = await post('/student/submit-test', { test_results: testResults })

    toast.success('Answers submitted successfully!')
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Failed to submit answers.'
    toast.error(error.value)
    throw err // Re-throw so ExamHeader knows submission failed
  }
}

const cleanup = async () => {
  // Stop the timer
  timerStore.stop()
  // Clear timer from localStorage
  timerStore.clear()
  await submitAnswers()
  // Clear all exam answers from localStorage
  examAnswersStore.clearAllAnswers()
}
</script>

<style scoped>
/* Add any custom styles here */
</style>
