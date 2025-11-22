<template>
  <div class="selection-question bg-white dark:bg-gray-800 p-6">
    <!-- Title -->
    <h3 v-if="question.title" class="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
      {{ question.title }}
    </h3>

    <!-- Condition/Instructions -->
    <div
      v-if="question.condition"
      class="instructions mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-400 dark:border-blue-500 rounded"
      v-html="question.condition"
    />

    <!-- Questions -->
    <div class="space-y-3">
      <div v-if="processedQuestions.length > 0">
        <div
          v-for="(questionItem, index) in processedQuestions"
          :key="index"
          class="flex items-start gap-3"
        >
          <!-- Question Number and Text -->
          <div class="flex-1">
            <span class="font-medium text-gray-800 dark:text-gray-200">{{ index + 1 }}.</span>
            <span class="text-gray-700 dark:text-gray-300 ml-1">{{ questionItem.text }}</span>
          </div>

          <!-- Inline Select -->
          <select
            v-model="selectedAnswers[index]"
            @change="updateAnswer(index, selectedAnswers[index] || '')"
            class="px-6 py-1.5 my-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="">Select</option>
            <option v-for="option in availableOptions" :key="option.value" :value="option.value">
              {{ option.value }}
               {{ option.label }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Answer Summary -->
    <div v-if="showAnswers" class="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <h4 class="font-semibold mb-3 text-gray-800 dark:text-gray-200">Your Answers:</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        <div
          v-for="(answer, index) in selectedAnswers"
          :key="index"
          class="flex items-center justify-between bg-white dark:bg-gray-600 p-3 rounded border border-gray-200 dark:border-gray-500"
        >
          <span class="font-medium text-gray-800 dark:text-gray-200">Q{{ index + 1 }}:</span>
          <span
            class="font-bold"
            :class="
              answer ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'
            "
          >
            {{ answer || 'Not answered' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
interface SelectionOption {
  id: string
  value: string
  label: string
}

interface SelectionQuestion {
  id: string
  type: 'selection'
  title?: string
  condition?: string
  content: string
  options?: SelectionOption[]
  showOptions?: boolean
}

interface Props {
  question: SelectionQuestion
  modelValue?: string[]
  showAnswers?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string[]): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  showAnswers: false,
})

const emit = defineEmits<Emits>()

// Default options for YES/NO/NOT GIVEN questions
const defaultOptions = [
  { value: 'YES', label: 'if the statement agrees with the information' },
  { value: 'NO', label: 'if the statement contradicts the information' },
  { value: 'NOT GIVEN', label: 'if there is no information on this' },
]

// Use provided options or default ones
const availableOptions = computed(() => {
  return props.question.options && props.question.options.length > 0
    ? props.question.options
    : defaultOptions
})

// Process content to extract individual questions
const processedQuestions = computed(() => {
  const content = props.question.content

  // Split by @@ markers to get individual questions
  const parts = content.split('@@')
  const questions = []

  for (let i = 0; i < parts.length - 1; i++) {
    const beforeMarker = parts[i]
    const afterMarker = parts[i + 1]

    // Extract the question text (usually the text right before @@)
    const lines = beforeMarker ? beforeMarker.split(/\n|<br>|<\/p>/) : []
    let questionText = ''

    // Find the last non-empty line as the question
    for (let j = lines.length - 1; j >= 0; j--) {
      const line = lines[j]
      if (line) {
        const cleanLine = line.replace(/<[^>]*>/g, '').trim()
        if (cleanLine && !cleanLine.includes('line-height') && !cleanLine.includes('style=')) {
          questionText = cleanLine
          break
        }
      }
    }

    if (questionText) {
      questions.push({
        text: questionText,
        index: i,
      })
    }
  }

  return questions
})

const selectedAnswers = ref<string[]>(
  props.modelValue?.slice(0, processedQuestions.value.length) ||
    new Array(processedQuestions.value.length).fill(''),
)

const updateAnswer = (questionIndex: number, value: string) => {
  selectedAnswers.value[questionIndex] = value
  emit('update:modelValue', [...selectedAnswers.value])
}

// Watch for changes in modelValue prop
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && Array.isArray(newValue)) {
      selectedAnswers.value = newValue.slice(0, processedQuestions.value.length)
    }
  },
  { immediate: true },
)

// Update selectedAnswers array length when processedQuestions changes
watch(
  processedQuestions,
  (newQuestions) => {
    const currentLength = selectedAnswers.value.length
    const newLength = newQuestions.length

    if (newLength !== currentLength) {
      selectedAnswers.value = new Array(newLength)
        .fill('')
        .map((_, index) => selectedAnswers.value[index] || '')
    }
  },
  { immediate: true },
)
</script>
