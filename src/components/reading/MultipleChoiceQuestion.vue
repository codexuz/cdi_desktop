<template>
  <div class="mb-8">
    <!-- Title and Condition -->
    <div class="mb-4">
      <h3 v-if="question.title" class="text-base font-bold text-gray-900 dark:text-gray-100 mb-2">
        {{ question.title }}
      </h3>
      <p
        v-if="question.condition"
        class="text-gray-700 dark:text-gray-300 text-sm mb-2"
        v-html="question.condition"
      ></p>
    </div>

    <!-- Questions List -->
    <div
      v-for="(questionItem, questionIndex) in question.questions"
      :key="questionItem.id"
      :data-question-number="startingQuestionNumber + questionIndex"
      class="mb-6 p-3 rounded transition-colors"
      :class="
        activeQuestionNumber === startingQuestionNumber + questionIndex
          ? 'bg-gray-100 dark:bg-blue-900/20 '
          : ''
      "
      @click="emit('question-click', startingQuestionNumber + questionIndex)"
    >
      <!-- Question Text -->
      <div class="flex items-start gap-2 mb-2 cursor-pointer">
        <span
          class="inline-block min-w-[30px] h-6 text-slate-800 dark:text-slate-400 font-bold text-center leading-5 text-sm"
        >
          {{ startingQuestionNumber + questionIndex }}
        </span>
        <span class="text-gray-900 dark:text-gray-100 leading-6">{{ questionItem.question }}</span>
      </div>

      <!-- Options -->
      <div class="flex flex-col gap-1 ml-8" @click.stop>
        <label
          v-for="option in questionItem.options"
          :key="option.id"
          class="flex items-center gap-2 py-2 px-3 cursor-pointer transition-colors"
          :class="
            selectedAnswers[questionIndex] === option.value
              ? 'bg-blue-100 dark:bg-blue-900/30'
              : 'hover:bg-gray-50 dark:hover:bg-gray-800'
          "
        >
          <input
            type="radio"
            :name="`question_${questionItem.id}`"
            :value="option.value"
            v-model="selectedAnswers[questionIndex]"
            @change="updateAnswer(questionIndex, option.value)"
            class="w-4 h-4 cursor-pointer"
          />
          <span class="text-gray-900 dark:text-gray-100">{{ option.label }}</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
interface MultipleChoiceOption {
  id: string
  value: string
  label: string
}

interface MultipleChoiceQuestionItem {
  id: string
  question: string
  options: MultipleChoiceOption[]
}

interface MultipleChoiceQuestion {
  id: string
  type: 'multiple-choice'
  title?: string
  condition?: string
  questions: MultipleChoiceQuestionItem[]
}

interface Props {
  question: MultipleChoiceQuestion
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

const selectedAnswers = ref<string[]>(
  props.modelValue?.slice(0, props.question.questions.length) ||
    new Array(props.question.questions.length).fill(''),
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
      selectedAnswers.value = newValue.slice(0, props.question.questions.length)
    }
  },
  { immediate: true },
)
</script>
