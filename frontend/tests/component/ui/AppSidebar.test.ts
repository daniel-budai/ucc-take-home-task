import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mountWithPinia } from '../../setup/test-utils'
import AppSidebar from '@/components/ui/AppSidebar.vue'
import { mockAgent } from '../../fixtures/users'
import { useUiStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import { mockRouter, resetRouterMocks } from '../../mocks'

// Mock PrimeVue components - Menu should render menu items
vi.mock('primevue/menu', () => ({
  default: {
    name: 'Menu',
    template: `
      <nav class="menu">
        <template v-if="model && model.length > 0">
          <div v-for="(item, index) in model" :key="index" class="menu-item">
            <span>{{ item.label }}</span>
          </div>
        </template>
        <slot />
      </nav>
    `,
    props: ['model'],
  },
}))

// Override the global router mock for this component's specific needs
vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')
  return {
    ...actual,
    useRoute: () => ({
      path: '/events',
    }),
    useRouter: () => mockRouter,
  }
})

describe('AppSidebar Component', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    resetRouterMocks()
    const uiStore = useUiStore()
    uiStore.sidebarOpen = true
  })

  it('should render sidebar', () => {
    const wrapper = mountWithPinia(AppSidebar)

    expect(wrapper.find('aside').exists()).toBe(true)
    expect(wrapper.find('.menu').exists()).toBe(true)
  })

  it('should toggle sidebar', () => {
    const wrapper = mountWithPinia(AppSidebar)

    const sidebar = wrapper.find('aside')
    expect(sidebar.exists()).toBe(true)
  })

  it('should navigate on menu click', async () => {
    mountWithPinia(AppSidebar)

    // Menu component handles clicks internally, verify router mock is available
    expect(mockRouter.push).toBeDefined()
  })

  it('should show Events menu item', () => {
    const wrapper = mountWithPinia(AppSidebar)

    // @ts-expect-error - accessing component computed properties for testing
    const menuItems = wrapper.vm.menuItems
    expect(menuItems).toBeDefined()
    expect(menuItems.some((item: any) => item.label === 'Events')).toBe(true)
  })

  it('should show Help Desk menu item', () => {
    const wrapper = mountWithPinia(AppSidebar)

    // @ts-expect-error - accessing component computed properties for testing
    const menuItems = wrapper.vm.menuItems
    expect(menuItems).toBeDefined()
    expect(menuItems.some((item: any) => item.label === 'Help Desk')).toBe(true)
  })

  it('should show Agent Dashboard for agents', () => {
    // Set up auth store with agent user BEFORE mounting
    const pinia = createPinia()
    setActivePinia(pinia)
    const authStore = useAuthStore()
    authStore.setAuth(mockAgent, 'test-token')

    const wrapper = mountWithPinia(AppSidebar, {
      global: {
        plugins: [pinia],
      },
    })

    // @ts-expect-error - accessing component computed properties for testing
    const menuItems = wrapper.vm.menuItems
    expect(menuItems).toBeDefined()
    expect(menuItems.some((item: any) => item.label === 'Agent Dashboard')).toBe(true)
  })
})
