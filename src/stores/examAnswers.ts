import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

interface WritingTaskAnswer {
  task_1_answer?: string
  task_2_answer?: string
  word_count?: number
  score?: number
}

interface TestResults {
  listening?: {
    answers: Record<string, any>
    score?: number
    correct?: number
    incorrect?: number
  }
  reading?: {
    answers: Record<string, any>
    score?: number
    correct?: number
    incorrect?: number
  }
  writing?: {
    answers: WritingTaskAnswer[]
    feedback?: string
  }
  submitted_at?: string
  total_time_spent?: number
}

const STORAGE_KEY = 'cdi_exam_answers'

export const useExamAnswersStore = defineStore('examAnswers', () => {
  // Initialize from localStorage or empty object
  const loadFromStorage = (): TestResults => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error('Failed to load answers from localStorage:', error)
      return {}
    }
  }

  const testResults = ref<TestResults>(loadFromStorage())

  // Save to localStorage whenever testResults changes
  watch(
    testResults,
    (newValue) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newValue))
      } catch (error) {
        console.error('Failed to save answers to localStorage:', error)
      }
    },
    { deep: true },
  )

  // Listening answers
  const setListeningAnswers = (answers: Record<string, any>) => {
    if (!testResults.value.listening) {
      testResults.value.listening = { answers: {} }
    }
    testResults.value.listening.answers = answers
  }

  const getListeningAnswers = () => {
    return testResults.value.listening?.answers || {}
  }

  const updateListeningAnswer = (key: string, value: any) => {
    if (!testResults.value.listening) {
      testResults.value.listening = { answers: {} }
    }
    testResults.value.listening.answers[key] = value
  }

  const setListeningResults = (score: number, correct: number, incorrect: number) => {
    if (!testResults.value.listening) {
      testResults.value.listening = { answers: {} }
    }
    testResults.value.listening.score = score
    testResults.value.listening.correct = correct
    testResults.value.listening.incorrect = incorrect
  }

  // Reading answers
  const setReadingAnswers = (answers: Record<string, any>) => {
    if (!testResults.value.reading) {
      testResults.value.reading = { answers: {} }
    }
    testResults.value.reading.answers = answers
  }

  const getReadingAnswers = () => {
    return testResults.value.reading?.answers || {}
  }

  const updateReadingAnswer = (key: string, value: any) => {
    if (!testResults.value.reading) {
      testResults.value.reading = { answers: {} }
    }
    testResults.value.reading.answers[key] = value
  }

  const setReadingResults = (score: number, correct: number, incorrect: number) => {
    if (!testResults.value.reading) {
      testResults.value.reading = { answers: {} }
    }
    testResults.value.reading.score = score
    testResults.value.reading.correct = correct
    testResults.value.reading.incorrect = incorrect
  }

  // Writing answers
  const setWritingAnswers = (answers: WritingTaskAnswer[]) => {
    if (!testResults.value.writing) {
      testResults.value.writing = { answers: [] }
    }
    testResults.value.writing.answers = answers
  }

  const getWritingAnswers = () => {
    return testResults.value.writing?.answers || []
  }

  const updateWritingTask = (taskIndex: number, answer: WritingTaskAnswer) => {
    if (!testResults.value.writing) {
      testResults.value.writing = { answers: [] }
    }
    if (!testResults.value.writing.answers) {
      testResults.value.writing.answers = []
    }
    testResults.value.writing.answers[taskIndex] = answer
  }

  const setWritingFeedback = (feedback: string) => {
    if (!testResults.value.writing) {
      testResults.value.writing = { answers: [] }
    }
    testResults.value.writing.feedback = feedback
  }

  // General metadata
  const setSubmittedAt = (timestamp: string) => {
    testResults.value.submitted_at = timestamp
  }

  const setTotalTimeSpent = (seconds: number) => {
    testResults.value.total_time_spent = seconds
  }

  // Clear specific test answers
  const clearListeningAnswers = () => {
    testResults.value.listening = undefined
  }

  const clearReadingAnswers = () => {
    testResults.value.reading = undefined
  }

  const clearWritingAnswers = () => {
    testResults.value.writing = undefined
  }

  // Clear all answers
  const clearAllAnswers = () => {
    testResults.value = {}
    localStorage.removeItem(STORAGE_KEY)
  }

  // Get full test results
  const getTestResults = () => {
    return testResults.value
  }

  return {
    testResults,
    // Listening
    setListeningAnswers,
    getListeningAnswers,
    updateListeningAnswer,
    setListeningResults,
    // Reading
    setReadingAnswers,
    getReadingAnswers,
    updateReadingAnswer,
    setReadingResults,
    // Writing
    setWritingAnswers,
    getWritingAnswers,
    updateWritingTask,
    setWritingFeedback,
    // Metadata
    setSubmittedAt,
    setTotalTimeSpent,
    // Clear functions
    clearListeningAnswers,
    clearReadingAnswers,
    clearWritingAnswers,
    clearAllAnswers,
    // Get full results
    getTestResults,
  }
})
