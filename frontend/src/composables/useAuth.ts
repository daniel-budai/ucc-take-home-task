import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'
import { useChatAgentStore } from '@/stores/chatAgent'
import { useEventsStore } from '@/stores/events'
import { authApi } from '@/api/auth'
import { useNotification } from '@/composables/useNotification'
import { handleApiError } from '@/utils/errorHandler'
import { resetEcho } from '@/utils/echo'
import type { LoginCredentials, PasswordResetRequest, PasswordResetConfirm } from '@/types'

export function useAuth() {
  const router = useRouter()
  const authStore = useAuthStore()
  const { success, error } = useNotification()

  async function login(credentials: LoginCredentials) {
    try {
      const { data: response } = await authApi.login(credentials)
      // Backend response structure: { success, message, data: { user, token } }
      authStore.setAuth(response.data.user, response.data.token)
      success('Welcome back!')
      router.push('/events')
      return response
    } catch (e) {
      const appError = handleApiError(e)
      error(appError.userMessage)
      throw e
    }
  }

  async function logout() {
    try {
      await authApi.logout()
    } catch {
      // Ignore logout errors - clear local state anyway
    } finally {
      // Reset all stores
      authStore.clearAuth()
      useChatStore().$reset()
      useChatAgentStore().$reset()
      useEventsStore().$reset()
      
      // Reset WebSocket connection (clears cached token)
      resetEcho()
      
      router.push('/login')
    }
  }

  async function requestPasswordReset(data: PasswordResetRequest) {
    try {
      await authApi.requestPasswordReset(data)
      success('Password reset email sent!')
      return true
    } catch (e) {
      const appError = handleApiError(e)
      error(appError.userMessage)
      throw e
    }
  }

  async function confirmPasswordReset(data: PasswordResetConfirm) {
    try {
      await authApi.confirmPasswordReset(data)
      success('Password reset successfully!')
      router.push('/login')
      return true
    } catch (e) {
      const appError = handleApiError(e)
      error(appError.userMessage)
      throw e
    }
  }

  return {
    // State from store
    user: authStore.user,
    isAuthenticated: authStore.isAuthenticated,
    isAgent: authStore.isAgent,
    // Actions
    login,
    logout,
    requestPasswordReset,
    confirmPasswordReset,
  }
}
