import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authApi } from '@/api/auth'
import { useNotification } from '@/composables/useNotification'
import type { LoginCredentials, PasswordResetRequest, PasswordResetConfirm } from '@/types'

export function useAuth() {
  const router = useRouter()
  const store = useAuthStore()
  const { success, error } = useNotification()

  async function login(credentials: LoginCredentials) {
    try {
      const { data: response } = await authApi.login(credentials)
      // Backend response structure: { success, message, data: { user, token } }
      store.setAuth(response.data.user, response.data.token)
      success('Welcome back!')
      router.push('/events')
      return response
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      error(err.response?.data?.message || 'Login failed')
      throw e
    }
  }

  async function logout() {
    try {
      await authApi.logout()
    } catch {
      // Ignore logout errors - clear local state anyway
    } finally {
      store.clearAuth()
      router.push('/login')
    }
  }

  async function requestPasswordReset(data: PasswordResetRequest) {
    try {
      await authApi.requestPasswordReset(data)
      success('Password reset email sent!')
      return true
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      error(err.response?.data?.message || 'Failed to send reset email')
      throw e
    }
  }

  async function confirmPasswordReset(data: PasswordResetConfirm) {
    try {
      await authApi.confirmPasswordReset(data)
      success('Password reset successfully!')
      router.push('/login')
      return true
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      error(err.response?.data?.message || 'Failed to reset password')
      throw e
    }
  }

  return {
    // State from store
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isAgent: store.isAgent,
    // Actions
    login,
    logout,
    requestPasswordReset,
    confirmPasswordReset,
  }
}
