import type { AxiosError } from 'axios'

export interface ErrorContext {
  operation?: string
  retry?: () => Promise<void>
  alternativeAction?: {
    label: string
    action: () => void
  }
}

export interface AppError {
  type: 'network' | 'auth' | 'validation' | 'server' | 'permission' | 'not_found' | 'unknown'
  message: string
  userMessage: string
  context?: ErrorContext
  canRetry: boolean
  statusCode?: number
}

function isAxiosError(error: unknown): error is AxiosError {
  return error !== null && typeof error === 'object' && 'isAxiosError' in error
}

export function handleApiError(error: unknown, context?: ErrorContext): AppError {
  if (!isAxiosError(error)) {
    if (error instanceof Error) {
      return {
        type: 'unknown',
        message: error.message,
        userMessage: 'Something went wrong. Please try again.',
        canRetry: true,
        context,
      }
    }
    return {
      type: 'unknown',
      message: 'Unknown error',
      userMessage: 'An unexpected error occurred.',
      canRetry: false,
      context,
    }
  }

  const status = error.response?.status
  const errorData = error.response?.data as Record<string, unknown> | undefined

  // Network errors
  if (error.code === 'ERR_NETWORK') {
    return {
      type: 'network',
      message: 'Network connection failed',
      userMessage: 'No internet connection. Please check your network and try again.',
      canRetry: true,
      context: {
        ...context,
        retry: async () => {
        window.location.reload()
      },
        alternativeAction: {
          label: 'Refresh Page',
          action: () => window.location.reload(),
        },
      },
    }
  }

  // Timeout errors
  if (error.code === 'ECONNABORTED') {
    return {
      type: 'network',
      message: 'Request timeout',
      userMessage: 'The request took too long. Please try again.',
      canRetry: true,
      context,
    }
  }

  // HTTP Status based errors
  switch (status) {
    case 400:
      return {
        type: 'validation',
        message: 'Bad request',
        userMessage: (typeof errorData?.message === 'string' ? errorData.message : 'Invalid request. Please check your input.'),
        canRetry: false,
        statusCode: status,
        context,
      }

    case 401:
      return {
        type: 'auth',
        message: 'Unauthorized',
        userMessage: 'Your session has expired. Redirecting to login...',
        canRetry: false,
        statusCode: status,
        context: {
          ...context,
          alternativeAction: {
            label: 'Login Again',
            action: () => window.location.href = '/login',
          },
        },
      }

    case 403:
      return {
        type: 'permission',
        message: 'Forbidden',
        userMessage: 'You don\'t have permission to perform this action.',
        canRetry: false,
        statusCode: status,
        context,
      }

    case 404:
      return {
        type: 'not_found',
        message: 'Not found',
        userMessage: 'The item you\'re looking for doesn\'t exist.',
        canRetry: false,
        statusCode: status,
        context: {
          ...context,
          alternativeAction: {
            label: 'Go Back',
            action: () => window.history.back(),
          },
        },
      }

    case 422:
      // Validation errors
      if (errorData?.errors && typeof errorData.errors === 'object') {
        const errors = errorData.errors as Record<string, unknown>
        const firstErrorValue = Object.values(errors)[0]
        const firstError = Array.isArray(firstErrorValue) && typeof firstErrorValue[0] === 'string'
          ? firstErrorValue
          : []
        return {
          type: 'validation',
          message: 'Validation failed',
          userMessage: firstError[0] || 'Please check your input and try again.',
          canRetry: false,
          statusCode: status,
          context,
        }
      }
      return {
        type: 'validation',
        message: 'Validation failed',
        userMessage: (typeof errorData?.message === 'string' ? errorData.message : 'Please check your input and try again.'),
        canRetry: false,
        statusCode: status,
        context,
      }

    case 429:
      return {
        type: 'server',
        message: 'Rate limited',
        userMessage: 'Too many requests. Please wait a moment and try again.',
        canRetry: true,
        statusCode: status,
        context: {
          ...context,
          retry: async (): Promise<void> => {
            await new Promise<void>((resolve) => {
              setTimeout(() => resolve(), 2000)
            })
            context?.retry?.()
          },
        },
      }

    case 500:
    case 502:
    case 503:
    case 504:
      return {
        type: 'server',
        message: 'Server error',
        userMessage: 'Server is temporarily unavailable. Please try again later.',
        canRetry: true,
        statusCode: status,
        context,
      }

    default:
      return {
        type: 'unknown',
        message: `HTTP ${status}`,
        userMessage: (typeof errorData?.message === 'string' ? errorData.message : 'Something went wrong. Please try again.'),
        canRetry: status ? status >= 500 : true,
        statusCode: status,
        context,
      }
  }
}