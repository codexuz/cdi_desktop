<template>
  <div class="selection">
    <div class="question-header">
      <h3>{{ title }}</h3>
      <p v-if="condition" class="condition" v-html="condition"></p>
    </div>
    <div v-if="showOptions && optionsTitle" class="options-box">
      <h4>{{ optionsTitle }}</h4>
      <div class="options-list">
        <div v-for="option in options" :key="option.id" class="option-item">
          <span class="option-value">{{ option.value }}</span>
          <span v-if="option.label" class="option-label">{{ option.label }}</span>
        </div>
      </div>
    </div>
    <div class="content" v-html="processedContent"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Option {
  id: string
  value: string
  label: string
}

interface Props {
  title: string
  condition?: string
  content: string
  options: Option[]
  showOptions?: boolean
  optionsTitle?: string
  startNumber: number
  modelValue?: Record<string, string>
}

const props = withDefaults(defineProps<Props>(), {
  condition: '',
  showOptions: false,
  optionsTitle: '',
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
    return `<select class="selection-input" data-question="${currentNum}">
      <option value="">Select...</option>
      ${props.options.map((opt) => `<option value="${opt.value}">${opt.value}</option>`).join('')}
    </select>`
  })

  return content
})

// Listen for changes on dynamically created selects
const handleSelectChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const questionNum = target.getAttribute('data-question')
  if (questionNum) {
    const newAnswers = { ...props.modelValue, [questionNum]: target.value }
    emit('update:modelValue', newAnswers)
  }
}

// Add event listener after mount
import { onMounted } from 'vue'
onMounted(() => {
  document.querySelectorAll('.selection-input').forEach((select) => {
    select.addEventListener('change', handleSelectChange)
  })
})
</script>

<style scoped>
.selection {
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

.options-box {
  background: #f3f6fd;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.options-box h4 {
  color: #2563eb;
  font-size: 1.1rem;
  margin-bottom: 12px;
}

.options-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
}

.option-item {
  display: flex;
  gap: 8px;
  padding: 8px;
  background: #fff;
  border-radius: 6px;
}

.option-value {
  font-weight: 600;
  color: #2563eb;
}

.option-label {
  color: #374151;
}

.content :deep(.selection-input) {
  padding: 8px 12px;
  border: 2px solid #2563eb;
  border-radius: 6px;
  background: #fff;
  font-size: 1rem;
  cursor: pointer;
  min-width: 100px;
}

.content :deep(.selection-input):focus {
  outline: none;
  border-color: #1d4ed8;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}
</style>
