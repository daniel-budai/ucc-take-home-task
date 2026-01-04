import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mockUser } from '../../fixtures/users'

// Mock dependencies - define mocks inside factory to avoid hoisting issues
vi.mock('@/api/auth', () => ({
  authApi: {
    login: vi.fn(),
    logout: vi.fn(),
    requestPasswordReset: vi.fn(),
    confirmPasswordReset: vi.fn(),
  },
}))

const mockPush = vi.fn()
const mockSuccess = vi.fn()
const mockError = vi.fn()

// Mock the router globally available via useRouter()
vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')
  return {
    ...actual,
    useRouter: () => ({
      push: mockPush,
    }),
  }
})

vi.mock('@/composables/useNotification', () => ({
  useNotification: () => ({
    success: mockSuccess,
    error: mockError,
    showErrorWithRecovery: vi.fn(),
  }),
}))

vi.mock('@/utils/echo', () => ({
  resetEcho: vi.fn(),
}))

vi.mock('@/api/helpdesk', () => ({
  helpdeskApi: {
    listChats: vi.fn(),
    listAgentChats: vi.fn(),
  },
}))

vi.mock('@/api/events', () => ({
  eventsApi: {
    list: vi.fn(),
  },
}))

// Import after mocks
import { useAuth } from '@/composables/useAuth'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'
import { useChatAgentStore } from '@/stores/chatAgent'
import { useEventsStore } from '@/stores/events'
import { authApi } from '@/api/auth'

function setupAuthMocks() {
  vi.mocked(authApi.login).mockResolvedValue({
    data: {
      success: true,
      message: 'Login successful',
      data: {
        user: mockUser,
        token: 'mock-token-123',
      },
    },
  })

  vi.mocked(authApi.logout).mockResolvedValue({ data: { success: true } })
  vi.mocked(authApi.requestPasswordReset).mockResolvedValue({ data: { success: true } })
  vi.mocked(authApi.confirmPasswordReset).mockResolvedValue({ data: { success: true } })
}

describe('Auth Flow Integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
    setupAuthMocks()
  })

  it('should complete full login flow', async () => {
    const { login } = useAuth()
    const authStore = useAuthStore()

    const credentials = {
      email: 'test@example.com',
      password: 'password123',
    }

    await login(credentials)

    // Verify auth store is updated
    expect(authStore.user).toEqual(mockUser)
    expect(authStore.token).toBe('mock-token-123')
    expect(authStore.isAuthenticated).toBe(true)

    // Verify localStorage is updated
    expect(localStorage.getItem('token')).toBe('mock-token-123')
    expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser))

    // Verify router navigation
    expect(mockPush).toHaveBeenCalledWith('/events')

    // Verify success notification
    expect(mockSuccess).toHaveBeenCalledWith('Welcome back!')

    // Verify API was called
    expect(authApi.login).toHaveBeenCalledWith(credentials)
  })

  it('should handle logout with cleanup', async () => {
    const { logout } = useAuth()
    const authStore = useAuthStore()
    const chatStore = useChatStore()
    const chatAgentStore = useChatAgentStore()
    const eventsStore = useEventsStore()

    // Set up authenticated state
    authStore.setAuth(mockUser, 'test-token')

    // Set up state in stores using their public APIs
    // Mock API calls to populate stores
    const { helpdeskApi } = await import('@/api/helpdesk')
    const { eventsApi } = await import('@/api/events')
    
    vi.mocked(helpdeskApi.listChats).mockResolvedValueOnce({
      data: [{ id: 1, user_id: 1, status: 'open', subject: 'Test', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' }],
    })
    await chatStore.fetchChats()

    vi.mocked(helpdeskApi.listAgentChats).mockResolvedValueOnce({
      data: [{ id: 2, user_id: 1, status: 'agent_handling', subject: 'Test', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' }],
    })
    await chatAgentStore.fetchAgentChats()
    chatAgentStore.currentChat = { id: 2, user_id: 1, status: 'agent_handling', subject: 'Test', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' }

    vi.mocked(eventsApi.list).mockResolvedValueOnce({
      data: [{ id: 1, title: 'Test Event', occurrence: '2026-01-01T00:00:00Z', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' }],
    })
    await eventsStore.fetchEvents()

    // Verify stores have state before logout
    expect(chatStore.chats.length).toBeGreaterThan(0)
    expect(chatAgentStore.chats.length).toBeGreaterThan(0)
    expect(eventsStore.events.length).toBeGreaterThan(0)

    await logout()

    // Verify all stores are reset
    expect(authStore.user).toBeNull()
    expect(authStore.token).toBeNull()
    expect(chatStore.chats).toEqual([])
    expect(chatAgentStore.chats).toEqual([])
    expect(chatAgentStore.currentChat).toBeNull()
    expect(eventsStore.events).toEqual([])

    // Verify localStorage is cleared
    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()

    // Verify router navigation
    expect(mockPush).toHaveBeenCalledWith('/login')

    // Verify API was called
    expect(authApi.logout).toHaveBeenCalled()
  })

  it('should handle password reset flow', async () => {
    const { requestPasswordReset, confirmPasswordReset } = useAuth()

    // Test password reset request
    await requestPasswordReset({ email: 'test@example.com' })

    expect(authApi.requestPasswordReset).toHaveBeenCalledWith({
      email: 'test@example.com',
    })
    expect(mockSuccess).toHaveBeenCalledWith('Password reset email sent!')

    // Reset mocks for next test
    vi.clearAllMocks()
    setupAuthMocks()

    // Test password reset confirmation
    await confirmPasswordReset({
      token: 'reset-token',
      email: 'test@example.com',
      password: 'newpassword123',
      password_confirmation: 'newpassword123',
    })

    expect(authApi.confirmPasswordReset).toHaveBeenCalledWith({
      token: 'reset-token',
      email: 'test@example.com',
      password: 'newpassword123',
      password_confirmation: 'newpassword123',
    })
    expect(mockSuccess).toHaveBeenCalledWith('Password reset successfully!')
    expect(mockPush).toHaveBeenCalledWith('/login')
  })
})
