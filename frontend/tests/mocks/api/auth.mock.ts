import { vi } from 'vitest'
import type { LoginResponse } from '@/types'
import { mockUser } from '@/tests/fixtures/users'

export const mockAuthApi = {
  login: vi.fn<Parameters<typeof import('@/api/auth').authApi.login>, Promise<{ data: LoginResponse }>>(),
  logout: vi.fn<[], Promise<{ data: unknown }>>(),
  requestPasswordReset: vi.fn<Parameters<typeof import('@/api/auth').authApi.requestPasswordReset>, Promise<{ data: unknown }>>(),
  confirmPasswordReset: vi.fn<Parameters<typeof import('@/api/auth').authApi.confirmPasswordReset>, Promise<{ data: unknown }>>(),
}

export function setupAuthMocks() {
  mockAuthApi.login.mockResolvedValue({
    data: {
      success: true,
      message: 'Login successful',
      data: {
        user: mockUser,
        token: 'mock-token-123',
      },
    },
  })

  mockAuthApi.logout.mockResolvedValue({ data: { success: true } })
  mockAuthApi.requestPasswordReset.mockResolvedValue({ data: { success: true } })
  mockAuthApi.confirmPasswordReset.mockResolvedValue({ data: { success: true } })
}

