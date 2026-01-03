import client from '@/api/client'
import type {
  LoginCredentials,
  LoginResponse,
  PasswordResetRequest,
  PasswordResetConfirm,
} from '@/types'

export const authApi = {
  /**
   * Login with email and password
   */
  login: (credentials: LoginCredentials) => client.post<LoginResponse>('/login', credentials),

  /**
   * Logout current user
   */
  logout: () => client.post('/logout'),

  /**
   * Request password reset email
   */
  requestPasswordReset: (data: PasswordResetRequest) => client.post('/password/reset', data),

  /**
   * Confirm password reset with token
   */
  confirmPasswordReset: (data: PasswordResetConfirm) =>
    client.post('/password/reset/confirm', data),
}






