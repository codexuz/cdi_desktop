<template>
  <div class="completion-question bg-white rounded-lg p-6 shadow-md">
    <!-- Title -->
    <h3 v-if="question.title" class="text-xl font-bold mb-4 text-gray-800">
      {{ question.title }}
    </h3>
    
    <!-- Condition/Instructions -->
    <div
      v-if="question.condition"
      class="instructions mb-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded"
      v-html="question.condition"
    />
    
    <!-- Question Content -->
    <div class="question-content">
      <div
        v-html="processedContent"
        class="prose max-w-none"
      />
    </div>
    
    <!-- Answer Summary -->
    <div v-if="showAnswers" class="mt-6 p-4 bg-gray-50 rounded-lg">
      <h4 class="font-semibold mb-2">Your Answers:</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        <div
          v-for="(answer, index) in answers"
          :key="index"
          class="flex items-center justify-between bg-white p-2 rounded border"
        >
          <span class="font-medium">{{ index + 1 }}:</span>
          <span class="text-blue-600">{{ answer || 'Not answered' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface CompletionQuestion {
  id: string;
  type: 'completion';
  title?: string;
  condition?: string;
  content: string;
}

interface Props {
  question: CompletionQuestion;
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

const answers = ref<string[]>(props.modelValue || []);

// Process content to replace @@ with input fields
const processedContent = computed(() => {
  let content = props.question.content;
  let blankIndex = 0;
  
  // Replace @@ with input fields
  content = content.replace(/@@/g, () => {
    const currentIndex = blankIndex++;
    return `<input 
      type="text" 
      class="blank-input inline-block w-32 px-2 py-1 border-b-2 border-blue-400 focus:border-blue-600 outline-none bg-transparent text-center font-medium" 
      data-blank-index="${currentIndex}"
      placeholder="..."
      value="${answers.value[currentIndex] || ''}"
    />`;
  });
  
  return content;
});

// Handle input changes
const handleInputChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const index = parseInt(target.dataset.blankIndex || '0');
  
  // Update answers array
  const newAnswers = [...answers.value];
  newAnswers[index] = target.value;
  answers.value = newAnswers;
  
  // Emit the updated value
  emit('update:modelValue', newAnswers);
};

// Set up event listeners when component mounts
onMounted(() => {
  // Add event listeners to all input fields
  const inputs = document.querySelectorAll('.blank-input');
  inputs.forEach(input => {
    input.addEventListener('input', handleInputChange);
  });
});

// Watch for changes in modelValue prop
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    answers.value = [...newValue];
  }
}, { immediate: true });

// Update input values when answers change
watch(answers, () => {
  nextTick(() => {
    const inputs = document.querySelectorAll('.blank-input') as NodeListOf<HTMLInputElement>;
    inputs.forEach((input, index) => {
      input.value = answers.value[index] || '';
    });
  });
}, { deep: true });

// Cleanup event listeners on unmount
onUnmounted(() => {
  const inputs = document.querySelectorAll('.blank-input');
  inputs.forEach(input => {
    input.removeEventListener('input', handleInputChange);
  });
});
</script>

<style scoped>
.completion-question {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

:deep(.blank-input) {
  transition: border-color 0.2s ease;
}

:deep(.blank-input:focus) {
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
}

:deep(.instructions) {
  font-size: 14px;
  line-height: 1.5;
}

:deep(.instructions strong) {
  font-weight: 600;
}

:deep(.prose p) {
  margin-bottom: 1rem;
  line-height: 1.6;
}

:deep(.prose strong) {
  font-weight: 600;
}
</style>