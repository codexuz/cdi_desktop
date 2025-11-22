<template>
  <div class="audio-player bg-white rounded-lg p-6 shadow-md">
    <div class="audio-header mb-4">
      <h3 class="text-lg font-semibold text-gray-800 mb-2">
        {{ audioData.fileName || 'Audio File' }}
      </h3>
      <p v-if="part" class="text-sm text-gray-600">
        {{ part }}
      </p>
    </div>
    
    <div class="audio-controls">
      <!-- Audio Element -->
      <audio
        ref="audioElement"
        :src="audioData.url"
        @loadedmetadata="onLoadedMetadata"
        @timeupdate="onTimeUpdate"
        @ended="onEnded"
        @loadstart="isLoading = true"
        @loadeddata="isLoading = false"
        @error="onError"
        preload="metadata"
      />
      
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state flex items-center justify-center p-4">
        <div class="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
        <span class="ml-2 text-gray-600">Loading audio...</span>
      </div>
      
      <!-- Error State -->
      <div v-else-if="hasError" class="error-state p-4 bg-red-50 border border-red-200 rounded-lg">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <span class="text-red-700">Failed to load audio file</span>
        </div>
      </div>
      
      <!-- Main Player -->
      <div v-else class="player-container">
        <!-- Control Buttons -->
        <div class="controls-row flex items-center space-x-4 mb-4">
          <!-- Play/Pause Button -->
          <button
            @click="togglePlayPause"
            class="play-pause-btn w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-colors"
            :disabled="!isAudioReady"
          >
            <svg v-if="!isPlaying" class="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
            </svg>
            <svg v-else class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </button>
          
          <!-- Stop Button -->
          <button
            @click="stop"
            class="stop-btn w-10 h-10 bg-gray-500 hover:bg-gray-600 text-white rounded-full flex items-center justify-center transition-colors"
            :disabled="!isAudioReady"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clip-rule="evenodd" />
            </svg>
          </button>
          
          <!-- Speed Control -->
          <div class="speed-control flex items-center space-x-2">
            <span class="text-sm text-gray-600">Speed:</span>
            <select
              v-model="playbackRate"
              @change="changePlaybackRate"
              class="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="0.5">0.5x</option>
              <option value="0.75">0.75x</option>
              <option value="1">1x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2x</option>
            </select>
          </div>
          
          <!-- Volume Control -->
          <div class="volume-control flex items-center space-x-2">
            <svg class="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.617 13.5H2a1 1 0 01-1-1V7.5a1 1 0 011-1h2.617l3.766-3.293a1 1 0 011.617.793zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.983 5.983 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.984 3.984 0 00-1.172-2.828 1 1 0 010-1.415z" clip-rule="evenodd" />
            </svg>
            <input
              type="range"
              min="0"
              max="100"
              v-model="volume"
              @input="changeVolume"
              class="w-20"
            />
            <span class="text-xs text-gray-500 w-8">{{ volume }}%</span>
          </div>
        </div>
        
        <!-- Progress Bar -->
        <div class="progress-container mb-2">
          <div class="progress-bar bg-gray-200 rounded-full h-2 cursor-pointer" @click="seek">
            <div
              class="progress-fill bg-blue-500 h-2 rounded-full transition-all duration-100"
              :style="{ width: `${progressPercentage}%` }"
            />
          </div>
        </div>
        
        <!-- Time Display -->
        <div class="time-display flex justify-between text-sm text-gray-600">
          <span>{{ formatTime(currentTime) }}</span>
          <span>{{ formatTime(duration) }}</span>
        </div>
        
        <!-- Additional Controls -->
        <div class="additional-controls mt-4 flex items-center justify-between">
          <!-- Skip Buttons -->
          <div class="skip-controls flex items-center space-x-2">
            <button
              @click="skipBackward"
              class="skip-btn px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm transition-colors"
            >
              ⏪ -10s
            </button>
            <button
              @click="skipForward"
              class="skip-btn px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm transition-colors"
            >
              +10s ⏩
            </button>
          </div>
          
          <!-- Play Count -->
          <div v-if="playCount > 0" class="play-count text-sm text-gray-600">
            Played {{ playCount }} time{{ playCount > 1 ? 's' : '' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface AudioData {
  id: number;
  url: string;
  fileName: string;
}

interface Props {
  audioData: AudioData;
  part?: string;
}

const props = defineProps<Props>();

const audioElement = ref<HTMLAudioElement>();
const isPlaying = ref(false);
const isAudioReady = ref(false);
const isLoading = ref(false);
const hasError = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const volume = ref(100);
const playbackRate = ref(1);
const playCount = ref(0);

const progressPercentage = computed(() => {
  if (duration.value === 0) return 0;
  return (currentTime.value / duration.value) * 100;
});

// Audio event handlers
const onLoadedMetadata = () => {
  if (audioElement.value) {
    duration.value = audioElement.value.duration;
    isAudioReady.value = true;
    isLoading.value = false;
    hasError.value = false;
  }
};

const onTimeUpdate = () => {
  if (audioElement.value) {
    currentTime.value = audioElement.value.currentTime;
  }
};

const onEnded = () => {
  isPlaying.value = false;
  currentTime.value = 0;
  if (audioElement.value) {
    audioElement.value.currentTime = 0;
  }
};

const onError = () => {
  hasError.value = true;
  isLoading.value = false;
  isAudioReady.value = false;
};

// Control functions
const togglePlayPause = async () => {
  if (!audioElement.value || !isAudioReady.value) return;
  
  try {
    if (isPlaying.value) {
      await audioElement.value.pause();
      isPlaying.value = false;
    } else {
      await audioElement.value.play();
      isPlaying.value = true;
      if (currentTime.value === 0) {
        playCount.value++;
      }
    }
  } catch (error) {
    console.error('Error playing/pausing audio:', error);
    hasError.value = true;
  }
};

const stop = () => {
  if (!audioElement.value) return;
  
  audioElement.value.pause();
  audioElement.value.currentTime = 0;
  currentTime.value = 0;
  isPlaying.value = false;
};

const seek = (event: MouseEvent) => {
  if (!audioElement.value || !isAudioReady.value) return;
  
  const progressBar = event.currentTarget as HTMLElement;
  const rect = progressBar.getBoundingClientRect();
  const percent = (event.clientX - rect.left) / rect.width;
  const newTime = percent * duration.value;
  
  audioElement.value.currentTime = newTime;
  currentTime.value = newTime;
};

const skipBackward = () => {
  if (!audioElement.value) return;
  audioElement.value.currentTime = Math.max(0, currentTime.value - 10);
};

const skipForward = () => {
  if (!audioElement.value) return;
  audioElement.value.currentTime = Math.min(duration.value, currentTime.value + 10);
};

const changeVolume = () => {
  if (audioElement.value) {
    audioElement.value.volume = volume.value / 100;
  }
};

const changePlaybackRate = () => {
  if (audioElement.value) {
    audioElement.value.playbackRate = playbackRate.value;
  }
};

// Utility functions
const formatTime = (time: number): string => {
  if (!time || isNaN(time)) return '0:00';
  
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Initialize volume when component mounts
onMounted(() => {
  if (audioElement.value) {
    audioElement.value.volume = volume.value / 100;
  }
});

// Cleanup when component unmounts
onUnmounted(() => {
  if (audioElement.value) {
    audioElement.value.pause();
  }
});
</script>

<style scoped>
.audio-player {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.progress-bar {
  position: relative;
}

.progress-fill {
  position: relative;
}

.skip-btn:hover {
  transform: translateY(-1px);
}

.play-pause-btn:hover {
  transform: scale(1.05);
}

.volume-control input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  border-radius: 2px;
  background: #e5e7eb;
  outline: none;
}

.volume-control input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
}

.volume-control input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: none;
}
</style>