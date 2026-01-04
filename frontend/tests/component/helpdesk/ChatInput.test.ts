import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountWithPinia } from '../../setup/test-utils'
import ChatInput from '@/components/helpdesk/ChatInput.vue'
import { getPrimeVueStubs } from '../../mocks/primevue'

describe('ChatInput Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render input field', () => {
    const wrapper = mountWithPinia(ChatInput, {
      global: {
        stubs: getPrimeVueStubs(),
      },
    })

    const input = wrapper.find('[data-testid="input-text"]')
    expect(input.exists()).toBe(true)
  })

  it('should send message on submit', async () => {
    const wrapper = mountWithPinia(ChatInput, {
      global: {
        stubs: getPrimeVueStubs(),
      },
    })

    const input = wrapper.find('[data-testid="input-text"]')
    const sendButton = wrapper.find('[data-testid="button"]')

    expect(input.exists()).toBe(true)
    expect(sendButton.exists()).toBe(true)

    await input.setValue('Test message')
    await wrapper.vm.$nextTick()

    await sendButton.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('send')).toBeTruthy()
    expect(wrapper.emitted('send')?.[0]?.[0]).toBe('Test message')
  })

  it('should validate message length', async () => {
    const wrapper = mountWithPinia(ChatInput, {
      global: {
        stubs: getPrimeVueStubs(),
      },
    })

    const input = wrapper.find('[data-testid="input-text"]')
    const sendButton = wrapper.find('[data-testid="button"]')

    expect(input.exists()).toBe(true)
    expect(sendButton.exists()).toBe(true)

    const longMessage = 'a'.repeat(10000)
    await input.setValue(longMessage)
    await wrapper.vm.$nextTick()

    const buttonElement = sendButton.element as HTMLButtonElement
    expect(buttonElement.disabled).toBe(true)
  })

  it('should handle Enter key press', async () => {
    const wrapper = mountWithPinia(ChatInput, {
      global: {
        stubs: getPrimeVueStubs(),
      },
    })

    const input = wrapper.find('[data-testid="input-text"]')
    expect(input.exists()).toBe(true)

    await input.setValue('Test message')
    await wrapper.vm.$nextTick()

    await input.trigger('keydown', { key: 'Enter' })
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('send')).toBeTruthy()
    expect(wrapper.emitted('send')?.[0]?.[0]).toBe('Test message')
  })

  it('should clear input after sending', async () => {
    const wrapper = mountWithPinia(ChatInput, {
      global: {
        stubs: getPrimeVueStubs(),
      },
    })

    const input = wrapper.find('[data-testid="input-text"]')
    const sendButton = wrapper.find('[data-testid="button"]')

    expect(input.exists()).toBe(true)
    expect(sendButton.exists()).toBe(true)

    await input.setValue('Test message')
    await wrapper.vm.$nextTick()

    await sendButton.trigger('click')
    await wrapper.vm.$nextTick()

    const inputElement = input.element as HTMLInputElement
    expect(inputElement.value).toBe('')
  })

  it('should be disabled when disabled prop is true', () => {
    const wrapper = mountWithPinia(ChatInput, {
      props: {
        disabled: true,
      },
      global: {
        stubs: getPrimeVueStubs(),
      },
    })

    expect(wrapper.props('disabled')).toBe(true)
    
    const inputComponent = wrapper.findComponent({ name: 'InputText' })
    expect(inputComponent.exists()).toBe(true)
    expect(inputComponent.props('disabled')).toBe(true)
    
    const input = wrapper.find('[data-testid="input-text"]')
    expect(input.exists()).toBe(true)

    const inputElement = input.element as HTMLInputElement
    expect(inputElement.hasAttribute('disabled') || inputElement.disabled).toBe(true)
  })
})
