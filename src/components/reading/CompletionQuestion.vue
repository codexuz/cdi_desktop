<template>
  <div class="completion px-3 mb-8">
    <!-- Title and Condition -->
    <div class="question-header font-bold text-gray-800 dark:text-gray-200 mb-4">
      <h3 v-if="question.title" class="text-xl mb-3">{{ question.title }}</h3>
      <p
        v-if="question.condition"
        class="condition text-gray-600 dark:text-gray-300 italic"
        v-html="question.condition"
      ></p>
    </div>

    <!-- Question Content -->
    <div class="content text-[#374151] dark:text-gray-400" ref="contentContainer"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
interface CompletionQuestion {
  id: string
  type: 'completion'
  title?: string
  condition?: string
  content: string
}

interface Props {
  question: CompletionQuestion
  modelValue?: string[]
  showAnswers?: boolean
  startingQuestionNumber?: number
  activeQuestionNumber?: number
}

interface Emits {
  (e: 'update:modelValue', value: string[]): void
  (e: 'question-click', questionNumber: number): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  showAnswers: false,
  startingQuestionNumber: 1,
  activeQuestionNumber: 1,
})

const emit = defineEmits<Emits>()

const answers = ref<string[]>([])
const contentContainer = ref<HTMLElement | null>(null)
const inputElements = ref<HTMLInputElement[]>([])

// Count the number of blanks in the content
const blankCount = computed(() => {
  const matches = props.question.content.match(/@@/g)
  return matches ? matches.length : 0
})

// Render content with input fields
const renderContent = () => {
  if (!contentContainer.value) return

  let content = props.question.content
  let blankIndex = 0
  const tempDiv = document.createElement('div')

  // Replace @@ with placeholder spans
  content = content.replace(/@@/g, () => {
    return `<span data-input-placeholder="${blankIndex++}"></span>`
  })

  tempDiv.innerHTML = content
  contentContainer.value.innerHTML = ''
  contentContainer.value.appendChild(tempDiv)

  // Initialize answers array with correct length
  const newAnswers = new Array(blankCount.value).fill('')

  // Preserve existing values from props or current state
  const existingAnswers =
    props.modelValue && Array.isArray(props.modelValue) ? props.modelValue : answers.value

  existingAnswers.forEach((val, i) => {
    if (i < blankCount.value && val) {
      newAnswers[i] = val
    }
  })

  answers.value = newAnswers

  // Now replace placeholders with actual input elements
  const placeholders = contentContainer.value.querySelectorAll('[data-input-placeholder]')
  inputElements.value = []

  placeholders.forEach((placeholder) => {
    const index = parseInt(placeholder.getAttribute('data-input-placeholder') || '0')
    const questionNumber = props.startingQuestionNumber + index
    const isActive = props.activeQuestionNumber === questionNumber

    const input = document.createElement('input')
    input.type = 'text'
    input.className = `blank-input my-1 text-center text-slate-900 dark:text-white border-2 rounded-sm focus:outline-none px-2 py-1 transition-colors ${
      isActive
        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
        : 'border-gray-300 dark:border-slate-600 focus:border-blue-500'
    }`
    input.setAttribute('data-blank-index', index.toString())
    input.setAttribute('data-question-number', questionNumber.toString())
    input.placeholder = questionNumber.toString()
    input.value = answers.value[index] || ''

    // Handle input changes
    input.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement
      const idx = parseInt(target.getAttribute('data-blank-index') || '0')
      const newAnswers = [...answers.value]
      newAnswers[idx] = target.value
      answers.value = newAnswers
      emit('update:modelValue', newAnswers)
    })

    // Handle click to activate question
    input.addEventListener('click', () => {
      emit('question-click', questionNumber)
    })

    placeholder.parentNode?.replaceChild(input, placeholder)
    inputElements.value.push(input)
  })
}

// Watch for changes in modelValue prop
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && Array.isArray(newValue)) {
      answers.value = [...newValue]
      // Update input values
      inputElements.value.forEach((input, index) => {
        if (input && answers.value[index] !== undefined) {
          input.value = answers.value[index]
        }
      })
    }
  },
)

// Watch for active question changes to update styling
watch(
  () => props.activeQuestionNumber,
  () => {
    inputElements.value.forEach((input, index) => {
      if (input) {
        const questionNumber = props.startingQuestionNumber + index
        const isActive = props.activeQuestionNumber === questionNumber
        if (isActive) {
          input.className =
            'blank-input my-1 text-center text-slate-900 dark:text-white border-2 rounded-sm focus:outline-none px-2 py-1 transition-colors border-blue-500 bg-blue-50 dark:bg-blue-900/20'
        } else {
          input.className =
            'blank-input my-1 text-center text-slate-900 dark:text-white border-2 rounded-sm focus:outline-none px-2 py-1 transition-colors border-gray-300 dark:border-slate-600 focus:border-blue-500'
        }
      }
    })
  },
)

// Initialize content when component mounts
onMounted(() => {
  renderContent()
})

// Re-render when question content changes
watch(
  () => props.question.content,
  () => {
    nextTick(() => {
      renderContent()
    })
  },
)
</script>
