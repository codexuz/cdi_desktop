<script setup lang="ts">
import { Sun, Moon } from 'lucide-vue-next'
import { useDark, useToggle } from '@vueuse/core'
import { ref, watch, onUnmounted } from 'vue'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { useTimerStore } from '@/stores/timer'
import { useRouter } from 'vue-router'

const isDark = useDark()
const toggleDark = useToggle(isDark)
const timerStore = useTimerStore()
const router = useRouter()

const toggleTheme = () => {
  toggleDark()
}

defineProps({
  title: String,
  timer: {
    type: Boolean,
    default: true,
  },
})

const open = ref(false)

// Watch for timer expiration
watch(
  () => timerStore.isExpired(),
  (expired) => {
    if (expired) {
      alert('Time is up! The exam will now finish.')
      handleFinish()
    }
  },
)

const handleFinish = () => {
  // Stop the timer
  timerStore.stop()
  // Navigate to results or home page
  router.push('/tests')
}

// Cleanup on unmount
onUnmounted(() => {
  // Don't stop the timer when component unmounts, let it continue running
})
</script>

<template>
  <header
    class="sticky top-0 z-50 py-2 w-full bg-white/30 dark:bg-black dark:border pb-3 backdrop-blur-md shadow-sm"
  >
    <div class="mx-4 flex h-full items-center justify-between px-4 gap-3">
      <h1 class="scroll-m-20 text-xl font-bold tracking-tight">{{ title }}</h1>
      <div v-if="timer">
        <Button
          variant="ghost"
          class="text-xl font-semibold"
          :class="timerStore.remainingTime < 300 ? 'text-red-500' : ''"
        >
          {{ timerStore.formattedTime() }}
        </Button>
      </div>

      <div class="flex items-center justify-end gap-x-4">
        <Button variant="outline" class="rounded-full border-none w-9 h-9" @click="toggleTheme">
          <template v-if="!isDark">
            <Sun />
          </template>
          <template v-else>
            <Moon />
          </template>
        </Button>
        <Button
          @click="() => (open = true)"
          class="bg-red-500 hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-800 text-white cursor-pointer rounded-xl"
          >Finish</Button
        >
      </div>
    </div>
  </header>

  <AlertDialog v-model:open="open" class="w-[100px] dark:bg-black dark:text-white">
    <AlertDialogContent class="w-[350px] rounded-xl text-center dark:bg-black dark:text-white">
      <AlertDialogHeader>
        <AlertDialogTitle class="text-center">Confirm Finish</AlertDialogTitle>
        <AlertDialogDescription class="text-center">
          Are you sure you want to finish the exam?
        </AlertDialogDescription>
      </AlertDialogHeader>
      <div class="flex items-center justify-center gap-x-4">
        <AlertDialogCancel class="bg-gray-200 hover:bg-gray-300 cursor-pointer rounded-lg"
          >Cancel</AlertDialogCancel
        >
        <AlertDialogAction
          @click="handleFinish"
          class="bg-red-500 hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-800 text-white cursor-pointer rounded-lg"
          >Finish</AlertDialogAction
        >
      </div>
    </AlertDialogContent>
  </AlertDialog>
</template>
