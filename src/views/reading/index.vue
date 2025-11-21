<template>
  <div class="reading-wrap">
    <div class="reading-header">
      <h1>Reading Test</h1>
      <div v-if="isLoading" class="reading-loading">Loading reading test...</div>
      <div v-else-if="error" class="reading-error">{{ error }}</div>
    </div>
    <div v-if="!isLoading && !error" class="reading-content">
      <div v-if="readingData">
        <h2>{{ readingData.title }}</h2>
        <p>{{ readingData.description }}</p>
        <div v-for="part in readingData.parts" :key="part.id" class="reading-part">
          <div class="reading-passage" v-html="part.passage"></div>
          <div v-for="section in part.question.content" :key="section.id" class="reading-section">
            <h3>{{ section.title }}</h3>
            <p v-if="section.condition">{{ section.condition }}</p>
            <!-- Selection Questions -->
            <div v-if="section.type === 'selection'">
              <div v-html="section.content"></div>
              <div v-if="section.showOptions">
                <div v-if="section.optionsTitle" class="options-title">
                  {{ section.optionsTitle }}
                </div>
                <div class="options-list">
                  <label v-for="opt in section.options" :key="opt.id" class="option-label">
                    <input
                      type="radio"
                      :name="`section_${section.id}`"
                      :value="opt.value"
                      v-model="answers[part.id][section.id]"
                    />
                    {{ opt.value }} <span v-if="opt.label">{{ opt.label }}</span>
                  </label>
                </div>
              </div>
            </div>
            <!-- Completion Questions -->
            <div v-else-if="section.type === 'completion'">
              <div v-html="section.content"></div>
              <input
                type="text"
                v-model="answers[part.id][section.id]"
                class="completion-input"
                placeholder="Your answer..."
              />
            </div>
            <!-- Multiple Choice Questions -->
            <div v-else-if="section.type === 'multiple-choice'">
              <div v-for="q in section.questions" :key="q.id" class="mc-question">
                <p>{{ q.question }}</p>
                <div class="options-list">
                  <label v-for="opt in q.options" :key="opt.id" class="option-label">
                    <input
                      type="radio"
                      :name="`mc_${section.id}_${q.id}`"
                      :value="opt.value"
                      v-model="answers[part.id][section.id][q.id]"
                    />
                    {{ opt.value }} <span v-if="opt.label">{{ opt.label }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button class="submit-btn" @click="submitAnswers" :disabled="isSubmitting">
          {{ isSubmitting ? 'Submitting...' : 'Submit Answers' }}
        </button>
      </div>
      <div v-else class="reading-empty">No reading test available.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { get, post } from '@/utils/api'

const isLoading = ref(true)
const isSubmitting = ref(false)
const error = ref('')
const readingData = ref<any>(null)
const answers = ref<Record<string, any>>({})

onMounted(async () => {
  try {
    const response = await get('/student/reading')
    readingData.value = response.data
    // Initialize answers object for each part and section
    if (readingData.value?.parts) {
      for (const part of readingData.value.parts) {
        answers.value[part.id] = {}
        if (part.question?.content) {
          for (const section of part.question.content) {
            if (section.type === 'multiple-choice') {
              answers.value[part.id][section.id] = {}
              if (section.questions) {
                for (const q of section.questions) {
                  answers.value[part.id][section.id][q.id] = ''
                }
              }
            } else {
              answers.value[part.id][section.id] = ''
            }
          }
        }
      }
    }
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Failed to load reading test.'
  } finally {
    isLoading.value = false
  }
})

const submitAnswers = async () => {
  isSubmitting.value = true
  error.value = ''
  try {
    const response = await post('/student/reading/submit', { answers: answers.value })
    alert('Answers submitted!')
    // Optionally handle response (score, feedback, etc.)
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Failed to submit answers.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.reading-wrap {
  max-width: 900px;
  margin: 40px auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(37, 99, 235, 0.12);
  padding: 32px;
  font-family: 'Segoe UI', Arial, sans-serif;
}
.reading-header {
  text-align: center;
  margin-bottom: 32px;
}
.reading-header h1 {
  color: #2563eb;
  font-size: 2.5rem;
  font-weight: 700;
}
.reading-loading,
.reading-error,
.reading-empty {
  text-align: center;
  color: #2563eb;
  font-size: 1.2rem;
  margin: 24px 0;
}
.reading-content h2 {
  color: #1d4ed8;
  font-size: 1.5rem;
  margin-bottom: 12px;
}
.reading-content p {
  color: #374151;
  margin-bottom: 24px;
}
.reading-part {
  margin-bottom: 40px;
}
.reading-passage {
  background: #f3f6fd;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.07);
}
.reading-section {
  margin-bottom: 32px;
}
.options-title {
  font-weight: 600;
  color: #2563eb;
  margin-bottom: 8px;
}
.options-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
.option-label {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #e0e7ff;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
}
.completion-input {
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #2563eb;
  font-size: 1rem;
  margin-top: 8px;
}
.submit-btn {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: #fff;
  font-weight: 600;
  font-size: 1.1rem;
  padding: 14px 32px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  margin-top: 24px;
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.15);
  transition: background 0.2s;
}
.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
