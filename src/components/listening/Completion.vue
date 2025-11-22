<template>
  <div class="completion">
    <div class="question-header">
      <h3>{{ title }}</h3>
      <p v-if="condition" class="condition" v-html="condition"></p>
    </div>
    <div class="content" v-html="processedContent"></div>
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
}>()

const processedContent = computed(() => {
  let content = props.content
  let questionNum = props.startNumber

  // Replace @@ with input fields
  content = content.replace(/@@/g, () => {
    const currentNum = questionNum++
    const value = props.modelValue[currentNum] || ''
    return `<input type="text" class="completion-input" data-question="${currentNum}" value="${value}" placeholder="..."/>`
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
  color: #2563eb;
  font-size: 1.3rem;
  margin-bottom: 12px;
}

.condition {
  color: #374151;
  margin-bottom: 16px;
  font-style: italic;
}

.content {
  line-height: 1.8;
}

.content :deep(.completion-input) {
  padding: 6px 12px;
  border: none;
  border-bottom: 2px solid #2563eb;
  background: transparent;
  font-size: 1rem;
  min-width: 120px;
  transition: all 0.2s;
}

.content :deep(.completion-input):focus {
  outline: none;
  border-bottom-color: #1d4ed8;
  background: #eff6ff;
}

.content :deep(h3) {
  color: #1e293b;
  font-size: 1.2rem;
  margin: 20px 0 12px;
}

.content :deep(p) {
  color: #374151;
  margin-bottom: 12px;
}

.content :deep(ul) {
  list-style-position: inside;
  color: #374151;
}

.content :deep(li) {
  margin-bottom: 8px;
}
</style>
