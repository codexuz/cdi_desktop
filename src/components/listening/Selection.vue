<template>
  <div class="mb-8">
    <div class="mb-4">
      <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{{ title }}</h3>
      <div v-if="condition" class="text-gray-600 dark:text-gray-400 mb-4" v-html="condition"></div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Left Column: Drop Areas (Fossil categories) -->
      <div>
        <h4 class="text-base font-bold text-gray-900 dark:text-gray-100 mb-4 border-b pb-2">
          Fossil categories
        </h4>
        <div class="space-y-3">
          <div
            v-for="(question, index) in questions"
            :key="index"
            class="flex items-center gap-3"
            :ref="(el) => setQuestionRef(startNumber + index, el)"
          >
            <div class="flex-1 flex items-center gap-3">
              <span
                class="text-gray-900 dark:text-gray-100 font-normal"
                v-html="question.text"
              ></span>
              <div
                class="min-w-30 h-10 border-2 rounded-sm flex items-center justify-center transition-all"
                :class="
                  dragOverQuestion === index
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 border-dashed'
                    : answers[startNumber + index]
                      ? 'border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-700'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 border-dashed'
                "
                @drop="onDrop($event, startNumber + index)"
                @dragover.prevent="dragOverQuestion = index"
                @dragleave="dragOverQuestion = null"
              >
                <span
                  v-if="answers[startNumber + index]"
                  class="font-semibold text-gray-900 dark:text-gray-100"
                >
                  {{ answers[startNumber + index] }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Draggable Options (Features) -->
      <div v-if="showOptions">
        <h4 class="text-base font-bold text-gray-900 dark:text-gray-100 mb-4 border-b pb-2">
          {{ optionsTitle || 'Features' }}
        </h4>
        <div class="space-y-2">
          <div
            v-for="option in options"
            :key="option.id"
            draggable="true"
            @dragstart="onDragStart($event, option.value)"
            @dragend="onDragEnd"
            class="border rounded-sm w-auto px-3 py-2 bg-white dark:bg-gray-700 transition-all text-gray-900 dark:text-gray-100"
            :class="
              isOptionUsed(option.value)
                ? 'border-gray-300 dark:border-gray-600 opacity-40 cursor-not-allowed'
                : draggedOption === option.value
                  ? 'border-blue-500 opacity-60'
                  : 'border-gray-300 dark:border-gray-600 cursor-move hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
            "
          >
            {{ option.value }} -
            {{ option.label }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

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
  (e: 'register-refs', refs: Record<number, HTMLElement>): void
}>()

const answers = ref<Record<number, string>>({ ...props.modelValue })
const draggedOption = ref<string | null>(null)
const dragOverQuestion = ref<number | null>(null)
const questionElements = ref<Record<number, HTMLElement>>({})

// Parse content to extract questions
const questions = computed(() => {
  const lines = props.content
    .replace(/<p>/g, '')
    .split('</p>')
    .filter((line) => line.trim() && line.includes('@@'))

  return lines.map((line) => ({
    text: line.replace(/@@/g, '').trim(),
  }))
})

const setQuestionRef = (questionNum: number, el: any) => {
  if (el) {
    questionElements.value[questionNum] = el as HTMLElement
  }
}

const getOptionLabel = (value: string) => {
  return props.options.find((opt) => opt.value === value)?.label || ''
}

const isOptionUsed = (value: string) => {
  return Object.values(answers.value).includes(value)
}

const onDragStart = (event: DragEvent, value: string) => {
  if (isOptionUsed(value)) {
    event.preventDefault()
    return
  }
  draggedOption.value = value
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', value)
  }
}

const onDragEnd = () => {
  draggedOption.value = null
  dragOverQuestion.value = null
}

const onDrop = (event: DragEvent, questionNum: number) => {
  event.preventDefault()
  dragOverQuestion.value = null

  const value = event.dataTransfer?.getData('text/plain')
  if (value && !isOptionUsed(value)) {
    answers.value[questionNum] = value
    emit('update:modelValue', { ...answers.value })
  }
}

const removeAnswer = (questionNum: number) => {
  delete answers.value[questionNum]
  emit('update:modelValue', { ...answers.value })
}

onMounted(() => {
  emit('register-refs', questionElements.value)
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

.content :deep(.question-wrapper) {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.content :deep(.question-number) {
  font-weight: 600;
  color: #2563eb;
  font-size: 0.9rem;
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
