<script setup>
import { ref, computed, onMounted } from 'vue'
import { get } from '@/utils/api'
// Import other UI components
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { useTextSelection } from '@vueuse/core'
import ExamLayout from '@/layouts/ExamLayout.vue'
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

// Reading test data
const isLoading = ref(true)
const error = ref('')
const readingData = ref(null)

// Fetch reading test data
onMounted(async () => {
  try {
    const response = await get('/student/reading')
    readingData.value = response.data
  } catch (err) {
    error.value = err?.response?.data?.message || 'Failed to load reading test.'
  } finally {
    isLoading.value = false
  }
})

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

// Reactive state for active part and question
const activePart = ref(1)
const activeQuestion = ref(0)

// Answers storage
const answers = ref({})

// Current part data
const currentPart = computed(() => {
  if (!readingData.value?.parts) return null
  return readingData.value.parts.find((p) => p.part === `PART_${activePart.value}`)
})

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
}

// Function to get the global question number (1-40)
const getGlobalQuestionNumber = (part, questionIndex) => {
  switch (part) {
    case 1:
      return questionIndex + 1
    case 2:
      return questionIndex + 14
    case 3:
      return questionIndex + 27
    default:
      return questionIndex + 1
  }
}

// Function to get part and local index from global question number
const getPartAndIndex = (globalQuestionNumber) => {
  if (globalQuestionNumber <= 13) {
    return { part: 1, index: globalQuestionNumber - 1 }
  } else if (globalQuestionNumber <= 26) {
    return { part: 2, index: globalQuestionNumber - 14 }
  } else {
    return { part: 3, index: globalQuestionNumber - 27 }
  }
}

// Function to set active question by global number
const setActiveQuestionByGlobalNumber = (globalQuestionNumber) => {
  const { part, index } = getPartAndIndex(globalQuestionNumber)
  activePart.value = part
  activeQuestion.value = index
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
  <ExamLayout title="Reading">
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
                        v-model="answers[section.id]"
                      />

                      <!-- Completion Questions -->
                      <CompletionQuestion
                        v-if="section.type === 'completion'"
                        :question="section"
                        v-model="answers[section.id]"
                      />

                      <!-- Multiple Choice Questions -->
                      <MultipleChoiceQuestion
                        v-if="section.type === 'multiple-choice'"
                        :question="section"
                        v-model="answers[section.id]"
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
          class="rounded-none border-t dark:border-t-gray-700 relative flex h-16 items-center justify-between space-x-4"
        >
          <!-- Part 1 -->
          <div
            v-if="activePart === 1"
            class="flex h-full flex-1 items-center gap-4 text-nowrap p-2 cursor-pointer"
            @click="activePart = 1"
          >
            <span class="font-bold">Part 1</span>
            <div class="flex gap-2" v-for="(i, index) in getPartQuestionCount(1)" :key="index">
              <div class="relative space-y-1">
                <div
                  class="absolute bottom-full h-1 w-full rounded-sm bg-gray-200 dark:bg-gray-800"
                ></div>
                <Button
                  :class="[
                    'cursor-pointer rounded-lg h-8 w-8',
                    activeQuestion === index && activePart === 1
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 text-gray-800 dark:text-gray-200',
                  ]"
                  @click.stop="setActiveQuestion(1, index)"
                >
                  {{ index + 1 }}
                </Button>
              </div>
            </div>
          </div>

          <div
            v-else
            class="flex h-full flex-1 items-center gap-4 text-nowrap p-2 cursor-pointer"
            @click="activePart = 1"
          >
            <span class="font-bold">Part 1</span>
            <span class="text-gray-500">{{ getPartQuestionCount(1) }} questions</span>
          </div>

          <!-- Part 2 -->
          <div
            v-if="activePart === 2"
            class="flex h-full flex-1 items-center gap-4 text-nowrap p-2 cursor-pointer"
            @click="activePart = 2"
          >
            <span class="font-bold">Part 2</span>
            <div class="flex gap-2" v-for="(i, index) in getPartQuestionCount(2)" :key="index">
              <div class="relative space-y-1">
                <div
                  class="absolute bottom-full h-1 w-full rounded-sm bg-gray-200 dark:bg-gray-800"
                ></div>
                <Button
                  :class="[
                    'cursor-pointer rounded-lg h-8 w-8',
                    activeQuestion === index && activePart === 2
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 text-gray-800 dark:text-gray-200',
                  ]"
                  @click.stop="setActiveQuestion(2, index)"
                >
                  {{ index + 1 + getPartQuestionCount(1) }}
                </Button>
              </div>
            </div>
          </div>

          <div
            v-else
            class="flex h-full flex-1 items-center gap-4 text-nowrap p-2 cursor-pointer"
            @click="activePart = 2"
          >
            <span class="font-bold">Part 2</span>
            <span class="text-gray-500">{{ getPartQuestionCount(2) }} questions</span>
          </div>

          <!-- Part 3 -->
          <div
            v-if="activePart === 3"
            class="flex h-full flex-1 items-center gap-4 text-nowrap p-2 cursor-pointer"
            @click="activePart = 3"
          >
            <span class="font-bold">Part 3</span>
            <div class="flex gap-2" v-for="(i, index) in getPartQuestionCount(3)" :key="index">
              <div class="relative space-y-1">
                <div
                  class="absolute bottom-full h-1 w-full rounded-sm bg-gray-200 dark:bg-gray-800"
                ></div>
                <Button
                  :class="[
                    'cursor-pointer rounded-lg h-8 w-8',
                    activeQuestion === index && activePart === 3
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 text-gray-800 dark:text-gray-200',
                  ]"
                  @click.stop="setActiveQuestion(3, index)"
                >
                  {{ index + 1 + getPartQuestionCount(1) + getPartQuestionCount(2) }}
                </Button>
              </div>
            </div>
          </div>

          <div
            v-else
            class="flex h-full flex-1 items-center gap-4 text-nowrap p-2 cursor-pointer"
            @click="activePart = 3"
          >
            <span class="font-bold">Part 3</span>
            <span class="text-gray-500">{{ getPartQuestionCount(3) }} questions</span>
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
