import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

/**
 * Check if response is a Laravel Resource wrapper that should be unwrapped.
 *
 * Laravel Resources wrap data in { data: T } format.
 * We only unwrap when 'data' is the primary content (no success/message/error fields).
 *
 * Examples that SHOULD be unwrapped:
 * - { data: [...] }           → Resource collection
 * - { data: {...} }           → Single resource
 * - { data: [...], meta: {} } → Paginated resource
 *
 * Examples that should NOT be unwrapped:
 * - { success: true, message: "...", data: {...} } → Custom API response (login, etc.)
 * - { error: "...", data: null }                   → Error response
 * - [...]                                          → Raw array
 */
function isLaravelResourceWrapper(data: unknown): boolean {
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    return false
  }

  const obj = data as Record<string, unknown>

  // Must have 'data' property
  if (!('data' in obj)) {
    return false
  }

  // If it has 'success', 'message', or 'error' at top level, it's a custom response
  if ('success' in obj || 'message' in obj || 'error' in obj) {
    return false
  }

  // It's a Laravel Resource wrapper (only has data, and optionally meta/links)
  return true
}

// Create axios instance
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true,
  timeout: 10000,
})

client.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error: unknown) => {
    return Promise.reject(error)
  }
)

client.interceptors.response.use(
  (response): typeof response => {
    if (isLaravelResourceWrapper(response.data)) {
      const wrappedData = response.data as { data: unknown }
      response.data = wrappedData.data
    }
    return response
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')

      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default client
