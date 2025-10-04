/**
 * API service for GlamAI frontend
 * Handles communication with FastAPI backend
 */

import axios from 'axios'

// Base URL for the backend API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout for file uploads and AI processing
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`)
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling with retry logic
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    console.error('API Error:', error.response?.data || error.message)

    // Handle specific error cases
    if (error.response?.status === 404) {
      throw new Error('Service not found. Please check if the backend is running.')
    } else if (error.response?.status === 500) {
      throw new Error('Internal server error. Please try again later.')
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. The server may be starting up (cold start). Please wait 30 seconds and try again.')
    } else if (error.code === 'ERR_NETWORK') {
      throw new Error('Network error. Please check your connection and ensure the backend is running.')
    }

    throw new Error(error.response?.data?.detail || error.message || 'An unexpected error occurred')
  }
)

// Retry helper for cold start issues
const retryRequest = async (fn, retries = 2, delay = 2000) => {
  try {
    return await fn()
  } catch (error) {
    if (retries > 0 && (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED')) {
      console.log(`Retrying request in ${delay}ms... (${retries} retries left)`)
      await new Promise(resolve => setTimeout(resolve, delay))
      return retryRequest(fn, retries - 1, delay * 1.5)
    }
    throw error
  }
}

/**
 * Upload a selfie image to the backend
 * @param {File} file - The image file to upload
 * @returns {Promise<Object>} Upload response with file_id
 */
export const uploadFile = async (file) => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data
}

/**
 * Analyze facial features from uploaded image
 * @param {string} fileId - The file ID from upload response
 * @returns {Promise<Object>} Analysis results
 */
export const analyzeImage = async (fileId) => {
  const response = await api.post('/analyze', null, {
    params: { file_id: fileId }
  })

  return response.data
}

/**
 * Get makeup recommendations based on analysis
 * @param {Object} analysisData - The facial analysis data
 * @returns {Promise<Object>} Makeup recommendations
 */
export const getRecommendations = async (analysisData) => {
  const response = await api.post('/recommend', analysisData)
  return response.data
}

/**
 * Combined endpoint: analyze image and get recommendations
 * Includes retry logic for cold start issues on free hosting
 * @param {string} fileId - The file ID from upload response
 * @returns {Promise<Object>} Combined analysis and recommendations
 */
export const analyzeAndRecommend = async (fileId) => {
  return retryRequest(async () => {
    const response = await api.post('/analyze-and-recommend', null, {
      params: { file_id: fileId }
    })
    return response.data
  })
}

/**
 * Clean up uploaded file from server
 * @param {string} fileId - The file ID to delete
 * @returns {Promise<Object>} Cleanup response
 */
export const cleanupFile = async (fileId) => {
  const response = await api.delete(`/cleanup/${fileId}`)
  return response.data
}

/**
 * Health check endpoint
 * @returns {Promise<Object>} Health status
 */
export const healthCheck = async () => {
  const response = await api.get('/')
  return response.data
}

export default api