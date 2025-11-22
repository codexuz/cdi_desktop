<template>
  <div class="multi-select">
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
import { computed, onMounted } from 'vue'

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
  maxSelections?: number
  modelValue?: Record<string, string[]>
}

const props = withDefaults(defineProps<Props>(), {
  condition: '',
  showOptions: false,
  optionsTitle: '',
  maxSelections: 4,
  modelValue: () => ({}),
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: Record<string, string[]>): void
  (e: 'register-refs', refs: Record<number, HTMLElement>): void
}>()

const processedContent = computed(() => {
  let content = props.content
  let questionNum = props.startNumber

  // Replace @@ with multi-select checkboxes
  content = content.replace(/@@/g, () => {
    const currentNum = questionNum++
    return `<div class="question-wrapper" data-question="${currentNum}">
      <span class="question-number">${currentNum}</span>
      <div class="multi-select-group" data-question="${currentNum}">
        ${props.options
          .map(
            (opt) =>
              `<label class="checkbox-label">
              <input type="checkbox" value="${opt.value}" class="multi-select-checkbox" data-question="${currentNum}" />
              <span>${opt.value}</span>
            </label>`,
          )
          .join('')}
      </div>
    </div>`
  })

  return content
})

// Listen for changes on dynamically created checkboxes
const handleCheckboxChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const questionNum = target.getAttribute('data-question')
  if (!questionNum) return

  const group = document.querySelector(`.multi-select-group[data-question="${questionNum}"]`)
  if (!group) return

  const checkboxes = Array.from(
    group.querySelectorAll('input[type="checkbox"]'),
  ) as HTMLInputElement[]
  const selected = checkboxes.filter((cb) => cb.checked).map((cb) => cb.value)

  // Limit selections
  if (selected.length > props.maxSelections) {
    target.checked = false
    return
  }

  const newAnswers = { ...props.modelValue, [questionNum]: selected }
  emit('update:modelValue', newAnswers)
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

  document.querySelectorAll('.multi-select-checkbox').forEach((checkbox) => {
    checkbox.addEventListener('change', handleCheckboxChange)
  })
})
</script>

<style scoped>
.multi-select {
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

.content :deep(.question-wrapper) {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 8px 0;
}

.content :deep(.question-number) {
  font-weight: 600;
  color: #2563eb;
  font-size: 0.9rem;
  padding-top: 8px;
}

.content :deep(.multi-select-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.content :deep(.checkbox-label) {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #fff;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.content :deep(.checkbox-label:hover) {
  border-color: #2563eb;
  background: #eff6ff;
}

.content :deep(.checkbox-label input:checked) ~ span {
  color: #2563eb;
  font-weight: 600;
}
</style>
