<template>
  <div class="selection-question bg-white rounded-lg p-6 shadow-md">
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
    
    <!-- Options Legend (if available) -->
    <div v-if="question.options && question.options.length > 0" class="options-legend mb-6 p-4 bg-gray-50 rounded-lg">
      <h4 class="font-semibold mb-3 text-gray-800">Options:</h4>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div
          v-for="option in question.options"
          :key="option.id"
          class="option-legend flex items-center space-x-2 p-2 bg-white rounded border"
        >
          <span class="font-bold text-blue-600">{{ option.value }}</span>
          <span class="text-sm text-gray-600">{{ option.label }}</span>
        </div>
      </div>
    </div>
    
    <!-- Questions -->
    <div class="questions-content">
      <div v-if="processedQuestions.length > 0" class="questions-list space-y-4">
        <div
          v-for="(questionItem, index) in processedQuestions"
          :key="index"
          class="question-item border rounded-lg p-4 hover:bg-gray-50 transition-colors"
        >
          <!-- Question Text -->
          <div class="question-text mb-3">
            <span class="font-medium text-gray-800 mr-2">{{ index + 1 }}.</span>
            <span class="text-gray-700 leading-relaxed">{{ questionItem.text }}</span>
          </div>
          
          <!-- Answer Options -->
          <div class="answer-options flex flex-wrap gap-2">
            <label
              v-for="option in availableOptions"
              :key="option.value"
              class="flex items-center space-x-2 p-2 rounded-lg cursor-pointer border transition-all duration-200"
              :class="{
                'bg-blue-100 border-blue-300': selectedAnswers[index] === option.value,
                'bg-white border-gray-200 hover:bg-gray-50': selectedAnswers[index] !== option.value
              }"
            >
              <input
                type="radio"
                :name="`question_${index}`"
                :value="option.value"
                :checked="selectedAnswers[index] === option.value"
                @change="updateAnswer(index, option.value)"
                class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span class="text-sm font-medium">{{ option.value }}</span>
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
interface SelectionOption {
  id: string;
  value: string;
  label: string;
}

interface SelectionQuestion {
  id: string;
  type: 'selection';
  title?: string;
  condition?: string;
  content: string;
  options?: SelectionOption[];
  showOptions?: boolean;
}

interface Props {
  question: SelectionQuestion;
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

// Default options for YES/NO/NOT GIVEN questions
const defaultOptions = [
  { value: 'YES', label: 'if the statement agrees with the information' },
  { value: 'NO', label: 'if the statement contradicts the information' },
  { value: 'NOT GIVEN', label: 'if there is no information on this' }
];

// Use provided options or default ones
const availableOptions = computed(() => {
  return props.question.options && props.question.options.length > 0 
    ? props.question.options 
    : defaultOptions;
});

// Process content to extract individual questions
const processedQuestions = computed(() => {
  const content = props.question.content;
  
  // Split by @@ markers to get individual questions
  const parts = content.split('@@');
  const questions = [];
  
  for (let i = 0; i < parts.length - 1; i++) {
    const beforeMarker = parts[i];
    const afterMarker = parts[i + 1];
    
    // Extract the question text (usually the text right before @@)
    const lines = beforeMarker ? beforeMarker.split(/\n|<br>|<\/p>/) : [];
    let questionText = '';
    
    // Find the last non-empty line as the question
    for (let j = lines.length - 1; j >= 0; j--) {
      const line = lines[j];
      if (line) {
        const cleanLine = line.replace(/<[^>]*>/g, '').trim();
        if (cleanLine && !cleanLine.includes('line-height') && !cleanLine.includes('style=')) {
          questionText = cleanLine;
          break;
        }
      }
    }
    
    if (questionText) {
      questions.push({
        text: questionText,
        index: i
      });
    }
  }
  
  return questions;
});

const selectedAnswers = ref<string[]>(
  props.modelValue?.slice(0, processedQuestions.value.length) || 
  new Array(processedQuestions.value.length).fill('')
);

const updateAnswer = (questionIndex: number, value: string) => {
  selectedAnswers.value[questionIndex] = value;
  emit('update:modelValue', [...selectedAnswers.value]);
};

// Watch for changes in modelValue prop
watch(() => props.modelValue, (newValue) => {
  if (newValue && Array.isArray(newValue)) {
    selectedAnswers.value = newValue.slice(0, processedQuestions.value.length);
  }
}, { immediate: true });

// Update selectedAnswers array length when processedQuestions changes
watch(processedQuestions, (newQuestions) => {
  const currentLength = selectedAnswers.value.length;
  const newLength = newQuestions.length;
  
  if (newLength !== currentLength) {
    selectedAnswers.value = new Array(newLength).fill('').map((_, index) => 
      selectedAnswers.value[index] || ''
    );
  }
}, { immediate: true });
</script>

<style scoped>
.selection-question {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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

.question-item:hover {
  border-color: #d1d5db;
}
</style>