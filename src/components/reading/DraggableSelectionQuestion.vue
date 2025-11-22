<template>
  <div class="draggable-selection-question bg-white rounded-lg p-6 shadow-md">
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
    
    <!-- Options Title -->
    <div v-if="question.optionsTitle" class="options-title mb-4">
      <h4 class="text-lg font-semibold text-gray-800">{{ question.optionsTitle }}</h4>
    </div>
    
    <!-- Available Options (Drag Source) -->
    <div class="available-options mb-6">
      <h4 class="font-semibold mb-3 text-gray-700">Available Options:</h4>
      <div class="options-pool p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 min-h-20">
        <div class="flex flex-wrap gap-2">
          <div
            v-for="option in availableOptionsList"
            :key="option.id"
            :draggable="true"
            @dragstart="handleDragStart(option, $event)"
            @dragend="handleDragEnd"
            class="option-chip bg-blue-100 text-blue-800 px-3 py-2 rounded-lg cursor-move hover:bg-blue-200 transition-colors border border-blue-300 select-none"
            :class="{ 'opacity-50': isDragging && draggedOption?.id === option.id }"
          >
            {{ option.value }}
          </div>
        </div>
        <p v-if="availableOptionsList.length === 0" class="text-gray-500 italic text-center py-4">
          All options have been used
        </p>
      </div>
    </div>
    
    <!-- Drop Zones (Questions) -->
    <div class="questions-content">
      <div v-html="processedContent" class="prose max-w-none" />
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
          <span class="font-medium">{{ index + 1 }}:</span>
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
interface DraggableOption {
  id: string;
  value: string;
}

interface DraggableSelectionQuestion {
  id: string;
  type: 'draggable-selection';
  title?: string;
  condition?: string;
  content: string;
  options: DraggableOption[];
  optionsTitle?: string;
}

interface Props {
  question: DraggableSelectionQuestion;
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
const isDragging = ref(false);
const draggedOption = ref<DraggableOption | null>(null);

// Get available options (not yet used)
const availableOptionsList = computed(() => {
  return props.question.options.filter(option => 
    !selectedAnswers.value.includes(option.value)
  );
});

// Process content to replace @@ with drop zones
const processedContent = computed(() => {
  let content = props.question.content;
  let dropZoneIndex = 0;
  
  // Replace @@ with drop zones
  content = content.replace(/@@/g, () => {
    const currentIndex = dropZoneIndex++;
    const currentAnswer = selectedAnswers.value[currentIndex] || '';
    
    return `<div 
      class="drop-zone inline-block min-w-32 min-h-10 px-3 py-2 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50 text-center align-middle cursor-pointer hover:border-blue-400 hover:bg-blue-100 transition-colors" 
      data-drop-index="${currentIndex}"
      style="display: inline-flex; align-items: center; justify-content: center; vertical-align: middle; min-width: 120px;"
    >
      <span class="drop-zone-content ${currentAnswer ? 'has-answer' : 'empty'}" style="font-weight: 600; color: ${currentAnswer ? '#1e40af' : '#6b7280'};">
        ${currentAnswer || 'Drop here'}
      </span>
    </div>`;
  });
  
  return content;
});

// Drag and drop handlers
const handleDragStart = (option: DraggableOption, event: DragEvent) => {
  isDragging.value = true;
  draggedOption.value = option;
  
  if (event.dataTransfer) {
    event.dataTransfer.setData('text/plain', option.value);
    event.dataTransfer.effectAllowed = 'move';
  }
};

const handleDragEnd = () => {
  isDragging.value = false;
  draggedOption.value = null;
};

const handleDrop = (event: DragEvent, dropIndex: number) => {
  event.preventDefault();
  
  const droppedValue = event.dataTransfer?.getData('text/plain');
  if (droppedValue && draggedOption.value) {
    // Update the answer at the specific index
    const newAnswers = [...selectedAnswers.value];
    
    // Remove the value from its previous position if it exists
    const existingIndex = newAnswers.indexOf(droppedValue);
    if (existingIndex !== -1) {
      newAnswers[existingIndex] = '';
    }
    
    // Set the new value
    newAnswers[dropIndex] = droppedValue;
    
    selectedAnswers.value = newAnswers;
    emit('update:modelValue', newAnswers);
    
    // Update the UI
    updateDropZoneContent(dropIndex, droppedValue);
  }
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
};

const updateDropZoneContent = (index: number, content: string) => {
  const dropZone = document.querySelector(`[data-drop-index="${index}"]`);
  if (dropZone) {
    const contentSpan = dropZone.querySelector('.drop-zone-content');
    if (contentSpan) {
      contentSpan.textContent = content || 'Drop here';
      contentSpan.className = `drop-zone-content ${content ? 'has-answer' : 'empty'}`;
      (contentSpan as HTMLElement).style.color = content ? '#1e40af' : '#6b7280';
    }
  }
};

const removeAnswer = (index: number) => {
  const newAnswers = [...selectedAnswers.value];
  newAnswers[index] = '';
  selectedAnswers.value = newAnswers;
  emit('update:modelValue', newAnswers);
  updateDropZoneContent(index, '');
};

// Set up event listeners when component mounts
onMounted(() => {
  // Add event listeners to drop zones
  const setupDropZones = () => {
    const dropZones = document.querySelectorAll('.drop-zone');
    dropZones.forEach(zone => {
      const dropIndex = parseInt((zone as HTMLElement).dataset.dropIndex || '0');
      
      zone.addEventListener('dragover', (e) => handleDragOver(e as DragEvent));
      zone.addEventListener('drop', (e) => handleDrop(e as DragEvent, dropIndex));
      zone.addEventListener('click', () => removeAnswer(dropIndex));
    });
  };
  
  // Setup initially and after content updates
  nextTick(setupDropZones);
});

// Watch for changes in modelValue prop
watch(() => props.modelValue, (newValue) => {
  if (newValue && Array.isArray(newValue)) {
    selectedAnswers.value = [...newValue];
    // Update drop zone contents
    nextTick(() => {
      newValue.forEach((answer, index) => {
        updateDropZoneContent(index, answer);
      });
    });
  }
}, { immediate: true });

// Watch processedContent to setup drop zones when content changes
watch(processedContent, () => {
  nextTick(() => {
    const dropZones = document.querySelectorAll('.drop-zone');
    dropZones.forEach(zone => {
      const dropIndex = parseInt((zone as HTMLElement).dataset.dropIndex || '0');
      
      // Remove existing listeners
      zone.removeEventListener('dragover', handleDragOver as any);
      zone.removeEventListener('drop', (e) => handleDrop(e as DragEvent, dropIndex));
      
      // Add new listeners
      zone.addEventListener('dragover', (e) => handleDragOver(e as DragEvent));
      zone.addEventListener('drop', (e) => handleDrop(e as DragEvent, dropIndex));
      zone.addEventListener('click', () => removeAnswer(dropIndex));
    });
  });
});

// Cleanup event listeners on unmount
onUnmounted(() => {
  const dropZones = document.querySelectorAll('.drop-zone');
  dropZones.forEach(zone => {
    zone.removeEventListener('dragover', handleDragOver as any);
    zone.removeEventListener('drop', handleDrop as any);
    zone.removeEventListener('click', removeAnswer as any);
  });
});
</script>

<style scoped>
.draggable-selection-question {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.option-chip {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.option-chip:active {
  transform: scale(0.98);
}

:deep(.drop-zone) {
  transition: all 0.2s ease;
}

:deep(.drop-zone:hover) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
}

:deep(.drop-zone.has-answer) {
  background-color: #dbeafe !important;
  border-color: #3b82f6 !important;
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

:deep(.prose table) {
  width: 100%;
  margin: 1rem 0;
}

:deep(.prose td) {
  padding: 0.5rem;
  border: none;
}
</style>