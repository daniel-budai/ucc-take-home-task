import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleApiError, isAxiosError } from '@/utils/errorHandler'
import { createMockAxiosError } from '../../setup/helpers'
import type { AxiosError } from 'axios'

describe('errorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('isAxiosError()', () => {
    it('should identify AxiosError correctly', () => {
      const error = createMockAxiosError(500)
      expect(isAxiosError(error)).toBe(true)
    })

    it('should return false for regular Error', () => {
      const error = new Error('Regular error')
      expect(isAxiosError(error)).toBe(false)
    })

    it('should return false for null', () => {
      expect(isAxiosError(null)).toBe(false)
    })
  })

  describe('handleApiError() - Network Errors', () => {
    it('should handle ERR_NETWORK error', () => {
      const error = createMockAxiosError(0, undefined, 'ERR_NETWORK')
      const result = handleApiError(error)

      expect(result.type).toBe('network')
      expect(result.canRetry).toBe(true)
      expect(result.context?.alternativeAction?.label).toBe('Refresh Page')
    })

    it('should handle ECONNABORTED timeout error', () => {
      const error = createMockAxiosError(0, undefined, 'ECONNABORTED')
      const result = handleApiError(error)

      expect(result.type).toBe('network')
      expect(result.canRetry).toBe(true)
    })
  })

  describe('handleApiError() - HTTP Status Codes', () => {
    it('should handle 400 Bad Request', () => {
      const error = createMockAxiosError(400, { message: 'Invalid input' })
      const result = handleApiError(error)

      expect(result.type).toBe('validation')
      expect(result.statusCode).toBe(400)
      expect(result.canRetry).toBe(false)
    })

    it.each([
      [401, 'auth', false, 'Login Again'],
      [403, 'permission', false, undefined],
      [404, 'not_found', false, 'Go Back'],
    ])('should handle %i status code as %s type', (status, type, canRetry, actionLabel) => {
      const error = createMockAxiosError(status)
      const result = handleApiError(error)

      expect(result.type).toBe(type)
      expect(result.statusCode).toBe(status)
      expect(result.canRetry).toBe(canRetry)
      if (actionLabel) {
        expect(result.context?.alternativeAction?.label).toBe(actionLabel)
      }
    })

    it('should handle 422 Validation Error with nested errors', () => {
      const error = createMockAxiosError(422, {
        errors: {
          email: ['The email field is required'],
          password: ['The password field is required'],
        },
      })
      const result = handleApiError(error)

      expect(result.type).toBe('validation')
      expect(result.statusCode).toBe(422)
      expect(result.userMessage).toBe('The email field is required')
    })

    it('should handle 422 Validation Error with message', () => {
      const error = createMockAxiosError(422, { message: 'Validation failed' })
      const result = handleApiError(error)

      expect(result.type).toBe('validation')
      expect(result.userMessage).toBe('Validation failed')
    })

    it('should handle 429 Rate Limit', () => {
      const error = createMockAxiosError(429)
      const result = handleApiError(error, {
        operation: 'test',
        retry: vi.fn(),
      })

      expect(result.type).toBe('server')
      expect(result.statusCode).toBe(429)
      expect(result.canRetry).toBe(true)
      expect(result.context?.retry).toBeDefined()
    })

    it.each([
      [500, 'Server Error'],
      [502, 'Bad Gateway'],
      [503, 'Service Unavailable'],
      [504, 'Gateway Timeout'],
    ])('should handle %i %s as server error with retry', (status, description) => {
      const error = createMockAxiosError(status)
      const result = handleApiError(error)

      expect(result.type).toBe('server')
      expect(result.statusCode).toBe(status)
      expect(result.canRetry).toBe(true)
    })

    it('should handle unknown status codes', () => {
      const error = createMockAxiosError(418)
      const result = handleApiError(error)

      expect(result.type).toBe('unknown')
      expect(result.statusCode).toBe(418)
    })
  })

  describe('handleApiError() - Non-Axios Errors', () => {
    it('should handle regular Error objects', () => {
      const error = new Error('Something went wrong')
      const result = handleApiError(error)

      expect(result.type).toBe('unknown')
      expect(result.message).toBe('Something went wrong')
      expect(result.canRetry).toBe(true)
    })

    it('should handle unknown error types', () => {
      const error = 'string error'
      const result = handleApiError(error)

      expect(result.type).toBe('unknown')
      expect(result.canRetry).toBe(false)
    })
  })

  describe('handleApiError() - Context Preservation', () => {
    it('should preserve operation context', () => {
      const error = createMockAxiosError(500)
      const context = { operation: 'fetchData', retry: vi.fn() }
      const result = handleApiError(error, context)

      expect(result.context?.operation).toBe('fetchData')
      expect(result.context?.retry).toBe(context.retry)
    })
  })
})

