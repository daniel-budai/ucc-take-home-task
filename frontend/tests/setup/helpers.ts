import { vi } from 'vitest'
import type { AxiosError } from 'axios'

export function createMockAxiosError(
  status: number,
  data?: unknown,
  code?: string
): AxiosError {
  const error = new Error('Request failed') as AxiosError
  error.isAxiosError = true
  error.response = {
    status,
    statusText: 'Error',
    data: data || { message: 'Error occurred' },
    headers: {},
    config: {} as any,
  }
  if (code) {
    error.code = code
  }
  return error
}

export function waitFor(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function mockNotification() {
  return {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    showErrorWithRecovery: vi.fn(),
  }
}

