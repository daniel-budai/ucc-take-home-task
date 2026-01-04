import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { mockUser, mockAgent, mockAdmin } from '../../fixtures/users'

describe('auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  describe('initialize()', () => {
    it('should load user and token from localStorage', () => {
      localStorage.setItem('token', 'test-token')
      localStorage.setItem('user', JSON.stringify(mockUser))

      const store = useAuthStore()
      store.initialize()

      expect(store.token).toBe('test-token')
      expect(store.user).toEqual(mockUser)
    })

    it('should handle invalid JSON in localStorage', () => {
      localStorage.setItem('token', 'test-token')
      localStorage.setItem('user', 'invalid-json')

      const store = useAuthStore()
      store.initialize()

      expect(store.token).toBe('test-token')
      expect(store.user).toBeNull()
      expect(localStorage.getItem('user')).toBeNull()
    })

    it('should not load if localStorage is empty', () => {
      const store = useAuthStore()
      store.initialize()

      expect(store.token).toBeNull()
      expect(store.user).toBeNull()
    })
  })

  describe('setAuth()', () => {
    it('should set user and token and persist to localStorage', () => {
      const store = useAuthStore()
      store.setAuth(mockUser, 'new-token')

      expect(store.user).toEqual(mockUser)
      expect(store.token).toBe('new-token')
      expect(localStorage.getItem('token')).toBe('new-token')
      expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser))
    })
  })

  describe('clearAuth()', () => {
    it('should clear user and token from store and localStorage', () => {
      const store = useAuthStore()
      store.setAuth(mockUser, 'test-token')
      store.clearAuth()

      expect(store.user).toBeNull()
      expect(store.token).toBeNull()
      expect(localStorage.getItem('token')).toBeNull()
      expect(localStorage.getItem('user')).toBeNull()
    })
  })

  describe('isAuthenticated computed', () => {
    it('should return true when token exists', () => {
      const store = useAuthStore()
      store.setAuth(mockUser, 'test-token')

      expect(store.isAuthenticated).toBe(true)
    })

    it('should return false when token is null', () => {
      const store = useAuthStore()

      expect(store.isAuthenticated).toBe(false)
    })
  })

  describe('isAgent computed', () => {
    it('should return true for helpdesk_agent role', () => {
      const store = useAuthStore()
      store.setAuth(mockAgent, 'test-token')

      expect(store.isAgent).toBe(true)
    })

    it('should return true for admin role', () => {
      const store = useAuthStore()
      store.setAuth(mockAdmin, 'test-token')

      expect(store.isAgent).toBe(true)
    })

    it('should return false for user role', () => {
      const store = useAuthStore()
      store.setAuth(mockUser, 'test-token')

      expect(store.isAgent).toBe(false)
    })
  })

  describe('isAdmin computed', () => {
    it('should return true for admin role', () => {
      const store = useAuthStore()
      store.setAuth(mockAdmin, 'test-token')

      expect(store.isAdmin).toBe(true)
    })

    it('should return false for non-admin roles', () => {
      const store = useAuthStore()
      store.setAuth(mockUser, 'test-token')

      expect(store.isAdmin).toBe(false)
    })
  })
})

