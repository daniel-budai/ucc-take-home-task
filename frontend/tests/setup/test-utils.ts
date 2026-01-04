import { mount, type MountingOptions } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import type { Component } from 'vue'

export function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/login', component: { template: '<div>Login</div>' } },
      { path: '/events', component: { template: '<div>Events</div>' } },
      { path: '/helpdesk', component: { template: '<div>Helpdesk</div>' } },
    ],
  })
}

export function mountWithPinia(
  component: Component,
  options?: MountingOptions<any>
) {
  const pinia = createPinia()
  setActivePinia(pinia)

  const router = createTestRouter()

  return mount(component, {
    global: {
      plugins: [pinia, router],
    },
    ...options,
  })
}

export function createMockStore() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return pinia
}

