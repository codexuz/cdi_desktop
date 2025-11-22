<template>
  <div class="completion">
    <div class="question-header font-bold text-gray-800 dark:text-gray-200 mb-4">
      <h3 class="text-3xl">{{ title }}</h3>
      <p v-if="condition" class="condition text-gray-600 dark:text-gray-300" v-html="condition"></p>
    </div>
    <div class="content text-[#374151] dark:text-gray-400" ref="contentContainer"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'

interface Props {
  title: string
  condition?: string
  content: string
  startNumber: number
  modelValue?: Record<string, string>
  activeQuestionNumber?: number
}

const props = withDefaults(defineProps<Props>(), {
  condition: '',
  modelValue: () => ({}),
  activeQuestionNumber: 1,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: Record<string, string>): void
  (e: 'register-refs', refs: Record<number, HTMLElement>): void
  (e: 'question-click', questionNumber: number): void
}>()

const contentContainer = ref<HTMLElement | null>(null)
const inputElements = ref<HTMLInputElement[]>([])

// Count the number of blanks in the content
const blankCount = computed(() => {
  const matches = props.content.match(/@@/g)
  return matches ? matches.length : 0
})

// Render content with input fields
const renderContent = () => {
  if (!contentContainer.value) return

  let content = props.content
  let blankIndex = 0
  const tempDiv = document.createElement('div')

  // Replace @@ with placeholder spans
  content = content.replace(/@@/g, () => {
    return `<span data-input-placeholder="${blankIndex++}"></span>`
  })

  tempDiv.innerHTML = content
  contentContainer.value.innerHTML = ''
  contentContainer.value.appendChild(tempDiv)

  // Now replace placeholders with actual input elements
  const placeholders = contentContainer.value.querySelectorAll('[data-input-placeholder]')
  inputElements.value = []

  placeholders.forEach((placeholder) => {
    const index = parseInt(placeholder.getAttribute('data-input-placeholder') || '0')
    const questionNumber = props.startNumber + index
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
    input.value = props.modelValue[questionNumber] || ''

    // Handle input changes
    input.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement
      const qNum = parseInt(target.getAttribute('data-question-number') || '0')
      const newAnswers = { ...props.modelValue, [qNum]: target.value }
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
    if (newValue) {
      // Update input values
      inputElements.value.forEach((input, index) => {
        if (input) {
          const questionNumber = props.startNumber + index
          const value = newValue[questionNumber]
          if (value !== undefined && input.value !== value) {
            input.value = value
          }
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
        const questionNumber = props.startNumber + index
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

// Register refs for scrolling
const registerRefs = () => {
  const refs: Record<number, HTMLElement> = {}
  inputElements.value.forEach((input, index) => {
    const questionNumber = props.startNumber + index
    refs[questionNumber] = input
  })
  emit('register-refs', refs)
}

// Initialize content when component mounts
onMounted(() => {
  renderContent()
  nextTick(() => {
    registerRefs()
  })
})

// Re-render when question content changes
watch(
  () => props.content,
  () => {
    nextTick(() => {
      renderContent()
      registerRefs()
    })
  },
)
</script>

<style scoped>
.completion {
  margin-bottom: 32px;
}

.question-header h3 {
  font-size: 1.3rem;
  margin-bottom: 12px;
}

.condition {
  margin-bottom: 16px;
  font-style: italic;
}

.content {
  line-height: 1.8;
}

.content :deep(.question-wrapper) {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.content :deep(p) {
  margin-bottom: 12px;
}

.content :deep(ul) {
  list-style-position: inside;
}

.content :deep(li) {
  margin-bottom: 8px;
}
</style>
