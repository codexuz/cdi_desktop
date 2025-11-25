<template>
  <div class="draggable-selection-question mb-8">
    <!-- Title -->
    <h3 v-if="question.title" class="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
      {{ question.title }}
    </h3>

    <!-- Condition/Instructions -->
    <div
      v-if="question.condition"
      class="instructions mb-6 text-gray-700 dark:text-gray-300"
      v-html="question.condition"
    />

    <!-- Options Title -->
    <div v-if="question.optionsTitle" class="options-title mb-4">
      <h4 class="text-lg font-semibold text-gray-800">{{ question.optionsTitle }}</h4>
    </div>

    <!-- Available Options (Drag Source) -->
    <div class="available-options mb-6">
      <h4 class="font-semibold mb-3 text-gray-700 dark:text-gray-200">Options:</h4>
      <div
        class="options-pool p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 min-h-20"
      >
        <div class="flex flex-wrap gap-2">
          <div
            v-for="option in props.question.options"
            :key="option.id"
            :draggable="true"
            @dragstart="handleDragStart(option, $event)"
            @dragend="handleDragEnd"
            class="option-chip bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 px-4 py-1 rounded cursor-move hover:bg-gray-200 dark:hover:bg-gray-800 transition-all duration-200 border border-gray-300 dark:border-gray-700 select-none shadow-sm active:scale-95"
            :class="{ 'opacity-50': isDragging && draggedOption?.id === option.id }"
          >
            {{ option.value }}
          </div>
        </div>
      </div>
    </div>

    <!-- Drop Zones (Questions) -->
    <div class="questions-content text-gray-900 dark:text-gray-100 leading-relaxed">
      <div v-html="processedContent" class="prose max-w-none dark:prose-invert" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
interface DraggableOption {
  id: string
  value: string
}

interface DraggableSelectionQuestion {
  id: string
  type: 'draggable-selection'
  title?: string
  condition?: string
  content: string
  options: DraggableOption[]
  optionsTitle?: string
}

interface Props {
  question: DraggableSelectionQuestion
  startingQuestionNumber: number
  activeQuestionNumber?: number
  modelValue?: string[]
  showAnswers?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string[]): void
  (e: 'question-click', questionNumber: number): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  showAnswers: false,
  activeQuestionNumber: 1,
})

const emit = defineEmits<Emits>()

const selectedAnswers = ref<string[]>(props.modelValue || [])
const questionCount = computed(() => {
  const matches = props.question.content.match(/@@/g)
  return matches ? matches.length : 0
})
const isDragging = ref(false)
const draggedOption = ref<DraggableOption | null>(null)

// Process content to replace @@ with drop zones
const processedContent = computed(() => {
  let content = props.question.content
  let dropZoneIndex = 0

  // Replace @@ with drop zones
  content = content.replace(/@@/g, () => {
    const currentIndex = dropZoneIndex++
    const questionNumber = props.startingQuestionNumber + currentIndex
    const currentAnswer = selectedAnswers.value[currentIndex] || ''
    const isActive = props.activeQuestionNumber === questionNumber

    return `<span 
      class="drop-zone inline-flex items-center gap-2 min-w-40 dark:bg-gray-800 px-3 py-1 my-1 border-2 ${isActive ? 'border-blue-500 bg-blue-100' : 'border-dashed border-gray-300 bg-gray-50'} rounded cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors" 
      data-drop-index="${currentIndex}"
      data-question-number="${questionNumber}"
      style="vertical-align: middle;"
    >
      <span class="question-number font-semibold text-sm ${isActive ? 'text-blue-600' : 'text-gray-600'}">${questionNumber}</span>
      <span class="drop-zone-content ${currentAnswer ? 'has-answer font-semibold text-blue-700' : 'empty text-gray-400'} flex-1 text-center">
        ${currentAnswer || 'Drop here'}
      </span>
    </span>`
  })

  return content
})

// Drag and drop handlers
const handleDragStart = (option: DraggableOption, event: DragEvent) => {
  isDragging.value = true
  draggedOption.value = option

  if (event.dataTransfer) {
    event.dataTransfer.setData('text/plain', option.value)
    event.dataTransfer.effectAllowed = 'move'
  }
}

const handleDragEnd = () => {
  isDragging.value = false
  draggedOption.value = null
}

const handleDrop = (event: DragEvent, dropIndex: number) => {
  event.preventDefault()

  const droppedValue = event.dataTransfer?.getData('text/plain')
  if (droppedValue && draggedOption.value) {
    // Update the answer at the specific index
    const newAnswers = [...selectedAnswers.value]

    // Remove the value from its previous position if it exists
    const existingIndex = newAnswers.indexOf(droppedValue)
    if (existingIndex !== -1) {
      newAnswers[existingIndex] = ''
    }

    // Set the new value
    newAnswers[dropIndex] = droppedValue

    selectedAnswers.value = newAnswers
    emit('update:modelValue', newAnswers)

    // Update the UI
    updateDropZoneContent(dropIndex, droppedValue)
  }
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

const updateDropZoneContent = (index: number, content: string) => {
  const dropZone = document.querySelector(`[data-drop-index="${index}"]`)
  if (dropZone) {
    const contentSpan = dropZone.querySelector('.drop-zone-content')
    if (contentSpan) {
      contentSpan.textContent = content || 'Drop here'
      contentSpan.className = `drop-zone-content ${content ? 'has-answer' : 'empty'}`
      ;(contentSpan as HTMLElement).style.color = content ? '#1e40af' : '#6b7280'
    }
  }
}

const removeAnswer = (index: number) => {
  const newAnswers = [...selectedAnswers.value]
  newAnswers[index] = ''
  selectedAnswers.value = newAnswers
  emit('update:modelValue', newAnswers)
  updateDropZoneContent(index, '')
}

// Set up event listeners when component mounts
onMounted(() => {
  // Add event listeners to drop zones
  const setupDropZones = () => {
    const dropZones = document.querySelectorAll('.drop-zone')
    dropZones.forEach((zone) => {
      const dropIndex = parseInt((zone as HTMLElement).dataset.dropIndex || '0')
      const questionNumber = parseInt((zone as HTMLElement).dataset.questionNumber || '0')

      zone.addEventListener('dragover', (e) => handleDragOver(e as DragEvent))
      zone.addEventListener('drop', (e) => handleDrop(e as DragEvent, dropIndex))
      zone.addEventListener('click', (e) => {
        // Right click or Ctrl+click to remove answer
        if ((e as MouseEvent).ctrlKey || (e as MouseEvent).button === 2) {
          removeAnswer(dropIndex)
        } else {
          // Regular click to focus question
          emit('question-click', questionNumber)
        }
      })
      zone.addEventListener('contextmenu', (e) => {
        e.preventDefault()
        removeAnswer(dropIndex)
      })
    })
  }

  // Setup initially and after content updates
  nextTick(setupDropZones)
})

// Watch for changes in modelValue prop
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && Array.isArray(newValue)) {
      selectedAnswers.value = [...newValue]
      // Update drop zone contents
      nextTick(() => {
        newValue.forEach((answer, index) => {
          updateDropZoneContent(index, answer)
        })
      })
    }
  },
  { immediate: true },
)

// Watch processedContent to setup drop zones when content changes
watch(processedContent, () => {
  nextTick(() => {
    const dropZones = document.querySelectorAll('.drop-zone')
    dropZones.forEach((zone) => {
      const dropIndex = parseInt((zone as HTMLElement).dataset.dropIndex || '0')
      const questionNumber = parseInt((zone as HTMLElement).dataset.questionNumber || '0')

      // Remove existing listeners
      zone.removeEventListener('dragover', handleDragOver as any)
      zone.removeEventListener('drop', (e) => handleDrop(e as DragEvent, dropIndex))
      zone.removeEventListener('click', removeAnswer as any)
      zone.removeEventListener('contextmenu', removeAnswer as any)

      // Add new listeners
      zone.addEventListener('dragover', (e) => handleDragOver(e as DragEvent))
      zone.addEventListener('drop', (e) => handleDrop(e as DragEvent, dropIndex))
      zone.addEventListener('click', (e) => {
        if ((e as MouseEvent).ctrlKey || (e as MouseEvent).button === 2) {
          removeAnswer(dropIndex)
        } else {
          emit('question-click', questionNumber)
        }
      })
      zone.addEventListener('contextmenu', (e) => {
        e.preventDefault()
        removeAnswer(dropIndex)
      })
    })
  })
})

// Cleanup event listeners on unmount
onUnmounted(() => {
  const dropZones = document.querySelectorAll('.drop-zone')
  dropZones.forEach((zone) => {
    zone.removeEventListener('dragover', handleDragOver as any)
    zone.removeEventListener('drop', handleDrop as any)
    zone.removeEventListener('click', removeAnswer as any)
  })
})
</script>
