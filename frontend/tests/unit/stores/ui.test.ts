import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUiStore } from '@/stores/ui'

describe('ui Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('toggleSidebar()', () => {
    it('should toggle sidebar state', () => {
      const store = useUiStore()
      const initialValue = store.sidebarOpen

      store.toggleSidebar()

      expect(store.sidebarOpen).toBe(!initialValue)
    })

    it('should toggle multiple times', () => {
      const store = useUiStore()
      const initialValue = store.sidebarOpen

      store.toggleSidebar()
      expect(store.sidebarOpen).toBe(!initialValue)

      store.toggleSidebar()
      expect(store.sidebarOpen).toBe(initialValue)
    })
  })
})

