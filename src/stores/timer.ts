import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'cdi_exam_timer'
const TOTAL_TIME = 60 * 60 // 60 minutes in seconds

interface TimerState {
  remainingTime: number
  isActive: boolean
  startTime: number | null
}

export const useTimerStore = defineStore('timer', () => {
  // Load from localStorage or initialize
  const loadFromStorage = (): TimerState => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const state = JSON.parse(stored)
        // Calculate elapsed time if timer was active
        if (state.isActive && state.startTime) {
          const elapsed = Math.floor((Date.now() - state.startTime) / 1000)
          const remaining = Math.max(0, state.remainingTime - elapsed)
          return {
            remainingTime: remaining,
            isActive: state.isActive && remaining > 0,
            startTime: Date.now()
          }
        }
        return state
      }
    } catch (error) {
      console.error('Failed to load timer from localStorage:', error)
    }
    return {
      remainingTime: TOTAL_TIME,
      isActive: false,
      startTime: null
    }
  }

  const remainingTime = ref(0)
  const isActive = ref(false)
  const startTime = ref<number | null>(null)
  let intervalId: number | null = null

  // Initialize from storage
  const initState = loadFromStorage()
  remainingTime.value = initState.remainingTime
  isActive.value = initState.isActive
  startTime.value = initState.startTime

  // Save to localStorage
  const saveToStorage = () => {
    try {
      const state: TimerState = {
        remainingTime: remainingTime.value,
        isActive: isActive.value,
        startTime: startTime.value
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (error) {
      console.error('Failed to save timer to localStorage:', error)
    }
  }

  // Watch for changes and save
  watch([remainingTime, isActive, startTime], () => {
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

  // Reset timer
  const reset = () => {
    stop()
    remainingTime.value = TOTAL_TIME
    startTime.value = null
  }

  // Clear timer from storage
  const clear = () => {
    stop()
    remainingTime.value = TOTAL_TIME
    isActive.value = false
    startTime.value = null
    localStorage.removeItem(STORAGE_KEY)
  }

  // Format time as MM:SS
  const formattedTime = () => {
    const minutes = Math.floor(remainingTime.value / 60)
    const seconds = remainingTime.value % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  // Get percentage completed
  const percentageCompleted = () => {
    return ((TOTAL_TIME - remainingTime.value) / TOTAL_TIME) * 100
  }

  // Check if timer has expired
  const isExpired = () => {
    return remainingTime.value === 0
  }

  // Resume timer if it was active
  if (isActive.value && remainingTime.value > 0) {
    start()
  }

  return {
    remainingTime,
    isActive,
    startTime,
    start,
    stop,
    reset,
    clear,
    formattedTime,
    percentageCompleted,
    isExpired
  }
})
