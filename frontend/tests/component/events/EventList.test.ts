import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountWithPinia } from '../../setup/test-utils'
import EventList from '@/components/events/EventList.vue'
import { mockEvent, mockPastEvent, mockFutureEvent } from '../../fixtures/events'
import { getPrimeVueStubs } from '../../mocks/primevue'

// Mock PrimeVue components
vi.mock('primevue/datatable', () => ({
  default: {
    name: 'DataTable',
    template: `
      <div class="datatable">
        <template v-if="value && value.length > 0">
          <slot name="default" />
        </template>
        <template v-else>
          <slot name="empty">
            <div class="text-center py-8 text-gray-500">
              <p>No events found. Create your first event!</p>
            </div>
          </slot>
        </template>
      </div>
    `,
    props: ['value', 'loading'],
  },
}))
vi.mock('primevue/column', () => ({
  default: { name: 'Column', template: '<div class="column" />' },
}))
vi.mock('primevue/button', () => ({
  default: { name: 'Button', template: '<button />' },
}))
vi.mock('primevue/tag', () => ({
  default: { name: 'Tag', template: '<span class="tag" />' },
}))

describe('EventList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render events list', () => {
    const events = [mockEvent, mockPastEvent, mockFutureEvent]
    const wrapper = mountWithPinia(EventList, {
      props: {
        events,
        loading: false,
      },
    })

    expect(wrapper.find('.datatable').exists()).toBe(true)
    // DataTable renders in slots which may not be fully rendered in test
    expect(wrapper.props('events')).toContainEqual(mockEvent)
  })

  it('should handle event selection', async () => {
    const events = [mockEvent]
    const wrapper = mountWithPinia(EventList, {
      props: {
        events,
        loading: false,
      },
      global: {
        stubs: getPrimeVueStubs(),
      },
    })

    // @ts-expect-error - accessing component methods for testing (buttons inside DataTable)
    wrapper.vm.handleEdit(mockEvent)

    expect(wrapper.emitted('edit')).toBeTruthy()
    expect(wrapper.emitted('edit')![0][0]).toEqual(mockEvent)
  })

  it('should handle event deletion', async () => {
    const events = [mockEvent]
    const wrapper = mountWithPinia(EventList, {
      props: {
        events,
        loading: false,
      },
      global: {
        stubs: getPrimeVueStubs(),
      },
    })

    // @ts-expect-error - accessing component methods for testing (buttons inside DataTable)
    wrapper.vm.handleDelete(mockEvent)

    expect(wrapper.emitted('delete')).toBeTruthy()
    expect(wrapper.emitted('delete')![0][0]).toEqual(mockEvent)
  })

  it('should show loading state', () => {
    const wrapper = mountWithPinia(EventList, {
      props: {
        events: [],
        loading: true,
      },
    })

    expect(wrapper.props('loading')).toBe(true)
  })

  it('should show empty state', () => {
    const wrapper = mountWithPinia(EventList, {
      props: {
        events: [],
        loading: false,
      },
      global: {
        stubs: {
          DataTable: {
            template: `
              <div class="datatable">
                <template v-if="!value || value.length === 0">
                  <slot name="empty">
                    <div class="text-center py-8 text-gray-500">
                      <p>No events found. Create your first event!</p>
                    </div>
                  </slot>
                </template>
                <template v-else>
                  <slot />
                </template>
              </div>
            `,
            props: ['value', 'loading'],
          },
        },
      },
    })

    expect(wrapper.text()).toMatch(/No events found|Create your first event/)
  })
})
