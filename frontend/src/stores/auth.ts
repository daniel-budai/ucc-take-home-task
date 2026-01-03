import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)

  // Computed
  const isAuthenticated = computed(() => !!token.value)
  const isAgent = computed(
    () => user.value?.role === 'helpdesk_agent' || user.value?.role === 'admin'
  )
  const isAdmin = computed(() => user.value?.role === 'admin')

  // Actions
  function initialize() {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      token.value = storedToken
      try {
        user.value = JSON.parse(storedUser)
      } catch {
        // Invalid stored user, clear it
        localStorage.removeItem('user')
      }
    }
  }

  function setAuth(newUser: User, newToken: string) {
    user.value = newUser
    token.value = newToken
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
  }

  function clearAuth() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return {
    // State
    user,
    token,
    // Computed
    isAuthenticated,
    isAgent,
    isAdmin,
    // Actions
    initialize,
    setAuth,
    clearAuth,
  }
})






