<template>
  <div class="min-h-screen bg-[#2563eb]">
    <!-- Header -->
    <header class="border-b sticky top-0 bg-white">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <Button
          variant="ghost"
            @click="router.push('/')"
            class="flex items-center gap-2 text-gray-600 hover:text-[#2563eb] transition-colors"
          >
            <ArrowLeft class="w-5 h-5" />
            <span>Back</span>
          </Button>
          <div class="text-[#2563eb] font-bold text-xl">{{ candidateId }}</div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-[#2563eb] mb-8">Choose Your Test</h1>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-12">
        <p class="text-lg text-gray-500">Loading test information...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <p class="text-lg text-red-500">{{ error }}</p>
      </div>

      <!-- Test Content -->
      <template v-else>
        <!-- Test Cards -->
        <div class="space-y-6">
          <!-- Listening Card -->
          <Card
            class="bg-white border border-gray-300 hover:shadow-lg transition-shadow cursor-pointer"
            @click="navigateToTest('listening')"
          >
            <CardContent class="p-6">
              <div class="space-y-3">
                <div class="flex items-start justify-between">
                  <div>
                    <h3 class="text-xl font-semibold text-gray-800 mb-2">Listening</h3>
                  </div>
                </div>

                <p class="text-gray-600">Timing: 30 minutes</p>

                <!-- Test Information (Expandable) -->
                <details class="mt-4 border border-gray-500 py-5 px-4 rounded-md" @click.stop>
                  <summary class="flex items-center gap-2 cursor-pointer text-gray-700">
                    <ChevronDown class="w-4 h-4" />
                    <span>Test information.</span>
                  </summary>
                  <div class="mt-3 pl-6 text-gray-600">
                    <p class="mb-3">
                      The Listening test consists of 4 parts with 40 questions in total.
                    </p>
                    <div class="mt-4">
                      <video
                        controls
                        class="w-full rounded-lg border border-gray-300"
                        preload="metadata"
                      >
                        <source
                          src="https://static.gelnet.org/cdielts/listening.mp4"
                          type="video/mp4"
                        />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  </div>
                </details>
              </div>
            </CardContent>
          </Card>

          <!-- Reading Card -->
          <Card
            class="bg-white border border-gray-300 hover:shadow-lg transition-shadow cursor-pointer"
            @click="navigateToTest('reading')"
          >
            <CardContent class="p-6">
              <div class="space-y-3">
                <div class="flex items-start justify-between">
                  <div>
                    <h3 class="text-xl font-semibold text-gray-800 mb-2">Reading</h3>
                  </div>
                </div>

                <p class="text-gray-600">Timing: 60 minutes</p>

                <!-- Test Information (Expandable) -->
                <details class="mt-4 border border-gray-500 py-5 px-4 rounded-md" @click.stop>
                  <summary class="flex items-center gap-2 cursor-pointer text-gray-700">
                    <ChevronDown class="w-4 h-4" />
                    <span>Test information.</span>
                  </summary>
                  <div class="mt-3 pl-6 text-gray-600">
                    <p class="mb-3">
                      The Reading test consists of 3 sections with 40 questions in total.
                    </p>
                    <div class="mt-4">
                      <video
                        controls
                        class="w-full rounded-lg border border-gray-300"
                        preload="metadata"
                      >
                        <source
                          src="https://static.gelnet.org/cdielts/reading.mp4"
                          type="video/mp4"
                        />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  </div>
                </details>
              </div>
            </CardContent>
          </Card>
          <!-- Writing Card -->
          <Card
            class="bg-white border border-gray-300 hover:shadow-lg transition-shadow cursor-pointer"
            @click="navigateToTest('writing')"
          >
            <CardContent class="p-6">
              <div class="space-y-3">
                <div class="flex items-start justify-between">
                  <div>
                    <h3 class="text-xl font-semibold text-gray-800 mb-2">Writing</h3>
                  </div>
                </div>

                <p class="text-gray-600">Timing: 60 minutes</p>

                <!-- Test Information (Expandable) -->
                <details class="mt-4 border border-gray-500 py-5 px-4 rounded-md" @click.stop>
                  <summary class="flex items-center gap-2 cursor-pointer text-gray-700">
                    <ChevronDown class="w-4 h-4" />
                    <span>Test information.</span>
                  </summary>
                  <div class="mt-3 pl-6 text-gray-600">
                    <p class="mb-3">
                      The Writing test consists of 2 tasks that should be completed in 60 minutes.
                    </p>
                    <div class="mt-4">
                      <video
                        controls
                        class="w-full rounded-lg border border-gray-300"
                        preload="metadata"
                      >
                        <source
                          src="https://static.gelnet.org/cdielts/writing.mp4"
                          type="video/mp4"
                        />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  </div>
                </details>
              </div>
            </CardContent>
          </Card>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { get } from '@/utils/api'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronDown, ArrowLeft } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
const router = useRouter()

const isLoading = ref(true)
const error = ref('')
const testData = ref<any>(null)
const candidateId = ref('xxxxxxxxx')
const testId = ref('')

// Fetch assignment data
onMounted(async () => {
  try {
    const response = await get('/student/test-content')
    testData.value = response.data
    candidateId.value = response.data.candidate_id || response.data.student?.name || 'xxxxxxxxx'
    testId.value = response.data.test?.id || ''
  } catch (err: any) {
    console.error('Error fetching assignment:', err)
    if (err?.response?.status === 404) {
      error.value = err?.response?.data?.message || 'No assignment found for your account.'
    } else {
      error.value = 'Failed to load assignment data.'
    }
  } finally {
    isLoading.value = false
  }
})

const navigateToTest = (testType: 'listening' | 'reading' | 'writing') => {
  if (testId.value) {
    router.push(`/${testType}/${testId.value}`)
  } else {
    router.push(`/${testType}`)
  }
}
</script>

<style scoped>
details summary::-webkit-details-marker {
  display: none;
}

details[open] summary svg {
  transform: rotate(180deg);
}

details summary svg {
  transition: transform 0.2s;
}
</style>
