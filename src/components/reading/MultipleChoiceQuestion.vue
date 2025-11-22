<template>
  <div class="multiple-choice-question bg-white rounded-lg p-6 shadow-md">
    <!-- Title -->
    <h3 v-if="question.title" class="text-xl font-bold mb-4 text-gray-800">
      {{ question.title }}
    </h3>
    
    <!-- Condition/Instructions -->
    <div
      v-if="question.condition"
      class="instructions mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded"
      v-html="question.condition"
    />
    
    <!-- Questions List -->
    <div class="questions-list space-y-6">
      <div
        v-for="(questionItem, questionIndex) in question.questions"
        :key="questionItem.id"
        class="question-item"
      >
        <!-- Question Text -->
        <div class="question-text mb-4 p-4 bg-gray-50 rounded-lg">
          <h4 class="font-medium text-gray-800 leading-relaxed">
            {{ questionIndex + 1 }}. {{ questionItem.question }}
          </h4>
        </div>
        
        <!-- Options -->
        <div class="options space-y-2 ml-4">
          <div
            v-for="option in questionItem.options"
            :key="option.id"
            class="option-item"
          >
            <label
              class="flex items-start space-x-3 p-3 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
              :class="{ 'bg-blue-100 border-blue-300': selectedAnswers[questionIndex] === option.value }"
            >
              <input
                type="radio"
                :name="`question_${questionItem.id}`"
                :value="option.value"
                :checked="selectedAnswers[questionIndex] === option.value"
                @change="updateAnswer(questionIndex, option.value)"
                class="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <div class="flex-1">
                <span class="font-semibold text-blue-600 mr-2">{{ option.value }}</span>
                <span class="text-gray-700">{{ option.label }}</span>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Answer Summary -->
    <div v-if="showAnswers" class="mt-6 p-4 bg-gray-50 rounded-lg">
      <h4 class="font-semibold mb-3">Your Answers:</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        <div
          v-for="(answer, index) in selectedAnswers"
          :key="index"
          class="flex items-center justify-between bg-white p-3 rounded border"
        >
          <span class="font-medium">Q{{ index + 1 }}:</span>
          <span 
            class="font-bold"
            :class="answer ? 'text-blue-600' : 'text-gray-400'"
          >
            {{ answer || 'Not answered' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface MultipleChoiceOption {
  id: string;
  value: string;
  label: string;
}

interface MultipleChoiceQuestionItem {
  id: string;
  question: string;
  options: MultipleChoiceOption[];
}

interface MultipleChoiceQuestion {
  id: string;
  type: 'multiple-choice';
  title?: string;
  condition?: string;
  questions: MultipleChoiceQuestionItem[];
}

interface Props {
  question: MultipleChoiceQuestion;
  modelValue?: string[];
  showAnswers?: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: string[]): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  showAnswers: false,
});

const emit = defineEmits<Emits>();

const selectedAnswers = ref<string[]>(
  props.modelValue?.slice(0, props.question.questions.length) || 
  new Array(props.question.questions.length).fill('')
);

const updateAnswer = (questionIndex: number, value: string) => {
  selectedAnswers.value[questionIndex] = value;
  emit('update:modelValue', [...selectedAnswers.value]);
};

// Watch for changes in modelValue prop
watch(() => props.modelValue, (newValue) => {
  if (newValue && Array.isArray(newValue)) {
    selectedAnswers.value = newValue.slice(0, props.question.questions.length);
  }
}, { immediate: true });
</script>

<style scoped>
.multiple-choice-question {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.option-item label {
  border: 1px solid transparent;
}

.option-item label:hover {
  border-color: #e5e7eb;
}

:deep(.instructions) {
  font-size: 14px;
  line-height: 1.5;
}

:deep(.instructions strong) {
  font-weight: 600;
}

:deep(.instructions p) {
  margin-bottom: 0.5rem;
}
</style>