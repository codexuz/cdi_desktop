<template>
  <div class="mb-8">
    <div class="mb-4">
      <h3 class="text-base font-bold text-gray-900 dark:text-gray-100 mb-2">{{ title }}</h3>
      <p
        v-if="condition"
        class="text-gray-700 dark:text-gray-300 text-sm mb-2"
        v-html="condition"
      ></p>
    </div>
    <div
      v-for="(question, index) in questions"
      :key="question.id"
      class="mb-6"
      :ref="(el) => setQuestionRef(startNumber + index, el)"
    >
      <div class="flex items-start gap-2 mb-2">
        <span
          class="inline-block min-w-[30px] h-6 text-slate-800 dark:text-slate-400 font-bold text-center leading-5 text-sm"
        >
          {{ startNumber + index }}
        </span>
        <span class="text-gray-900 dark:text-gray-100 leading-6">{{ question.question }}</span>
      </div>
      <div class="flex flex-col gap-1 ml-8">
        <label
          v-for="option in question.options"
          :key="option.id"
          class="flex items-center gap-2 py-2 px-3 cursor-pointer transition-colors"
          :class="
            answers[question.id] === option.value
              ? 'bg-blue-100 dark:bg-blue-900/30'
              : 'hover:bg-gray-50 dark:hover:bg-gray-800'
          "
        >
          <input
            type="radio"
            :name="question.id"
            :value="option.value"
            v-model="answers[question.id]"
            @change="updateAnswer(question.id, option.value)"
            class="w-4 h-4 cursor-pointer"
          />
          <span class="text-gray-900 dark:text-gray-100">{{ option.label }}</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

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
  (e: 'register-refs', refs: Record<number, HTMLElement>): void
}>()

const answers = ref<Record<string, string>>({ ...props.modelValue })
const questionElements = ref<Record<number, HTMLElement>>({})

const setQuestionRef = (questionNum: number, el: any) => {
  if (el) {
    questionElements.value[questionNum] = el as HTMLElement
  }
}

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

onMounted(() => {
  emit('register-refs', questionElements.value)
})
</script>
