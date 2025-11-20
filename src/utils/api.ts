import axios from 'axios'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
})

// Request interceptor to add access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Function to save access token
export const setAccessToken = (token: string) => {
  localStorage.setItem('access_token', token)
}

// Function to remove access token (optional, for logout)
export const removeAccessToken = () => {
  localStorage.removeItem('access_token')
}

// POST request
export const post = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig,
): Promise<AxiosResponse<T>> => {
  return api.post(url, data, config)
}

// GET request
export const get = <T = any>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<AxiosResponse<T>> => {
  return api.get(url, config)
}

// PUT request
export const put = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig,
): Promise<AxiosResponse<T>> => {
  return api.put(url, data, config)
}

// PATCH request
export const patch = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig,
): Promise<AxiosResponse<T>> => {
  return api.patch(url, data, config)
}

// DELETE request
export const del = <T = any>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<AxiosResponse<T>> => {
  return api.delete(url, config)
}
