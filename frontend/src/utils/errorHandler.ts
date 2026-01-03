import type { AxiosError } from 'axios'

interface ApiErrorResponse {
  message?: string
  errors?: Record<string, string[]>
}

/**
 * Extract user-friendly error message from API error
 */
export function handleApiError(error: AxiosError<ApiErrorResponse>): string {
  // Validation errors (422)
  if (error.response?.status === 422 && error.response.data?.errors) {
    const firstError = Object.values(error.response.data.errors)[0]
    return firstError?.[0] || 'Validation error'
  }

  // API error message
  if (error.response?.data?.message) {
    return error.response.data.message
  }

  // HTTP status based messages
  switch (error.response?.status) {
    case 401:
      return 'Session expired. Please login again.'
    case 403:
      return 'You do not have permission to perform this action.'
    case 404:
      return 'The requested resource was not found.'
    case 500:
      return 'Server error. Please try again later.'
    default:
      break
  }

  // Network error
  if (error.code === 'ERR_NETWORK') {
    return 'Network error. Please check your connection.'
  }

  // Timeout
  if (error.code === 'ECONNABORTED') {
    return 'Request timed out. Please try again.'
  }

  return 'An unexpected error occurred.'
}

/**
 * Get validation errors as object for forms
 */
export function getValidationErrors(
  error: AxiosError<ApiErrorResponse>
): Record<string, string> | null {
  if (error.response?.status !== 422 || !error.response.data?.errors) {
    return null
  }

  const errors: Record<string, string> = {}
  for (const [field, messages] of Object.entries(error.response.data.errors)) {
    errors[field] = messages[0] || 'Invalid value'
  }
  return errors
}






