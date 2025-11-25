import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'

export type TestStatus = 'not_started' | 'in_progress' | 'completed'
export type ConfirmationStatus = 'not_confirmed' | 'confirmed'

interface TestState {
  status: TestStatus
  confirmation: ConfirmationStatus
}

interface TestStatusState {
  listening: TestState
  reading: TestState
  writing: TestState
}

const STORAGE_KEY = 'cdi_test_status'

export const useTestStatusStore = defineStore('testStatus', () => {
  // Initialize from localStorage or default state
  const loadFromStorage = (): TestStatusState => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored
        ? JSON.parse(stored)
        : {
            listening: { status: 'not_started', confirmation: 'not_confirmed' },
            reading: { status: 'not_started', confirmation: 'not_confirmed' },
            writing: { status: 'not_started', confirmation: 'not_confirmed' },
          }
    } catch (error) {
      console.error('Failed to load test status from localStorage:', error)
      return {
        listening: { status: 'not_started', confirmation: 'not_confirmed' },
        reading: { status: 'not_started', confirmation: 'not_confirmed' },
        writing: { status: 'not_started', confirmation: 'not_confirmed' },
      }
    }
  }

  const testStatus = ref<TestStatusState>(loadFromStorage())

  // Save to localStorage whenever testStatus changes
  watch(
    testStatus,
    (newValue) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newValue))
      } catch (error) {
        console.error('Failed to save test status to localStorage:', error)
      }
    },
    { deep: true },
  )

  // Computed properties for each test
  const listeningStatus = computed(() => testStatus.value.listening.status)
  const readingStatus = computed(() => testStatus.value.reading.status)
  const writingStatus = computed(() => testStatus.value.writing.status)

  const listeningConfirmation = computed(() => testStatus.value.listening.confirmation)
  const readingConfirmation = computed(() => testStatus.value.reading.confirmation)
  const writingConfirmation = computed(() => testStatus.value.writing.confirmation)

  // Check if accordion should be shown (enabled)
  const isListeningEnabled = computed(() => true) // Always enabled
  const isReadingEnabled = computed(() => testStatus.value.listening.status === 'completed')
  const isWritingEnabled = computed(() => testStatus.value.reading.status === 'completed')

  // Actions to update status
  const confirmListening = () => {
    testStatus.value.listening.confirmation = 'confirmed'
  }

  const confirmReading = () => {
    testStatus.value.reading.confirmation = 'confirmed'
  }

  const confirmWriting = () => {
    testStatus.value.writing.confirmation = 'confirmed'
  }

  const startListening = () => {
    testStatus.value.listening.status = 'in_progress'
  }

  const startReading = () => {
    testStatus.value.reading.status = 'in_progress'
  }

  const startWriting = () => {
    testStatus.value.writing.status = 'in_progress'
  }

  const completeListening = () => {
    testStatus.value.listening.status = 'completed'
  }

  const completeReading = () => {
    testStatus.value.reading.status = 'completed'
  }

  const completeWriting = () => {
    testStatus.value.writing.status = 'completed'
  }

  // Reset all tests
  const resetAllTests = () => {
    testStatus.value = {
      listening: { status: 'not_started', confirmation: 'not_confirmed' },
      reading: { status: 'not_started', confirmation: 'not_confirmed' },
      writing: { status: 'not_started', confirmation: 'not_confirmed' },
    }
  }

  return {
    testStatus,
    listeningStatus,
    readingStatus,
    writingStatus,
    listeningConfirmation,
    readingConfirmation,
    writingConfirmation,
    isListeningEnabled,
    isReadingEnabled,
    isWritingEnabled,
    confirmListening,
    confirmReading,
    confirmWriting,
    startListening,
    startReading,
    startWriting,
    completeListening,
    completeReading,
    completeWriting,
    resetAllTests,
  }
})
