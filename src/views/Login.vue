<template>
  <div class="login-page">
    <div class="login-container">
      <div class="logo-section">
        <div class="logo">
          <span class="logo-text">IELTS</span>
        </div>
        <h1 class="platform-title">CDI Platform</h1>
        <p class="platform-subtitle">International English Language Testing System</p>
      </div>

      <form id="loginForm" @submit.prevent="onSubmit">
        <div class="error-message" v-if="errorMessage">
          {{ errorMessage }}
        </div>

        <div class="form-group">
          <label for="candidateId" class="form-label">Candidate ID</label>
          <input
            type="text"
            id="candidateId"
            name="candidateId"
            class="form-input"
            placeholder="Enter your Candidate ID"
            required
            autocomplete="off"
            v-model="candidateId"
          />
        </div>

        <button type="submit" class="login-button" :disabled="isLoading">
          <span v-if="isLoading" class="loading"></span>
          <span class="button-text">{{ isLoading ? 'Logging in...' : 'Enter System' }}</span>
        </button>
      </form>

      <div class="footer-text">
        Please ensure you have your Candidate ID ready before proceeding.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { post, setAccessToken } from '@/utils/api'

const router = useRouter()
const candidateId = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

const onSubmit = async () => {
  if (!candidateId.value.trim()) {
    errorMessage.value = 'Please enter your Candidate ID.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await post('/auth/student-login', {
      candidate_id: candidateId.value.trim(),
    })

    // Assuming the response has access_token
    if (response.data.access_token) {
      setAccessToken(response.data.access_token)
      router.push('/')
    } else {
      errorMessage.value = 'Login failed. Please try again.'
    }
  } catch (error: any) {
    errorMessage.value =
      error.response?.data?.message || 'Invalid Candidate ID. Please check and try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-page {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

/* Background pattern */
.login-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
  pointer-events: none;
}

.login-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 60px 50px;
  width: 100%;
  max-width: 500px;
  text-align: center;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.3),
    0 8px 25px rgba(220, 38, 38, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;
}

.logo-section {
  margin-bottom: 40px;
}

.logo {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  box-shadow: 0 10px 30px rgba(220, 38, 38, 0.3);
}

.logo-text {
  color: white;
  font-size: 28px;
  font-weight: bold;
  letter-spacing: 2px;
}

.platform-title {
  color: #1f2937;
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.platform-subtitle {
  color: #6b7280;
  font-size: 16px;
  margin-bottom: 40px;
}

.form-group {
  margin-bottom: 30px;
  text-align: left;
}

.form-label {
  display: block;
  color: #374151;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
}

.form-input {
  width: 100%;
  padding: 16px 20px;
  font-size: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
  outline: none;
}

.form-input:focus {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
  background: white;
}

.form-input::placeholder {
  color: #9ca3af;
}

.login-button {
  width: 100%;
  padding: 18px;
  font-size: 18px;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(220, 38, 38, 0.3);
  position: relative;
  overflow: hidden;
}

.login-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.login-button:hover::before {
  left: 100%;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(220, 38, 38, 0.4);
}

.login-button:active {
  transform: translateY(0);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.footer-text {
  margin-top: 30px;
  color: #6b7280;
  font-size: 14px;
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid #ef4444;
  color: #dc2626;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: none;
  font-size: 14px;
}

.loading {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
  margin-right: 10px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive design */
@media (max-width: 480px) {
  .login-container {
    margin: 20px;
    padding: 40px 30px;
  }

  .platform-title {
    font-size: 28px;
  }
}
</style>
