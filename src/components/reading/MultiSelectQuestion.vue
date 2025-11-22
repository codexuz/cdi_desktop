<template>
  <div class="multi-select-question bg-white rounded-lg p-6 shadow-md">
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
    
    <!-- Selection Limit Info -->
    <div v-if="question.limit" class="limit-info mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
      <span class="text-yellow-800 font-medium">
        📌 Select exactly {{ question.limit }} option{{ question.limit > 1 ? 's' : '' }}
        <span v-if="selectedCount > 0" class="ml-2">
          ({{ selectedCount }}/{{ question.limit }} selected)
        </span>
      </span>
    </div>
    
    <!-- Options -->
    <div class="options space-y-3">
      <div
        v-for="option in question.options"
        :key="option.id"
        class="option-item"
      >
        <label
          class="flex items-start space-x-3 p-4 rounded-lg cursor-pointer border transition-all duration-200"
          :class="{
            'bg-blue-100 border-blue-300 shadow-sm': selectedAnswers.includes(option.value),
            'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300': !selectedAnswers.includes(option.value),
            'opacity-50 cursor-not-allowed': isOptionDisabled(option.value)
          }"
        >
          <input
            type="checkbox"
            :value="option.value"
            :checked="selectedAnswers.includes(option.value)"
            :disabled="isOptionDisabled(option.value)"
            @change="updateAnswer(option.value, $event)"
            class="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
          />
          <div class="flex-1">
            <span class="font-semibold text-blue-600 mr-2">{{ option.value }}</span>
            <span class="text-gray-700 leading-relaxed">{{ option.label }}</span>
          </div>
        </label>
      </div>
    </div>
    
    <!-- Validation Message -->
    <div v-if="validationMessage" class="mt-4 p-3 rounded-lg" :class="validationClass">
      <span class="text-sm font-medium">{{ validationMessage }}</span>
    </div>
    
    <!-- Answer Summary -->
    <div v-if="showAnswers" class="mt-6 p-4 bg-gray-50 rounded-lg">
      <h4 class="font-semibold mb-3">Your Selected Answers:</h4>
      <div v-if="selectedAnswers.length > 0" class="flex flex-wrap gap-2">
        <div
          v-for="answer in selectedAnswers"
          :key="answer"
          class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
        >
          {{ answer }}
        </div>
      </div>
      <p v-else class="text-gray-500 italic">No options selected</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface MultiSelectOption {
  id: string;
  value: string;
  label: string;
}

interface MultiSelectQuestion {
  id: string;
  type: 'multi-select';
  title?: string;
  condition?: string;
  options: MultiSelectOption[];
  limit?: number;
}

interface Props {
  question: MultiSelectQuestion;
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

const selectedAnswers = ref<string[]>(props.modelValue || []);

const selectedCount = computed(() => selectedAnswers.value.length);

const validationMessage = computed(() => {
  if (!props.question.limit) return '';
  
  const limit = props.question.limit;
  const count = selectedCount.value;
  
  if (count === 0) {
    return `Please select ${limit} option${limit > 1 ? 's' : ''}`;
  } else if (count < limit) {
    return `Select ${limit - count} more option${limit - count > 1 ? 's' : ''}`;
  } else if (count > limit) {
    return `Too many options selected. Please deselect ${count - limit} option${count - limit > 1 ? 's' : ''}`;
  } else {
    return `Perfect! You have selected ${limit} option${limit > 1 ? 's' : ''}`;
  }
});

const validationClass = computed(() => {
  if (!props.question.limit) return '';
  
  const limit = props.question.limit;
  const count = selectedCount.value;
  
  if (count === limit) {
    return 'bg-green-50 border border-green-200 text-green-800';
  } else if (count > limit) {
    return 'bg-red-50 border border-red-200 text-red-800';
  } else {
    return 'bg-blue-50 border border-blue-200 text-blue-800';
  }
});

const isOptionDisabled = (value: string): boolean => {
  if (!props.question.limit) return false;
  
  const isSelected = selectedAnswers.value.includes(value);
  const hasReachedLimit = selectedCount.value >= props.question.limit;
  
  // Disable if limit is reached and this option is not already selected
  return hasReachedLimit && !isSelected;
};

const updateAnswer = (value: string, event: Event) => {
  const target = event.target as HTMLInputElement;
  const isChecked = target.checked;
  
  if (isChecked) {
    // Add to selected answers if not already present
    if (!selectedAnswers.value.includes(value)) {
      selectedAnswers.value.push(value);
    }
  } else {
    // Remove from selected answers
    const index = selectedAnswers.value.indexOf(value);
    if (index > -1) {
      selectedAnswers.value.splice(index, 1);
    }
  }
  
  emit('update:modelValue', [...selectedAnswers.value]);
};

// Watch for changes in modelValue prop
watch(() => props.modelValue, (newValue) => {
  if (newValue && Array.isArray(newValue)) {
    selectedAnswers.value = [...newValue];
  }
}, { immediate: true });
</script>

<style scoped>
.multi-select-question {
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
</style>