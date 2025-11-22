<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
    <!-- Left Column: Task Description -->
    <div class="space-y-4">
      <Card class="bg-gray-50 dark:bg-gray-800 border shadow-none">
        <CardContent class="p-6">
          <div class="space-y-4">
            <!-- Task Prompt -->
            <div class="text-gray-900 dark:text-gray-100 whitespace-pre-line">
              {{ task.prompt }}
            </div>

            <!-- Image if available -->
            <div v-if="task.visual_url" class="mt-4">
              <img :src="task.visual_url" alt="Task visual" class="w-full h-auto border" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Right Column: Text Editor -->
    <div class="flex flex-col h-full">
      <div class="flex-1 border dark:border-gray-600 bg-white dark:bg-gray-800 relative">
        <Textarea
          v-model="answer"
          @input="updateAnswer"
          class="w-full h-full p-4 resize-none focus:outline-none bg-transparent text-gray-900 dark:text-gray-100"
          placeholder="Write your answer here..."
        ></Textarea>

        <!-- Word Counter -->
        <div
          class="absolute bottom-2 right-4 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1"
        >
          Words: {{ wordCount }}
        </div>
      </div>

      <!-- Navigation Buttons -->
      <div class="flex justify-between items-center mt-4">
        <Button variant="outline" size="default" class="gap-2" @click="goToPrevious">
          <ChevronLeft class="h-4 w-4" />
        </Button>

        <Button variant="outline" size="default" @click="goToNext">
          <ChevronRight class="h-4 w-4" />
        </Button>
      </div>

      <!-- Submit Button (optional) -->
      <div class="flex justify-center mt-2">
        <Button variant="default" class="gap-2">
          <Check class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Check } from 'lucide-vue-next'
import { Textarea } from '@/components/ui/textarea'

interface Task {
  id: string
  task: string
  task_type: string
  prompt: string
  visual_url?: string
  min_words: number
  time_minutes: number
}

interface Props {
  task: Task
  modelValue?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const answer = ref(props.modelValue)

const wordCount = computed(() => {
  const text = answer.value.trim()
  if (!text) return 0
  return text.split(/\s+/).length
})

watch(
  () => props.modelValue,
  (newValue) => {
    answer.value = newValue
  },
)

const updateAnswer = () => {
  emit('update:modelValue', answer.value)
}

const goToPrevious = () => {
  // Emit event or use router to navigate to previous part
  const currentPart = parseInt(new URLSearchParams(window.location.search).get('part') || '1')
  if (currentPart > 1) {
    window.history.pushState({}, '', `?part=${currentPart - 1}`)
    window.location.reload()
  }
}

const goToNext = () => {
  // Emit event or use router to navigate to next part
  const currentPart = parseInt(new URLSearchParams(window.location.search).get('part') || '1')
  window.history.pushState({}, '', `?part=${currentPart + 1}`)
  window.location.reload()
}
</script>
