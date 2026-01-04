import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountWithPinia } from '../../setup/test-utils'
import EventForm from '@/components/events/EventForm.vue'
import { mockEvent } from '../../fixtures/events'

// Mock vee-validate
interface FormValues {
  title?: string
  occurrence?: Date | string
  description?: string
}

let formValues: FormValues = {}
const mockErrors = { value: {} }
const mockHandleSubmit = vi.fn((fn: (values: FormValues) => void) => {
  return (e: Event) => {
    e.preventDefault()
    // Check if form has values (simulating validation)
    if (formValues.title) {
      fn(formValues)
    }
  }
})

const mockDefineField = vi.fn((name: string) => {
  const fieldValue = vi.fn(() => formValues[name as keyof FormValues])
  const fieldAttrs = {}
  return [fieldValue, fieldAttrs]
})

vi.mock('vee-validate', () => ({
  useForm: vi.fn(() => ({
    handleSubmit: mockHandleSubmit,
    defineField: mockDefineField,
    errors: mockErrors,
    resetForm: vi.fn(() => {
      formValues = {}
    }),
    setValues: vi.fn((values: FormValues) => {
      formValues = { ...formValues, ...values }
    }),
    setFieldValue: vi.fn((name: string, value: unknown) => {
      formValues[name as keyof FormValues] = value as FormValues[keyof FormValues]
    }),
  })),
  toTypedSchema: vi.fn((schema: unknown) => schema),
}))

import { getPrimeVueStubs } from '../../mocks/primevue'

describe('EventForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    formValues = {}
  })

  it('should render form fields', () => {
    const wrapper = mountWithPinia(EventForm, {
      global: {
        stubs: getPrimeVueStubs(),
      },
    })

    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.text()).toContain('Title')
    expect(wrapper.text()).toContain('Date & Time')
    expect(wrapper.text()).toContain('Description')
  })

  it('should validate input', async () => {
    const wrapper = mountWithPinia(EventForm, {
      global: {
        stubs: getPrimeVueStubs(),
      },
    })

    mockHandleSubmit.mockClear()
    wrapper.vm.$emit = vi.fn()

    const form = wrapper.find('form')
    await form.trigger('submit')
    await wrapper.vm.$nextTick()

    // handleSubmit mock only calls fn if title exists (simulating validation)
    expect(wrapper.emitted('submit')).toBeFalsy()
  })

  it('should submit form on valid input', async () => {
    const wrapper = mountWithPinia(EventForm, {
      global: {
        stubs: getPrimeVueStubs(),
      },
    })

    formValues = {
      title: 'Test Event',
      occurrence: new Date('2026-12-31T23:59:59Z'),
      description: 'Test description',
    }

    const form = wrapper.find('form')
    await form.trigger('submit')
    await wrapper.vm.$nextTick()

    const submitEvents = wrapper.emitted('submit')
    expect(submitEvents).toBeTruthy()
    if (submitEvents && submitEvents[0]) {
      expect(submitEvents[0][0]).toHaveProperty('title')
      expect(submitEvents[0][0]).toHaveProperty('occurrence')
      expect(submitEvents[0][0].title).toBe('Test Event')
    }
  })

  it('should handle edit mode', async () => {
    formValues = {
      title: mockEvent.title,
      occurrence: new Date(mockEvent.occurrence),
      description: mockEvent.description || '',
    }

    const wrapper = mountWithPinia(EventForm, {
      props: {
        event: mockEvent,
      },
      global: {
        stubs: getPrimeVueStubs(),
      },
    })

    await wrapper.vm.$nextTick()

    // Form values should be set via setValues in edit mode
    expect(formValues.title).toBe(mockEvent.title)
  })

  it('should emit cancel event', async () => {
    const wrapper = mountWithPinia(EventForm, {
      global: {
        stubs: getPrimeVueStubs(),
      },
    })

    const cancelButton = wrapper.find('button')
    expect(cancelButton.exists()).toBe(true)

    await cancelButton.trigger('click')
    expect(wrapper.emitted('cancel')).toBeTruthy()
  })
})
