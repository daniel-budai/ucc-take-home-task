import { vi } from 'vitest'

export const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  go: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  currentRoute: {
    value: {
      path: '/',
      name: 'home',
      params: {},
      query: {},
    },
  },
}

export function createMockRouter() {
  return mockRouter
}

// Mock Vue Router functions
export const createRouter = vi.fn(() => mockRouter)
export const createMemoryHistory = vi.fn(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  go: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
}))
export const createWebHistory = vi.fn(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  go: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
}))
export const useRouter = vi.fn(() => mockRouter)
export const useRoute = vi.fn(() => mockRouter.currentRoute.value)

// Helper to reset router mocks between tests
export function resetRouterMocks() {
  mockRouter.push.mockClear()
  mockRouter.replace.mockClear()
  mockRouter.go.mockClear()
  mockRouter.back.mockClear()
  mockRouter.forward.mockClear()
}

