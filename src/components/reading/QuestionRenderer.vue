<template>
  <div class="question-renderer">
    <!-- Audio Player (for listening questions) -->
    <div v-if="audio" class="mb-6">
      <AudioPlayer :audio-data="audio" :part="part" />
    </div>
    
    <!-- Reading Passage (for reading questions) -->
    <div v-if="passage" class="mb-6 bg-white rounded-lg p-6 shadow-md">
      <div class="prose max-w-none" v-html="passage" />
    </div>
    
    <!-- Question Content -->
    <div class="questions-container space-y-6">
      <template v-for="(contentItem, index) in questionContent" :key="contentItem.id || index">
        <!-- Completion Questions -->
        <CompletionQuestion
          v-if="contentItem.type === 'completion'"
          :question="contentItem as any"
          v-model="answers[index]"
          :show-answers="showAnswers"
        />
        
        <!-- Multiple Choice Questions -->
        <MultipleChoiceQuestion
          v-else-if="contentItem.type === 'multiple-choice'"
          :question="contentItem as any"
          v-model="answers[index]"
          :show-answers="showAnswers"
        />
        
        <!-- Multi-Select Questions -->
        <MultiSelectQuestion
          v-else-if="contentItem.type === 'multi-select'"
          :question="contentItem as any"
          v-model="answers[index]"
          :show-answers="showAnswers"
        />
        
        <!-- Selection Questions (YES/NO/NOT GIVEN) -->
        <SelectionQuestion
          v-else-if="contentItem.type === 'selection'"
          :question="contentItem as any"
          v-model="answers[index]"
          :show-answers="showAnswers"
        />
        
        <!-- Draggable Selection Questions -->
        <DraggableSelectionQuestion
          v-else-if="contentItem.type === 'draggable-selection'"
          :question="contentItem as any"
          v-model="answers[index]"
          :show-answers="showAnswers"
        />
        
        <!-- Fallback for unknown question types -->
        <div v-else class="unknown-question-type bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 class="text-red-700 font-semibold">Unknown Question Type</h3>
          <p class="text-red-600">Question type "{{ contentItem.type }}" is not supported.</p>
          <pre class="mt-2 text-xs text-gray-600">{{ JSON.stringify(contentItem, null, 2) }}</pre>
        </div>
      </template>
    </div>
    
    <!-- Answer Summary (Global) -->
    <div v-if="showGlobalSummary" class="mt-8 p-6 bg-gray-50 rounded-lg">
      <h3 class="text-xl font-semibold mb-4">Complete Answer Summary</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="(answerSet, index) in answers"
          :key="index"
          class="answer-group bg-white p-4 rounded border"
        >
          <h4 class="font-medium mb-2">{{ questionContent[index]?.title || `Question ${index + 1}` }}</h4>
          <div v-if="Array.isArray(answerSet)" class="space-y-1">
            <div
              v-for="(answer, ansIndex) in answerSet"
              :key="ansIndex"
              class="text-sm"
            >
              <span class="font-medium">{{ ansIndex + 1 }}:</span>
              <span class="text-blue-600 ml-1">{{ answer || 'Not answered' }}</span>
            </div>
          </div>
          <div v-else class="text-sm">
            <span class="text-blue-600">{{ answerSet || 'Not answered' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Import all question components
import CompletionQuestion from './CompletionQuestion.vue';
import MultipleChoiceQuestion from './MultipleChoiceQuestion.vue';
import MultiSelectQuestion from './MultiSelectQuestion.vue';
import SelectionQuestion from './SelectionQuestion.vue';
import DraggableSelectionQuestion from './DraggableSelectionQuestion.vue';
import AudioPlayer from './AudioPlayer.vue';

// Define interfaces for the question structure
interface QuestionContent {
  id: string;
  type: string;
  title?: string;
  condition?: string;
  content?: string;
  questions?: any[];
  options?: any[];
  limit?: number;
  showOptions?: boolean;
  optionsTitle?: string;
}

interface AudioData {
  id: number;
  url: string;
  fileName: string;
}

interface Props {
  questionContent: QuestionContent[];
  audio?: AudioData;
  passage?: string;
  part?: string;
  modelValue?: any[];
  showAnswers?: boolean;
  showGlobalSummary?: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: any[]): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  showAnswers: false,
  showGlobalSummary: false,
});

const emit = defineEmits<Emits>();

// Initialize answers array based on the number of questions
const answers = ref<any[]>(
  props.modelValue.length > 0 
    ? [...props.modelValue]
    : new Array(props.questionContent.length).fill(null).map(() => [])
);

// Update individual question answers
const updateAnswer = (index: number, value: any) => {
  answers.value[index] = value;
  emit('update:modelValue', [...answers.value]);
};

// Watch for changes in modelValue prop
watch(() => props.modelValue, (newValue) => {
  if (newValue && Array.isArray(newValue)) {
    answers.value = [...newValue];
  }
}, { immediate: true, deep: true });

// Initialize answers array when questionContent changes
watch(() => props.questionContent, (newContent) => {
  if (newContent && newContent.length !== answers.value.length) {
    const newAnswers = new Array(newContent.length).fill(null).map((_, index) => 
      answers.value[index] || []
    );
    answers.value = newAnswers;
  }
}, { immediate: true });

// Provide reactive answer updates to child components
const bindAnswer = (index: number) => {
  return {
    get: () => answers.value[index],
    set: (value: any) => updateAnswer(index, value)
  };
};
</script>

<style scoped>
.question-renderer {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

:deep(.prose) {
  max-width: none;
}

:deep(.prose h1),
:deep(.prose h2),
:deep(.prose h3),
:deep(.prose h4) {
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

:deep(.prose p) {
  margin-bottom: 1rem;
  line-height: 1.6;
}

:deep(.prose strong) {
  font-weight: 600;
}

:deep(.prose em) {
  font-style: italic;
}
</style>