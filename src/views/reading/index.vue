<script setup>
import { ref, computed, onMounted, nextTick, watch, onUnmounted } from 'vue'
import { get, post } from '@/utils/api'
// Import other UI components
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { useTextSelection } from '@vueuse/core'
import ExamLayout from '@/layouts/ExamLayout.vue'
import ExamHeader from '@/components/ExamHeader.vue'
const { text } = useTextSelection()
import { Copy, Highlighter, Trash2Icon } from 'lucide-vue-next'
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import SelectionQuestion from '@/components/reading/SelectionQuestion.vue'
import CompletionQuestion from '@/components/reading/CompletionQuestion.vue'
import MultipleChoiceQuestion from '@/components/reading/MultipleChoiceQuestion.vue'
import DraggableSelectionQuestion from '@/components/reading/DraggableSelectionQuestion.vue'
import { useExamAnswersStore } from '@/stores/examAnswers'
import { useTimerStore } from '@/stores/timer'
import { useRouter } from 'vue-router'

// Reading test data
const isLoading = ref(true)
const error = ref('')
const readingData = ref(null)
const examAnswersStore = useExamAnswersStore()
const timerStore = useTimerStore()
const router = useRouter()

// Reactive state for active part and question
const activePart = ref(1)
const activeQuestion = ref(0)
const activeGlobalQuestion = ref(1) // Track the global question number (1-40)

// Answers storage
const answers = ref({})

// Fetch reading test data
onMounted(async () => {
  try {
    const response = await get('/student/reading')
    readingData.value = response.data

    // Load saved answers from store
    const savedAnswers = examAnswersStore.getReadingAnswers()
    answers.value = Object.keys(savedAnswers).length > 0 ? savedAnswers : {}

    // Initialize and start timer for reading (60 minutes)
    timerStore.initialize('reading', 60 * 60)
    timerStore.start()

    // Listen for timer finished event
    window.addEventListener('timer-finished', handleTimerFinished)
  } catch (err) {
    error.value = err?.response?.data?.message || 'Failed to load reading test.'
  } finally {
    isLoading.value = false
  }
})

// Handle finish button click
const handleFinish = async () => {
  // Stop and clear the reading timer
  timerStore.stop()
  timerStore.clear()

  // Note: Navigation to next route is handled by ExamHeader component
  // Answers are already saved to store via the watch
}

// Handle timer finished (automatic expiration)
const handleTimerFinished = async () => {
  handleFinish()
}

// Cleanup on unmount
onUnmounted(() => {
  window.removeEventListener('timer-finished', handleTimerFinished)
})

// Watch answers and save to store
watch(
  answers,
  (newAnswers) => {
    // Transform answers to the new structure: { partId: [{ questionNum: answer }] }
    const transformedAnswers = {}

    if (readingData.value?.parts) {
      for (const part of readingData.value.parts) {
        const partAnswers = {}
        let questionCounter = 1

        // Calculate starting question number for this part
        const partNum = parseInt(part.part.split('_')[1])
        for (let i = 1; i < partNum; i++) {
          questionCounter += getPartQuestionCount(i)
        }

        if (part.question?.content) {
          for (const section of part.question.content) {
            const sectionAnswers = newAnswers[section.id] || []

            if (Array.isArray(sectionAnswers)) {
              sectionAnswers.forEach((answer, index) => {
                if (
                  answer !== undefined &&
                  answer !== null &&
                  answer !== '' &&
                  answer.toString().trim() !== ''
                ) {
                  partAnswers[(questionCounter + index).toString()] = answer
                }
              })
            }

            // Count questions in this section
            const sectionQuestionCount = getSectionQuestionCount(section)
            questionCounter += sectionQuestionCount
          }
        }

        transformedAnswers[part.id] = [partAnswers]
      }
    }

    examAnswersStore.setReadingAnswers(transformedAnswers)
  },
  { deep: true },
)

// Watch for new text selection
const selection = ref(null)

function highlightSelectedText() {
  selection.value = window.getSelection()
  if (!selection.value || !selection.value.rangeCount) return

  const range = selection.value.getRangeAt(0)
  if (range.toString().trim() === '') return

  // Wrap in <mark>
  const mark = document.createElement('mark')
  mark.classList.add('highlight')
  try {
    range.surroundContents(mark)
  } catch (err) {
    console.warn('Highlight failed (probably multi-node selection):', err)
  }

  // Clear native selection (optional)
  selection.value.removeAllRanges()
}

const clearHighlightSelection = () => {
  // Remove all highlight marks
  const highlights = document.querySelectorAll('mark.highlight')
  highlights.forEach((mark) => {
    const parent = mark.parentNode
    while (mark.firstChild) {
      parent.insertBefore(mark.firstChild, mark)
    }
    parent.removeChild(mark)
  })

  // Clear any active selection
  if (window.getSelection) {
    window.getSelection().removeAllRanges()
  } else if (document.selection) {
    document.selection.empty()
  }
}

// Check if a specific question number has been answered
const isQuestionAnswered = (globalQuestionNumber) => {
  // Find which part and section this question belongs to
  let currentQuestionNum = 1

  if (!readingData.value?.parts) return false

  // Sort parts to ensure correct order (PART_1, PART_2, PART_3)
  const sortedParts = [...readingData.value.parts].sort((a, b) => {
    const aNum = parseInt(a.part.split('_')[1])
    const bNum = parseInt(b.part.split('_')[1])
    return aNum - bNum
  })

  for (const part of sortedParts) {
    if (!part.question?.content) continue

    for (const section of part.question.content) {
      const sectionQuestionCount = getSectionQuestionCount(section)

      // Check if this global question number falls within this section
      if (
        globalQuestionNumber >= currentQuestionNum &&
        globalQuestionNumber < currentQuestionNum + sectionQuestionCount
      ) {
        const localIndex = globalQuestionNumber - currentQuestionNum
        const sectionAnswers = answers.value[section.id]

        if (!sectionAnswers || !Array.isArray(sectionAnswers)) return false

        const answer = sectionAnswers[localIndex]
        // Check if answer exists and is not empty
        return (
          answer !== undefined &&
          answer !== null &&
          answer !== '' &&
          answer.toString().trim() !== ''
        )
      }

      currentQuestionNum += sectionQuestionCount
    }
  }

  return false
}

// Current part data
const currentPart = computed(() => {
  if (!readingData.value?.parts) return null
  return readingData.value.parts.find((p) => p.part === `PART_${activePart.value}`)
})

// Get starting question number for current part
const getStartingQuestionNumber = computed(() => {
  let start = 1
  for (let i = 1; i < activePart.value; i++) {
    start += getPartQuestionCount(i)
  }
  return start
})

// Get the number of questions in a section (counting @@ markers or questions array)
const getSectionQuestionCount = (section) => {
  if (
    section.type === 'selection' ||
    section.type === 'completion' ||
    section.type === 'draggable-selection'
  ) {
    // Count @@ markers in content
    const matches = section.content.match(/@@/g)
    return matches ? matches.length : 0
  } else if (section.type === 'multiple-choice') {
    // Count questions array
    return section.questions ? section.questions.length : 0
  }
  return 0
}

// Get starting question number for a specific section within the current part
const getSectionStartingQuestionNumber = (sectionIndex) => {
  let start = getStartingQuestionNumber.value

  // Add questions from previous sections in the current part
  if (currentPart.value?.question?.content) {
    for (let i = 0; i < sectionIndex; i++) {
      const section = currentPart.value.question.content[i]
      start += getSectionQuestionCount(section)
    }
  }

  return start
}

// Get question count for a part
const getPartQuestionCount = (partNum) => {
  const part = readingData.value?.parts?.find((p) => p.part === `PART_${partNum}`)
  return part?.question?.number_of_questions || 13
}

// Get question range for a part
const getQuestionRange = (partNum) => {
  let start = 1
  for (let i = 1; i < partNum; i++) {
    start += getPartQuestionCount(i)
  }
  const end = start + getPartQuestionCount(partNum) - 1
  return `${start}-${end}`
}

// Function to set active question
const setActiveQuestion = (part, questionIndex) => {
  activePart.value = part
  activeQuestion.value = questionIndex
  activeGlobalQuestion.value = getGlobalQuestionNumber(part, questionIndex)

  // Scroll to the question element
  nextTick(() => {
    const questionElement = document.querySelector(
      `[data-question-number="${activeGlobalQuestion.value}"]`,
    )
    if (questionElement) {
      questionElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
}

// Function to get the global question number (1-40)
const getGlobalQuestionNumber = (part, questionIndex) => {
  let start = 1
  for (let i = 1; i < part; i++) {
    start += getPartQuestionCount(i)
  }
  return start + questionIndex
}

// Function to get part and local index from global question number
const getPartAndIndex = (globalQuestionNumber) => {
  let currentNum = 1
  let part = 1

  while (part <= 3) {
    const partQuestionCount = getPartQuestionCount(part)
    if (globalQuestionNumber < currentNum + partQuestionCount) {
      return { part, index: globalQuestionNumber - currentNum }
    }
    currentNum += partQuestionCount
    part++
  }

  // Default fallback
  return { part: 1, index: 0 }
}

// Function to set active question by global number
const setActiveQuestionByGlobalNumber = (globalQuestionNumber) => {
  const { part, index } = getPartAndIndex(globalQuestionNumber)
  activePart.value = part
  activeQuestion.value = index
  activeGlobalQuestion.value = globalQuestionNumber

  // Scroll to the question element
  nextTick(() => {
    const questionElement = document.querySelector(
      `[data-question-number="${globalQuestionNumber}"]`,
    )
    if (questionElement) {
      questionElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
}

// Text selection actions
const copyText = async () => {
  if (text.value) {
    try {
      await navigator.clipboard.writeText(text.value)
    } catch (err) {}
  }
}

const highlightText = () => {
  if (text.value) {
    highlightSelectedText()
  }
}
</script>

<template>
  <ExamLayout>
    <template #header>
      <ExamHeader title="Reading" :timer="true" @finish="handleFinish" />
    </template>
    <div class="min-w-0 flex-1 overflow-y-auto">
      <div class="h-full flex flex-col">
        <div v-if="isLoading" class="m-4 text-center py-12">
          <p class="text-lg text-gray-500">Loading reading test...</p>
        </div>
        <div v-else-if="error" class="m-4 text-center py-12">
          <p class="text-lg text-red-500">{{ error }}</p>
        </div>
        <Card
          v-else-if="currentPart"
          class="m-4 rounded-md shadow-none border px-4 py-3 bg-gray-100 dark:bg-[#1f2937] dark:border-[#1f2937]"
        >
          <CardContent>
            <h2 class="text-lg font-semibold">Part {{ activePart }}</h2>
            <p>Read the text and answer questions {{ getQuestionRange(activePart) }}.</p>
          </CardContent>
        </Card>

        <!----Main Content-->
        <ResizablePanelGroup
          id="handle-demo-group-1"
          direction="horizontal"
          class="flex flex-col h-full flex-1 w-full"
        >
          <ResizablePanel id="handle-demo-panel-1" :default-size="50">
            <ContextMenu>
              <ContextMenuTrigger>
                <ScrollArea class="mx-auto w-full h-full max-w-6xl px-2 py-2 md:px-4 min-w-80">
                  <div
                    v-if="currentPart?.passage"
                    v-html="currentPart.passage"
                    class="text-lg max-w-none dark:prose-invert"
                  ></div>
                  <div v-else class="text-center py-12">
                    <p class="text-gray-500">No passage available</p>
                  </div>
                </ScrollArea>
              </ContextMenuTrigger>

              <ContextMenuContent>
                <ContextMenuItem @click="highlightText">
                  <Highlighter class="text-black dark:text-white" /> Highlight
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem @click="copyText">
                  <Copy class="text-black dark:text-white" /> Copy
                  <ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem @click="clearHighlightSelection">
                  <Trash2Icon class="text-black dark:text-white" /> Clear All
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </ResizablePanel>
          <ResizableHandle id="handle-demo-handle-1" with-handle />
          <ResizablePanel id="handle-demo-panel-2" :default-size="50">
            <ContextMenu>
              <ContextMenuTrigger>
                <ScrollArea
                  class="mx-auto w-full h-full max-w-6xl px-2 py-4 md:px-4 md:py-6 min-w-80"
                >
                  <div v-if="currentPart?.question?.content">
                    <div
                      v-for="(section, index) in currentPart.question.content"
                      :key="section.id"
                      class="mb-8"
                    >
                      <!-- Selection Questions -->
                      <SelectionQuestion
                        v-if="section.type === 'selection'"
                        :question="section"
                        :starting-question-number="getSectionStartingQuestionNumber(index)"
                        :active-question-number="activeGlobalQuestion"
                        v-model="answers[section.id]"
                        @question-click="setActiveQuestionByGlobalNumber"
                      />

                      <!-- Completion Questions -->
                      <CompletionQuestion
                        v-if="section.type === 'completion'"
                        :question="section"
                        :starting-question-number="getSectionStartingQuestionNumber(index)"
                        :active-question-number="activeGlobalQuestion"
                        v-model="answers[section.id]"
                        @question-click="setActiveQuestionByGlobalNumber"
                      />

                      <!-- Multiple Choice Questions -->
                      <MultipleChoiceQuestion
                        v-if="section.type === 'multiple-choice'"
                        :question="section"
                        :starting-question-number="getSectionStartingQuestionNumber(index)"
                        :active-question-number="activeGlobalQuestion"
                        v-model="answers[section.id]"
                        @question-click="setActiveQuestionByGlobalNumber"
                      />

                      <!-- Draggable Selection Questions -->
                      <DraggableSelectionQuestion
                        v-if="section.type === 'draggable-selection'"
                        :question="section"
                        :starting-question-number="getSectionStartingQuestionNumber(index)"
                        :active-question-number="activeGlobalQuestion"
                        v-model="answers[section.id]"
                        @question-click="setActiveQuestionByGlobalNumber"
                      />
                    </div>
                  </div>
                  <div v-else class="text-center py-12">
                    <p class="text-gray-500">No questions available</p>
                  </div>
                </ScrollArea>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem @click="highlightText">
                  <Highlighter class="text-black dark:text-white" /> Highlight
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem @click="copyText">
                  <Copy class="text-black dark:text-white" /> Copy
                  <ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem @click="clearHighlightSelection">
                  <Trash2Icon class="text-black dark:text-white" /> Clear All
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </ResizablePanel>
        </ResizablePanelGroup>

        <!----Footer--->
        <div
          class="rounded-none border-t dark:border-t-gray-700 relative flex h-16 md:h-auto md:min-h-16 items-center justify-start md:justify-between overflow-x-auto gap-2 md:gap-4 px-2 md:px-6"
        >
          <!-- Part 1 -->
          <div
            v-if="activePart === 1"
            class="flex h-full shrink-0 md:flex-1 items-center gap-2 md:gap-4 text-nowrap p-2 cursor-pointer"
            @click="activePart = 1"
          >
            <span class="font-bold text-sm md:text-base">Part 1</span>
            <div
              class="flex gap-1 md:gap-2"
              v-for="(i, index) in getPartQuestionCount(1)"
              :key="index"
            >
              <div class="relative space-y-1">
                <div
                  :class="[
                    'absolute bottom-full h-1 w-full rounded-sm',
                    isQuestionAnswered(index + 1)
                      ? 'bg-green-500 dark:bg-green-600'
                      : 'bg-gray-200 dark:bg-gray-800',
                  ]"
                ></div>
                <Button
                  :class="[
                    'cursor-pointer rounded-lg h-7 w-7 md:h-8 md:w-8 text-xs md:text-sm shrink-0',
                    activeGlobalQuestion === index + 1
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 text-gray-800 dark:text-gray-200',
                  ]"
                  @click.stop="setActiveQuestionByGlobalNumber(index + 1)"
                >
                  {{ index + 1 }}
                </Button>
              </div>
            </div>
          </div>

          <div
            v-else
            class="flex h-full shrink-0 md:flex-1 items-center gap-2 md:gap-4 text-nowrap p-2 cursor-pointer"
            @click="activePart = 1"
          >
            <span class="font-bold text-sm md:text-base">Part 1</span>
            <span class="text-gray-500 text-xs md:text-sm"
              >{{ getPartQuestionCount(1) }} questions</span
            >
          </div>

          <!-- Part 2 -->
          <div
            v-if="activePart === 2"
            class="flex h-full shrink-0 md:flex-1 items-center gap-2 md:gap-4 text-nowrap p-2 cursor-pointer"
            @click="activePart = 2"
          >
            <span class="font-bold text-sm md:text-base">Part 2</span>
            <div
              class="flex gap-1 md:gap-2"
              v-for="(i, index) in getPartQuestionCount(2)"
              :key="index"
            >
              <div class="relative space-y-1">
                <div
                  :class="[
                    'absolute bottom-full h-1 w-full rounded-sm',
                    isQuestionAnswered(index + 1 + getPartQuestionCount(1))
                      ? 'bg-green-500 dark:bg-green-600'
                      : 'bg-gray-200 dark:bg-gray-800',
                  ]"
                ></div>
                <Button
                  :class="[
                    'cursor-pointer rounded-lg h-7 w-7 md:h-8 md:w-8 text-xs md:text-sm shrink-0',
                    activeGlobalQuestion === index + 1 + getPartQuestionCount(1)
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 text-gray-800 dark:text-gray-200',
                  ]"
                  @click.stop="setActiveQuestionByGlobalNumber(index + 1 + getPartQuestionCount(1))"
                >
                  {{ index + 1 + getPartQuestionCount(1) }}
                </Button>
              </div>
            </div>
          </div>

          <div
            v-else
            class="flex h-full shrink-0 md:flex-1 items-center gap-2 md:gap-4 text-nowrap p-2 cursor-pointer"
            @click="activePart = 2"
          >
            <span class="font-bold text-sm md:text-base">Part 2</span>
            <span class="text-gray-500 text-xs md:text-sm"
              >{{ getPartQuestionCount(2) }} questions</span
            >
          </div>

          <!-- Part 3 -->
          <div
            v-if="activePart === 3"
            class="flex h-full shrink-0 md:flex-1 items-center gap-2 md:gap-4 text-nowrap p-2 cursor-pointer"
            @click="activePart = 3"
          >
            <span class="font-bold text-sm md:text-base">Part 3</span>
            <div
              class="flex gap-1 md:gap-2"
              v-for="(i, index) in getPartQuestionCount(3)"
              :key="index"
            >
              <div class="relative space-y-1">
                <div
                  :class="[
                    'absolute bottom-full h-1 w-full rounded-sm',
                    isQuestionAnswered(
                      index + 1 + getPartQuestionCount(1) + getPartQuestionCount(2),
                    )
                      ? 'bg-green-500 dark:bg-green-600'
                      : 'bg-gray-200 dark:bg-gray-800',
                  ]"
                ></div>
                <Button
                  :class="[
                    'cursor-pointer rounded-lg h-7 w-7 md:h-8 md:w-8 text-xs md:text-sm shrink-0',
                    activeGlobalQuestion ===
                    index + 1 + getPartQuestionCount(1) + getPartQuestionCount(2)
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 text-gray-800 dark:text-gray-200',
                  ]"
                  @click.stop="
                    setActiveQuestionByGlobalNumber(
                      index + 1 + getPartQuestionCount(1) + getPartQuestionCount(2),
                    )
                  "
                >
                  {{ index + 1 + getPartQuestionCount(1) + getPartQuestionCount(2) }}
                </Button>
              </div>
            </div>
          </div>

          <div
            v-else
            class="flex h-full shrink-0 md:flex-1 items-center gap-2 md:gap-4 text-nowrap p-2 cursor-pointer"
            @click="activePart = 3"
          >
            <span class="font-bold text-sm md:text-base">Part 3</span>
            <span class="text-gray-500 text-xs md:text-sm"
              >{{ getPartQuestionCount(3) }} questions</span
            >
          </div>
        </div>
      </div>
    </div>
  </ExamLayout>
</template>

<style scoped>
.highlight {
  background: yellow;
  color: black;
  padding: 2px;
  border-radius: 2px;
}
</style>
