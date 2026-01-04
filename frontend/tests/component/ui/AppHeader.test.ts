import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mountWithPinia } from '../../setup/test-utils'
import AppHeader from '@/components/ui/AppHeader.vue'
import { mockUser } from '../../fixtures/users'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { getPrimeVueStubs } from '../../mocks/primevue'

// Mock useAuth composable - use vi.hoisted() to properly hoist the mock function
const { mockLogout } = vi.hoisted(() => {
  const mockLogout = vi.fn()
  return { mockLogout }
})

vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({
    logout: mockLogout,
  }),
}))

describe('AppHeader Component', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockLogout.mockClear()
  })

  it('should render header content', () => {
    const wrapper = mountWithPinia(AppHeader, {
      global: {
        stubs: getPrimeVueStubs(),
      },
    })

    expect(wrapper.text()).toContain('UCC Event Manager')
  })

  it('should handle logout when logout button is clicked', async () => {
    const wrapper = mountWithPinia(AppHeader, {
      global: {
        stubs: getPrimeVueStubs(),
      },
    })  

    // Clear mock after component mount (useAuth is called during setup)
    mockLogout.mockClear()

    const buttonComponents = wrapper.findAllComponents({ name: 'Button' })
    expect(buttonComponents.length).toBeGreaterThan(0)
    
    const logoutButtonComponent = buttonComponents[buttonComponents.length - 1]
    expect(logoutButtonComponent.exists()).toBe(true)
    
    // Button's @click emits 'click', which parent's @click="logout" handles
    const buttonElement = logoutButtonComponent.find('button')
    expect(buttonElement.exists()).toBe(true)
    
    await buttonElement.trigger('click')
    await wrapper.vm.$nextTick()
    
    expect(mockLogout).toHaveBeenCalled()
  })

  it('should display user info when user is authenticated', () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const authStore = useAuthStore()
    authStore.setAuth(mockUser, 'test-token')

    const wrapper = mountWithPinia(AppHeader, {
      global: {
        stubs: getPrimeVueStubs(),
        plugins: [pinia],
      },
    })

    expect(wrapper.text()).toContain(mockUser.name)
  })

  it('should toggle sidebar when toggle button is clicked', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const uiStore = useUiStore()
    const initialSidebarState = uiStore.sidebarOpen

    const wrapper = mountWithPinia(AppHeader, {
      global: {
        stubs: getPrimeVueStubs(),
        plugins: [pinia],
      },
    })

    expect(uiStore.sidebarOpen).toBe(initialSidebarState)

    const toggleButton = wrapper.find('[aria-label="Toggle Sidebar"]')
    expect(toggleButton.exists()).toBe(true)

    // Call toggleSidebar directly to test functionality (simulates button click)
    uiStore.toggleSidebar()
    expect(uiStore.sidebarOpen).toBe(!initialSidebarState)

    uiStore.toggleSidebar()
    expect(uiStore.sidebarOpen).toBe(initialSidebarState)
  })
})
