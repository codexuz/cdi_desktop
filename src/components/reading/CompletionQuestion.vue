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
    <div
      class="content text-[#374151] dark:text-gray-400"
      v-html="processedContent"
    />
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
}

interface Emits {
  (e: 'update:modelValue', value: string[]): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  showAnswers: false,
})

const emit = defineEmits<Emits>()

const answers = ref<string[]>(props.modelValue || [])

// Process content to replace @@ with input fields
const processedContent = computed(() => {
  let content = props.question.content
  let blankIndex = 0

  // Replace @@ with input fields
  content = content.replace(/@@/g, () => {
    const currentIndex = blankIndex++
    return ` <input 
      type="text" 
      class="blank-input my-1 text-center text-slate-900 dark:text-white border-2 border-gray-300 dark:border-slate-600 rounded-sm focus:outline-none focus:border-2 focus:border-blue-500 px-2 py-1" 
      data-blank-index="${currentIndex}"
      placeholder="${currentIndex + 1}"
      value="${answers.value[currentIndex] || ''}"
    />`
  })

  return content
})

// Handle input changes
const handleInputChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const index = parseInt(target.dataset.blankIndex || '0')

  // Update answers array
  const newAnswers = [...answers.value]
  newAnswers[index] = target.value
  answers.value = newAnswers

  // Emit the updated value
  emit('update:modelValue', newAnswers)
}

// Set up event listeners when component mounts
onMounted(() => {
  // Add event listeners to all input fields
  const inputs = document.querySelectorAll('.blank-input')
  inputs.forEach((input) => {
    input.addEventListener('input', handleInputChange)
  })
})

// Watch for changes in modelValue prop
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      answers.value = [...newValue]
    }
  },
  { immediate: true },
)

// Update input values when answers change
watch(
  answers,
  () => {
    nextTick(() => {
      const inputs = document.querySelectorAll('.blank-input') as NodeListOf<HTMLInputElement>
      inputs.forEach((input, index) => {
        input.value = answers.value[index] || ''
      })
    })
  },
  { deep: true },
)

// Cleanup event listeners on unmount
onUnmounted(() => {
  const inputs = document.querySelectorAll('.blank-input')
  inputs.forEach((input) => {
    input.removeEventListener('input', handleInputChange)
  })
})
</script>
