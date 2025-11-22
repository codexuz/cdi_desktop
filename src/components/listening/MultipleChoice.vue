<template>
  <div class="multiple-choice">
    <div class="question-header">
      <h3>{{ title }}</h3>
      <p v-if="condition" class="condition" v-html="condition"></p>
    </div>
    <div v-for="(question, index) in questions" :key="question.id" class="question-item">
      <div class="question-number">Question {{ startNumber + index }}</div>
      <div class="question-text">{{ question.question }}</div>
      <div class="options">
        <label
          v-for="option in question.options"
          :key="option.id"
          class="option-label"
          :class="{ selected: answers[question.id] === option.value }"
        >
          <input
            type="radio"
            :name="question.id"
            :value="option.value"
            v-model="answers[question.id]"
            @change="updateAnswer(question.id, option.value)"
          />
          <span class="option-value">{{ option.value }}</span>
          <span class="option-text">{{ option.label }}</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Option {
  id: string
  value: string
  label: string
}

interface Question {
  id: string
  question: string
  options: Option[]
}

interface Props {
  title: string
  condition?: string
  questions: Question[]
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

const answers = ref<Record<string, string>>({ ...props.modelValue })

watch(
  () => props.modelValue,
  (newValue) => {
    answers.value = { ...newValue }
  },
)

const updateAnswer = (questionId: string, value: string) => {
  answers.value[questionId] = value
  emit('update:modelValue', { ...answers.value })
}
</script>

<style scoped>
.multiple-choice {
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

.question-item {
  margin-bottom: 24px;
  padding: 16px;
  background: #f3f6fd;
  border-radius: 12px;
}

.question-number {
  font-weight: 600;
  color: #2563eb;
  margin-bottom: 8px;
}

.question-text {
  color: #1e293b;
  margin-bottom: 12px;
  font-size: 1.05rem;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-label {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fff;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.option-label:hover {
  border-color: #2563eb;
  background: #eff6ff;
}

.option-label.selected {
  border-color: #2563eb;
  background: #dbeafe;
}

.option-label input[type='radio'] {
  cursor: pointer;
}

.option-value {
  font-weight: 600;
  color: #2563eb;
  min-width: 24px;
}

.option-text {
  color: #374151;
}
</style>
