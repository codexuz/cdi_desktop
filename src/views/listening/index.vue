<template>
  <ExamLayout>
    <template #header>
      <ExamHeader title="Listening" :timer="false" />
    </template>
    <div class="min-w-0 flex-1 overflow-y-auto">
      <div class="h-full flex flex-col">
        <!-- Main Content -->
        <div class="flex-1 overflow-y-auto">
          <ScrollArea class="mx-auto w-full h-full max-w-6xl px-2 py-4 md:px-4 md:py-6">
            <div v-if="isLoading" class="text-center py-12">
              <p class="text-lg text-gray-500">Loading listening test...</p>
            </div>
            <div v-else-if="error" class="text-center py-12">
              <p class="text-lg text-red-500">{{ error }}</p>
            </div>
            <ContextMenu v-else-if="listeningData">
              <ContextMenuTrigger>
                <div>
                  <!-- Render questions based on active part -->

                  <!-- Header Card -->
                  <Card
                    class="mb-6 rounded-md shadow-none border px-4 py-3 bg-gray-100 dark:bg-[#1f2937] dark:border-[#1f2937]"
                  >
                    <CardContent>
                      <div class="flex items-center justify-between">
                        <div>
                          <h2 class="text-lg font-semibold">Part {{ activePart }}</h2>
                          <p>Listen and answer questions {{ getPartQuestionRange() }}.</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <div v-for="part in listeningData.parts" :key="part.id">
                    <div v-if="part.part === `PART_${activePart}`">
                      <div
                        v-for="(section, index) in part.question.content"
                        :key="section.id"
                        class="mb-8"
                      >
                        <!-- Multiple Choice -->
                        <MultipleChoice
                          v-if="section.type === 'multiple-choice'"
                          :title="section.title"
                          :condition="section.condition"
                          :questions="section.questions"
                          :start-number="getStartNumber(part.part, index)"
                          :active-question-number="activeGlobalQuestion"
                          v-model="answers[part.id][section.id]"
                          @register-refs="registerQuestionRefs"
                          @question-click="setActiveQuestionByGlobalNumber"
                        />
                        <!-- Selection -->
                        <Selection
                          v-else-if="section.type === 'selection'"
                          :title="section.title"
                          :condition="section.condition"
                          :content="section.content"
                          :options="section.options"
                          :show-options="section.showOptions"
                          :options-title="section.optionsTitle"
                          :start-number="getStartNumber(part.part, index)"
                          :active-question-number="activeGlobalQuestion"
                          v-model="answers[part.id][section.id]"
                          @register-refs="registerQuestionRefs"
                          @question-click="setActiveQuestionByGlobalNumber"
                        />
                        <!-- Completion -->
                        <Completion
                          v-else-if="section.type === 'completion'"
                          :title="section.title"
                          :condition="section.condition"
                          :content="section.content"
                          :start-number="getStartNumber(part.part, index)"
                          :active-question-number="activeGlobalQuestion"
                          v-model="answers[part.id][section.id]"
                          @register-refs="registerQuestionRefs"
                          @question-click="setActiveQuestionByGlobalNumber"
                        />
                        <!-- Multi Select -->
                        <MultiSelect
                          v-else-if="section.type === 'multi-select'"
                          :title="section.title"
                          :condition="section.condition"
                          :options="section.options"
                          :limit="section.limit || 3"
                          :start-number="getStartNumber(part.part, index)"
                          :active-question-number="activeGlobalQuestion"
                          v-model="answers[part.id][section.id]"
                          @register-refs="registerQuestionRefs"
                          @question-click="setActiveQuestionByGlobalNumber"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem @click="highlightText">
                  <Highlighter class="mr-2 h-4 w-4" />
                  Highlight
                </ContextMenuItem>
                <ContextMenuItem @click="copyText">
                  <Copy class="mr-2 h-4 w-4" />
                  Copy
                </ContextMenuItem>
                <ContextMenuItem @click="clearHighlightSelection">
                  <Trash2Icon class="mr-2 h-4 w-4" />
                  Clear Highlights
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </ScrollArea>
        </div>

        <!-- Footer Navigation -->
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

          <!-- Part 4 -->
          <div
            v-if="activePart === 4"
            class="flex h-full shrink-0 md:flex-1 items-center gap-2 md:gap-4 text-nowrap p-2 cursor-pointer"
            @click="activePart = 4"
          >
            <span class="font-bold text-sm md:text-base">Part 4</span>
            <div
              class="flex gap-1 md:gap-2"
              v-for="(i, index) in getPartQuestionCount(4)"
              :key="index"
            >
              <div class="relative space-y-1">
                <div
                  :class="[
                    'absolute bottom-full h-1 w-full rounded-sm',
                    isQuestionAnswered(
                      index +
                        1 +
                        getPartQuestionCount(1) +
                        getPartQuestionCount(2) +
                        getPartQuestionCount(3),
                    )
                      ? 'bg-green-500 dark:bg-green-600'
                      : 'bg-gray-200 dark:bg-gray-800',
                  ]"
                ></div>
                <Button
                  :class="[
                    'cursor-pointer rounded-lg h-7 w-7 md:h-8 md:w-8 text-xs md:text-sm shrink-0',
                    activeGlobalQuestion ===
                    index +
                      1 +
                      getPartQuestionCount(1) +
                      getPartQuestionCount(2) +
                      getPartQuestionCount(3)
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 text-gray-800 dark:text-gray-200',
                  ]"
                  @click.stop="
                    setActiveQuestionByGlobalNumber(
                      index +
                        1 +
                        getPartQuestionCount(1) +
                        getPartQuestionCount(2) +
                        getPartQuestionCount(3),
                    )
                  "
                >
                  {{
                    index +
                    1 +
                    getPartQuestionCount(1) +
                    getPartQuestionCount(2) +
                    getPartQuestionCount(3)
                  }}
                </Button>
              </div>
            </div>
          </div>
          <div
            v-else
            class="flex h-full shrink-0 md:flex-1 items-center gap-2 md:gap-4 text-nowrap p-2 cursor-pointer"
            @click="activePart = 4"
          >
            <span class="font-bold text-sm md:text-base">Part 4</span>
            <span class="text-gray-500 text-xs md:text-sm"
              >{{ getPartQuestionCount(4) }} questions</span
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Hidden Audio Element -->
    <audio
      ref="audioPlayer"
      @timeupdate="updateTime"
      @loadedmetadata="updateDuration"
      @ended="onAudioEnd"
    ></audio>

    <!-- Full Audio Player (hidden) -->
    <audio
      v-if="listeningData?.full_audio_url"
      ref="fullAudioPlayer"
      :src="listeningData.full_audio_url"
      @play="showFullAudioModal = false"
      @ended="onFullAudioEnded"
    ></audio>

    <!-- Full Audio Modal -->
    <Dialog v-model:open="showFullAudioModal">
      <DialogContent
        class="max-w-md border-none bg-black/80 backdrop-blur-sm p-0"
        @interact-outside="(e) => e.preventDefault()"
        @escape-key-down="(e) => e.preventDefault()"
      >
        <div class="flex items-center justify-center h-[300px]">
          <Button
            @click="playFullAudio"
            size="icon"
            class="h-24 w-24 rounded-full bg-white hover:bg-gray-100 text-black shadow-2xl"
          >
            <Play class="h-12 w-12" :fill="'currentColor'" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </ExamLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { get, post } from '@/utils/api'
import ExamLayout from '@/layouts/ExamLayout.vue'
import ExamHeader from '@/components/ExamHeader.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Play, Pause, Volume2, VolumeX, Copy, Highlighter, Trash2Icon } from 'lucide-vue-next'
import { useTextSelection } from '@vueuse/core'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import MultipleChoice from '@/components/listening/MultipleChoice.vue'
import Selection from '@/components/listening/Selection.vue'
import Completion from '@/components/listening/Completion.vue'
import MultiSelect from '@/components/listening/MultiSelect.vue'
import { useExamAnswersStore } from '@/stores/examAnswers'

const { text } = useTextSelection()
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

const copyText = async () => {
  if (text.value) {
    try {
      await navigator.clipboard.writeText(text.value)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }
}

const highlightText = () => {
  if (text.value) {
    highlightSelectedText()
  }
}

const route = useRoute()
const router = useRouter()
const examAnswersStore = useExamAnswersStore()

const isLoading = ref(true)
const error = ref('')
const listeningData = ref<any>(null)
const answers = ref<Record<string, any>>({})

const activePart = ref(parseInt(route.query.part as string) || 1)
const activeQuestion = ref(parseInt(route.query.question as string) || 0)
const activeGlobalQuestion = ref(1) // Track the global question number (1-40)
const questionRefs = ref<Record<number, HTMLElement>>({})

// Audio player state
const audioPlayer = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)
const isMuted = ref(false)
const currentTime = ref(0)
const duration = ref(0)

// Full audio modal state
const showFullAudioModal = ref(true)
const fullAudioPlayer = ref<HTMLAudioElement | null>(null)
const isFullAudioPlaying = ref(false)

const progressPercent = computed(() => {
  return duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0
})

// Full audio controls
const playFullAudio = () => {
  if (fullAudioPlayer.value && listeningData.value?.full_audio_url) {
    fullAudioPlayer.value.play()
    isFullAudioPlaying.value = true
    // Modal will hide automatically via @play event
  }
}

const toggleFullAudioPlay = () => {
  if (!fullAudioPlayer.value) return
  if (isFullAudioPlaying.value) {
    fullAudioPlayer.value.pause()
  } else {
    fullAudioPlayer.value.play()
  }
  isFullAudioPlaying.value = !isFullAudioPlaying.value
}

const onFullAudioEnded = () => {
  isFullAudioPlaying.value = false
}

// Fetch listening test data
onMounted(async () => {
  try {
    const response = await get('/student/listening')
    listeningData.value = response.data

    // Load saved answers from store
    const savedAnswers = examAnswersStore.getListeningAnswers()

    // Initialize answers object
    if (listeningData.value?.parts) {
      for (const part of listeningData.value.parts) {
        answers.value[part.id] = savedAnswers[part.id] || {}
        if (part.question?.content) {
          for (const section of part.question.content) {
            if (!answers.value[part.id][section.id]) {
              // Initialize all types as object
              answers.value[part.id][section.id] = {}
            }
          }
        }
      }
    }

    // Scroll to active question after refs are registered
    setTimeout(() => {
      const absoluteQuestionNum = calculateAbsoluteQuestionNumber(
        activePart.value,
        activeQuestion.value,
      )
      const element = questionRefs.value[absoluteQuestionNum]
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 100)
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Failed to load listening test.'
  } finally {
    isLoading.value = false
  }
})

// Watch route query parameters
watch(
  () => route.query,
  (query) => {
    if (query.part) {
      activePart.value = parseInt(query.part as string)
    }
    if (query.question !== undefined) {
      activeQuestion.value = parseInt(query.question as string)

      // Scroll to question
      setTimeout(() => {
        const absoluteQuestionNum = calculateAbsoluteQuestionNumber(
          activePart.value,
          activeQuestion.value,
        )
        const element = questionRefs.value[absoluteQuestionNum]
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 50)
    }
  },
)

// Watch active part and question to update URL
watch([activePart, activeQuestion], ([newPart, newQuestion]) => {
  router.push({
    query: {
      part: newPart.toString(),
      question: newQuestion.toString(),
    },
  })
})

// Watch answers and save to store
watch(
  answers,
  (newAnswers) => {
    examAnswersStore.setListeningAnswers(newAnswers)
  },
  { deep: true },
)

// Watch active part and load audio
watch(activePart, (newPart) => {
  if (listeningData.value?.parts) {
    const part = listeningData.value.parts.find((p: any) => p.part === `PART_${newPart}`)
    if (part?.audio?.url && audioPlayer.value) {
      audioPlayer.value.src = part.audio.url
      audioPlayer.value.load()
      isPlaying.value = false
    }
  }
})

// Audio controls
const togglePlay = () => {
  if (!audioPlayer.value) return
  if (isPlaying.value) {
    audioPlayer.value.pause()
  } else {
    audioPlayer.value.play()
  }
  isPlaying.value = !isPlaying.value
}

const toggleMute = () => {
  if (!audioPlayer.value) return
  audioPlayer.value.muted = !audioPlayer.value.muted
  isMuted.value = audioPlayer.value.muted
}

const updateTime = () => {
  if (audioPlayer.value) {
    currentTime.value = audioPlayer.value.currentTime
  }
}

const updateDuration = () => {
  if (audioPlayer.value) {
    duration.value = audioPlayer.value.duration
  }
}

const seekAudio = (event: MouseEvent) => {
  if (!audioPlayer.value) return
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const percent = (event.clientX - rect.left) / rect.width
  audioPlayer.value.currentTime = percent * duration.value
}

const onAudioEnd = () => {
  isPlaying.value = false
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Helper functions
const getPartQuestionCount = (part: number) => {
  if (!listeningData.value?.parts) return 0
  const partData = listeningData.value.parts.find((p: any) => p.part === `PART_${part}`)
  return partData?.question?.number_of_questions || 10
}

const getPartQuestionRange = () => {
  const start =
    Array.from({ length: activePart.value - 1 }, (_, i) => getPartQuestionCount(i + 1)).reduce(
      (a, b) => a + b,
      0,
    ) + 1
  const end = start + getPartQuestionCount(activePart.value) - 1
  return `${start}-${end}`
}

const setActiveQuestion = (part: number, questionIndex: number) => {
  activePart.value = part
  activeQuestion.value = questionIndex

  // Calculate absolute question number and scroll to it
  const absoluteQuestionNum =
    Array.from({ length: part - 1 }, (_, i) => getPartQuestionCount(i + 1)).reduce(
      (a, b) => a + b,
      0,
    ) +
    questionIndex +
    1

  const element = questionRefs.value[absoluteQuestionNum]
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

const getStartNumber = (partName: string, sectionIndex: number) => {
  const partNum = parseInt(partName.replace('PART_', ''))

  // Start with cumulative count from all previous parts
  let start = 1
  for (let i = 1; i < partNum; i++) {
    start += getPartQuestionCount(i)
  }

  // Add questions from previous sections within the same part
  if (listeningData.value?.parts) {
    const currentPart = listeningData.value.parts.find((p: any) => p.part === partName)
    if (currentPart?.question?.content) {
      for (let i = 0; i < sectionIndex; i++) {
        const section = currentPart.question.content[i]
        if (section.type === 'multiple-choice') {
          start += section.questions?.length || 0
        } else if (section.type === 'multi-select') {
          start += section.limit || 3
        } else if (section.type === 'selection' || section.type === 'completion') {
          const matches = section.content?.match(/@@/g)
          start += matches ? matches.length : 0
        }
      }
    }
  }

  return start
}

const registerQuestionRefs = (refs: Record<number, HTMLElement>) => {
  questionRefs.value = { ...questionRefs.value, ...refs }
}

const calculateAbsoluteQuestionNumber = (part: number, questionIndex: number) => {
  let start = 1
  for (let i = 1; i < part; i++) {
    start += getPartQuestionCount(i)
  }
  return start + questionIndex
}

const setActiveQuestionByGlobalNumber = (globalQuestionNumber: number) => {
  // Find which part this question belongs to
  let currentNum = 1
  let part = 1

  while (part <= 4) {
    const partQuestionCount = getPartQuestionCount(part)
    if (globalQuestionNumber < currentNum + partQuestionCount) {
      activePart.value = part
      activeQuestion.value = globalQuestionNumber - currentNum
      activeGlobalQuestion.value = globalQuestionNumber

      // Scroll to question
      const element = questionRefs.value[globalQuestionNumber]
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }
    currentNum += partQuestionCount
    part++
  }
}

// Check if a specific question number has been answered
const isQuestionAnswered = (globalQuestionNumber: number) => {
  if (!listeningData.value?.parts) return false

  let currentQuestionNum = 1

  // Sort parts by part number to ensure correct order
  const sortedParts = [...listeningData.value.parts].sort((a, b) => {
    const partNumA = parseInt(a.part.replace('PART_', ''))
    const partNumB = parseInt(b.part.replace('PART_', ''))
    return partNumA - partNumB
  })

  for (const part of sortedParts) {
    if (!part.question?.content) continue

    for (const section of part.question.content) {
      // Calculate section question count
      let sectionQuestionCount = 0
      if (section.type === 'multiple-choice') {
        sectionQuestionCount = section.questions?.length || 0
      } else if (section.type === 'multi-select') {
        sectionQuestionCount = section.limit || 3
      } else if (section.type === 'selection' || section.type === 'completion') {
        const matches = section.content?.match(/@@/g)
        sectionQuestionCount = matches ? matches.length : 0
      }

      // Check if this global question number falls within this section
      if (
        globalQuestionNumber >= currentQuestionNum &&
        globalQuestionNumber < currentQuestionNum + sectionQuestionCount
      ) {
        const sectionAnswers = answers.value[part.id]?.[section.id]

        if (!sectionAnswers) return false

        // For multiple-choice: answers are keyed by question.id
        if (section.type === 'multiple-choice' && section.questions) {
          const localIndex = globalQuestionNumber - currentQuestionNum
          const question = section.questions[localIndex]
          if (question) {
            const answer = sectionAnswers[question.id]
            return (
              answer !== undefined &&
              answer !== null &&
              answer !== '' &&
              answer.toString().trim() !== ''
            )
          }
          return false
        }

        // For selection, completion, multi-select: check by global question number
        if (typeof sectionAnswers === 'object' && !Array.isArray(sectionAnswers)) {
          const answer = sectionAnswers[globalQuestionNumber]
          return (
            answer !== undefined &&
            answer !== null &&
            answer !== '' &&
            answer.toString().trim() !== ''
          )
        }

        // For array-based answers
        if (Array.isArray(sectionAnswers)) {
          const localIndex = globalQuestionNumber - currentQuestionNum
          const answer = sectionAnswers[localIndex]
          return (
            answer !== undefined &&
            answer !== null &&
            answer !== '' &&
            answer.toString().trim() !== ''
          )
        }

        return false
      }

      currentQuestionNum += sectionQuestionCount
    }
  }

  return false
}

</script>

<style scoped>
/* Highlight styles */
:deep(mark.highlight) {
  background-color: yellow;
  color: black;
}
</style>
