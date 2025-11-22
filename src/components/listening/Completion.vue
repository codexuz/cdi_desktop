<template>
  <div class="completion">
    <div class="question-header font-bold text-gray-800 dark:text-gray-200 mb-4">
      <h3 class="text-3xl">{{ title }}</h3>
      <p v-if="condition" class="condition text-gray-600 dark:text-gray-300" v-html="condition"></p>
    </div>
    <div class="content text-[#374151] dark:text-gray-400" v-html="processedContent"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'

interface Props {
  title: string
  condition?: string
  content: string
  startNumber: number
  modelValue?: Record<string, string>
}

const props = withDefaults(defineProps<Props>(), {
  condition: '',
  modelValue: () => ({}),
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: Record<string, string>): void
  (e: 'register-refs', refs: Record<number, HTMLElement>): void
}>()

const processedContent = computed(() => {
  let content = props.content
  let questionNum = props.startNumber

  // Replace @@ with input fields
  content = content.replace(/@@/g, () => {
    const currentNum = questionNum++
    const value = props.modelValue[currentNum] || ''
    return ` <input type="text" class="text-center text-slate-900 dark:text-white border-2 border-gray-300 dark:border-slate-600 rounded-sm focus:outline-none focus:border-2 focus:border-blue-500" data-question="${currentNum}" value="${value}" placeholder="${currentNum}"/>`
  })

  return content
})

// Listen for changes on dynamically created inputs
const handleInputChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const questionNum = target.getAttribute('data-question')
  if (questionNum) {
    const newAnswers = { ...props.modelValue, [questionNum]: target.value }
    emit('update:modelValue', newAnswers)
  }
}

// Add event listener after mount
onMounted(() => {
  const refs: Record<number, HTMLElement> = {}
  document.querySelectorAll('.question-wrapper').forEach((wrapper) => {
    const questionNum = wrapper.getAttribute('data-question')
    if (questionNum) {
      refs[parseInt(questionNum)] = wrapper as HTMLElement
    }
  })
  emit('register-refs', refs)

  document.querySelectorAll('.completion-input').forEach((input) => {
    input.addEventListener('input', handleInputChange)
  })
})
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
