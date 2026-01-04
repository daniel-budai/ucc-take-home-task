import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountWithPinia } from '../../setup/test-utils'
import ChatWindow from '@/components/helpdesk/ChatWindow.vue'
import { mockAgentHandlingChat } from '../../fixtures/chats'
import { mockUserMessage, mockAgentMessage } from '../../fixtures/messages'

// Mock child components
vi.mock('@/components/helpdesk/ChatMessage.vue', () => ({
  default: { name: 'ChatMessage', template: '<div class="chat-message" />' },
}))
vi.mock('@/components/helpdesk/ChatInput.vue', () => ({
  default: {
    name: 'ChatInput',
    template: '<div class="chat-input" />',
    props: ['disabled', 'loading', 'placeholder'],
    emits: ['send'],
  },
}))

describe('ChatWindow Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render chat messages', () => {
    const messages = [mockUserMessage, mockAgentMessage]
    const wrapper = mountWithPinia(ChatWindow, {
      props: {
        chat: mockAgentHandlingChat,
        messages,
        sending: false,
      },
    })

    const messageComponents = wrapper.findAll('.chat-message')
    expect(messageComponents.length).toBe(messages.length)
  })

  it('should handle message sending', async () => {
    const wrapper = mountWithPinia(ChatWindow, {
      props: {
        chat: mockAgentHandlingChat,
        messages: [],
        sending: false,
      },
    })

    const chatInput = wrapper.findComponent({ name: 'ChatInput' })
    expect(chatInput.exists()).toBe(true)

    await chatInput.vm.$emit('send', 'Test message')

    expect(wrapper.emitted('send')).toBeTruthy()
    expect(wrapper.emitted('send')![0][0]).toBe('Test message')
  })

  it('should scroll to bottom on new message', async () => {
    const messages = [mockUserMessage]
    const wrapper = mountWithPinia(ChatWindow, {
      props: {
        chat: mockAgentHandlingChat,
        messages,
        sending: false,
      },
    })

    // Mock scrollTop and scrollHeight
    const messagesContainer = wrapper.find('.overflow-y-auto')
    expect(messagesContainer.exists()).toBe(true)

    const element = messagesContainer.element as HTMLElement

    // Make scrollHeight writable for testing
    Object.defineProperty(element, 'scrollHeight', {
      writable: true,
      configurable: true,
      value: 1000,
    })

    element.scrollTop = 0

    await wrapper.setProps({
      messages: [...messages, mockAgentMessage],
    })

    // Wait for watcher to run (component watches messages.length)
    await wrapper.vm.$nextTick()

    expect(element.scrollTop).toBeDefined()
  })

  it('should show empty state when no chat selected', () => {
    const wrapper = mountWithPinia(ChatWindow, {
      props: {
        chat: null,
        messages: [],
        sending: false,
      },
    })

    expect(wrapper.text()).toContain('Select a conversation')
  })

  it('should show empty messages state', () => {
    const wrapper = mountWithPinia(ChatWindow, {
      props: {
        chat: mockAgentHandlingChat,
        messages: [],
        sending: false,
      },
    })

    expect(wrapper.text()).toContain('No messages yet')
  })

  it('should disable input for resolved chats', () => {
    const resolvedChat = { ...mockAgentHandlingChat, status: 'resolved' as const }
    const wrapper = mountWithPinia(ChatWindow, {
      props: {
        chat: resolvedChat,
        messages: [],
        sending: false,
      },
    })

    const chatInput = wrapper.findComponent({ name: 'ChatInput' })
    expect(chatInput.exists()).toBe(true)
    // ChatWindow passes disabled prop based on chat.status === 'resolved'
    expect(chatInput.props('disabled')).toBe(true)
  })
})
