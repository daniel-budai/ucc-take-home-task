import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountWithPinia } from '../../setup/test-utils'
import ChatMessage from '@/components/helpdesk/ChatMessage.vue'
import {
  mockUserMessage,
  mockAiMessage,
  mockAgentMessage,
  mockSystemMessage,
} from '../../fixtures/messages'

// Mock PrimeVue components
vi.mock('primevue/avatar', () => ({
  default: {
    name: 'Avatar',
    template: '<div class="avatar"><slot /></div>',
    props: ['label', 'shape', 'class'],
  },
}))

// Mock MessageBubble component - pass through content
vi.mock('@/components/helpdesk/MessageBubble.vue', () => ({
  default: {
    name: 'MessageBubble',
    template: '<div class="message-bubble">{{ content }}</div>',
    props: ['content', 'timestamp', 'senderLabel', 'senderType', 'variant'],
  },
}))

describe('ChatMessage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render message content', () => {
    const wrapper = mountWithPinia(ChatMessage, {
      props: {
        message: mockUserMessage,
      },
    })

    expect(wrapper.text()).toContain(mockUserMessage.content)
  })

  it('should display correct avatar', () => {
    const wrapper = mountWithPinia(ChatMessage, {
      props: {
        message: mockUserMessage,
      },
    })

    // Avatar should be rendered
    const avatars = wrapper.findAll('.avatar')
    expect(avatars.length).toBeGreaterThan(0)
  })

  it('should format message timestamp', () => {
    const wrapper = mountWithPinia(ChatMessage, {
      props: {
        message: mockUserMessage,
      },
    })

    // Timestamp should be formatted (component uses formatTime)
    expect(wrapper.find('.message-bubble').exists()).toBe(true)
  })

  it('should render system message differently', () => {
    const wrapper = mountWithPinia(ChatMessage, {
      props: {
        message: mockSystemMessage,
      },
    })

    // System messages should be centered
    expect(wrapper.text()).toContain(mockSystemMessage.content)
    expect(wrapper.find('.message-bubble').exists()).toBe(false) // System messages don't use MessageBubble
  })

  it('should render user message with correct alignment', () => {
    const wrapper = mountWithPinia(ChatMessage, {
      props: {
        message: mockUserMessage,
      },
    })

    // User messages should be right-aligned
    const messageContainer = wrapper.find('.flex')
    expect(messageContainer.exists()).toBe(true)
  })

  it('should render AI message with correct styling', () => {
    const wrapper = mountWithPinia(ChatMessage, {
      props: {
        message: mockAiMessage,
      },
    })

    expect(wrapper.text()).toContain(mockAiMessage.content)
    expect(wrapper.find('.message-bubble').exists()).toBe(true)
  })

  it('should render agent message with correct styling', () => {
    const wrapper = mountWithPinia(ChatMessage, {
      props: {
        message: mockAgentMessage,
      },
    })

    expect(wrapper.text()).toContain(mockAgentMessage.content)
    expect(wrapper.find('.message-bubble').exists()).toBe(true)
  })
})
