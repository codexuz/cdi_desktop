import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY_PREFIX = 'cdi_exam_timer'

// Default time durations in seconds
const DEFAULT_TIMES = {
  reading: 60 * 60, // 60 minutes
  writing: 60 * 60, // 60 minutes
  listening: 30 * 60, // 30 minutes
  speaking: 15 * 60, // 15 minutes
}

interface TimerState {
  remainingTime: number
  isActive: boolean
  startTime: number | null
  examType: string
  totalTime: number
}

export const useTimerStore = defineStore('timer', () => {
  const examType = ref<string>('reading')
  const totalTime = ref<number>(DEFAULT_TIMES.reading)
  const remainingTime = ref(0)
  const isActive = ref(false)
  const startTime = ref<number | null>(null)
  let intervalId: number | null = null

  // Get storage key for current exam type
  const getStorageKey = () => `${STORAGE_KEY_PREFIX}_${examType.value}`

  // Load from localStorage or initialize
  const loadFromStorage = (): TimerState => {
    try {
      const stored = localStorage.getItem(getStorageKey())
      if (stored) {
        const state = JSON.parse(stored)
        // Calculate elapsed time if timer was active
        if (state.isActive && state.startTime) {
          const elapsed = Math.floor((Date.now() - state.startTime) / 1000)
          const remaining = Math.max(0, state.remainingTime - elapsed)
          return {
            remainingTime: remaining,
            isActive: state.isActive && remaining > 0,
            startTime: Date.now(),
            examType: state.examType,
            totalTime: state.totalTime,
          }
        }
        return state
      }
    } catch (error) {
      console.error('Failed to load timer from localStorage:', error)
    }
    return {
      remainingTime: totalTime.value,
      isActive: false,
      startTime: null,
      examType: examType.value,
      totalTime: totalTime.value,
    }
  }

  // Initialize from storage
  const initState = loadFromStorage()
  remainingTime.value = initState.remainingTime
  isActive.value = initState.isActive
  startTime.value = initState.startTime
  examType.value = initState.examType
  totalTime.value = initState.totalTime

  // Save to localStorage
  const saveToStorage = () => {
    try {
      const state: TimerState = {
        remainingTime: remainingTime.value,
        isActive: isActive.value,
        startTime: startTime.value,
        examType: examType.value,
        totalTime: totalTime.value,
      }
      localStorage.setItem(getStorageKey(), JSON.stringify(state))
    } catch (error) {
      console.error('Failed to save timer to localStorage:', error)
    }
  }

  // Watch for changes and save
  watch([remainingTime, isActive, startTime, examType, totalTime], () => {
    saveToStorage()
  })

  // Start timer
  const start = () => {
    if (isActive.value) return

    isActive.value = true
    startTime.value = Date.now()

    intervalId = setInterval(() => {
      if (remainingTime.value > 0) {
        remainingTime.value--

        // Auto-finish when time reaches 0
        if (remainingTime.value === 0) {
          stop()
          // Emit event or callback for finishing test
          window.dispatchEvent(new CustomEvent('timer-finished'))
        }
      } else {
        stop()
      }
    }, 1000)
  }

  // Stop/pause timer
  const stop = () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
    isActive.value = false
    startTime.value = null
  }

  // Initialize timer for specific exam type
  const initialize = (
    type: 'reading' | 'writing' | 'listening' | 'speaking',
    duration?: number,
  ) => {
    stop()
    examType.value = type
    totalTime.value = duration || DEFAULT_TIMES[type]

    // Try to load from storage for this exam type
    const state = loadFromStorage()
    remainingTime.value = state.remainingTime
    isActive.value = state.isActive
    startTime.value = state.startTime

    // Resume if was active
    if (isActive.value && remainingTime.value > 0) {
      start()
    }
  }

  // Reset timer
  const reset = () => {
    stop()
    remainingTime.value = totalTime.value
    startTime.value = null
  }

  // Clear timer from storage
  const clear = () => {
    stop()
    remainingTime.value = totalTime.value
    isActive.value = false
    startTime.value = null
    localStorage.removeItem(getStorageKey())
  }

  // Clear all timers from storage
  const clearAll = () => {
    stop()
    Object.keys(DEFAULT_TIMES).forEach((type) => {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}_${type}`)
    })
    remainingTime.value = totalTime.value
    isActive.value = false
    startTime.value = null
  }

  // Format time as MM:SS
  const formattedTime = () => {
    const minutes = Math.floor(remainingTime.value / 60)
    const seconds = remainingTime.value % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  // Get percentage completed
  const percentageCompleted = () => {
    return ((totalTime.value - remainingTime.value) / totalTime.value) * 100
  }

  // Check if timer has expired
  const isExpired = () => {
    return remainingTime.value === 0
  }

  // Get remaining time in minutes
  const remainingMinutes = () => {
    return Math.ceil(remainingTime.value / 60)
  }

  // Resume timer if it was active
  if (isActive.value && remainingTime.value > 0) {
    start()
  }

  return {
    examType,
    totalTime,
    remainingTime,
    isActive,
    startTime,
    initialize,
    start,
    stop,
    reset,
    clear,
    clearAll,
    formattedTime,
    percentageCompleted,
    isExpired,
    remainingMinutes,
  }
})
