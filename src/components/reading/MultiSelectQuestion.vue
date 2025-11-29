<template>
  <div class="mb-8">
    <div class="mb-4">
      <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{{ title }}</h3>
      <div v-if="condition" class="text-gray-600 dark:text-gray-400 mb-4" v-html="condition"></div>
    </div>

    <!-- This is multi-select spanning multiple question numbers -->
    <div
      :ref="setContainerRef"
      class="grid w-[60%] gap-3 mt-4 p-3 rounded transition-colors"
      :class="isActiveRange ? 'bg-gray-100 dark:bg-blue-900/20' : ''"
    >
      <div class="flex gap-2 mb-2">
        <span
          v-for="i in limit"
          :key="i"
          class="inline-block min-w-[30px] h-6 text-slate-800 dark:text-slate-400 font-bold text-center leading-5 text-sm cursor-pointer"
          :class="
            activeQuestionNumber === startNumber + i - 1 ? 'bg-blue-500 text-white rounded' : ''
          "
          @click="emit('question-click', startNumber + i - 1)"
        >
          {{ startNumber + i - 1 }}
        </span>
      </div>

      <label
        v-for="option in options"
        :key="option.id"
        class="flex items-center gap-3 px-4 py-3"
        :class="
          !isSelected(option.value) && selectedCount >= limit
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-pointer'
        "
        @click.stop
      >
        <input
          type="checkbox"
          :value="option.value"
          :checked="isSelected(option.value)"
          :disabled="!isSelected(option.value) && selectedCount >= limit"
          @change="handleCheckboxChange(option.value)"
          class="w-4 h-4 accent-blue-600"
          :class="
            !isSelected(option.value) && selectedCount >= limit
              ? 'cursor-not-allowed'
              : 'cursor-pointer'
          "
        />
        <span class="font-semibold text-slate-600 dark:text-slate-200 text-base min-w-6">
          {{ option.value }}
        </span>
        <span class="text-gray-700 dark:text-gray-300 flex-1">{{ option.label }}</span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'

interface Option {
  id: string
  value: string
  label: string
}

interface Props {
  title: string
  condition?: string
  options: Option[]
  startNumber: number
  limit: number
  modelValue?: Record<number, string>
  activeQuestionNumber?: number
}

const props = withDefaults(defineProps<Props>(), {
  condition: '',
  limit: 3,
  modelValue: () => ({}),
  activeQuestionNumber: 0,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: Record<number, string>): void
  (e: 'register-refs', refs: Record<number, HTMLElement>): void
  (e: 'question-click', questionNumber: number): void
}>()

const questionElements = ref<Record<number, HTMLElement>>({})
const localValues = ref<Record<number, string>>({})
const containerRef = ref<HTMLElement | null>(null)

// Initialize local values from modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    if (typeof newValue === 'object' && newValue !== null) {
      localValues.value = { ...newValue }
    } else {
      localValues.value = {}
    }
  },
  { immediate: true, deep: true },
)

// Check if active question is within this multi-select range
const isActiveRange = computed(() => {
  const endNumber = props.startNumber + props.limit - 1
  return props.activeQuestionNumber >= props.startNumber && props.activeQuestionNumber <= endNumber
})

// Set container ref - register for all question numbers in range
const setContainerRef = (el: any) => {
  if (el) {
    containerRef.value = el as HTMLElement
    // Register this element for all question numbers in the range
    for (let i = 0; i < props.limit; i++) {
      questionElements.value[props.startNumber + i] = el as HTMLElement
    }
  }
}

// Get current selected values as array
const getCurrentValuesArray = (): string[] => {
  return Object.values(localValues.value)
}

// Check if an option is selected
const isSelected = (value: string) => {
  const values = getCurrentValuesArray()
  return values.includes(value)
}

// Count of selected options
const selectedCount = computed(() => {
  return Object.keys(localValues.value).length
})

// Handle checkbox change
const handleCheckboxChange = (value: string) => {
  const newValues = { ...localValues.value }

  // Find if this value is already selected (find the question number key)
  const existingKey = Object.keys(newValues).find((key) => newValues[Number(key)] === value)

  if (existingKey) {
    // Uncheck: remove from selection
    delete newValues[Number(existingKey)]
  } else {
    // Check: add to selection if under limit
    if (Object.keys(newValues).length < props.limit) {
      // Find the next available question number in range
      for (let i = 0; i < props.limit; i++) {
        const questionNumber = props.startNumber + i
        if (!newValues[questionNumber]) {
          newValues[questionNumber] = value
          break
        }
      }
    } else {
      // Already at limit, don't add
      console.log('Limit reached, cannot add more')
      return
    }
  }

  console.log('Emitting new values:', newValues)
  // Update local state immediately for reactivity
  localValues.value = newValues
  // Emit the updated value
  emit('update:modelValue', newValues)
}

// Register refs on mount
onMounted(() => {
  emit('register-refs', questionElements.value)
})
</script>
