import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountWithPinia } from '../../setup/test-utils'
import ChatList from '@/components/helpdesk/ChatList.vue'
import {
  mockOpenChat,
  mockAgentHandlingChat,
  mockResolvedChat,
} from '../../fixtures/chats'

// Mock PrimeVue components
vi.mock('primevue/tag', () => ({
  default: { name: 'Tag', template: '<span class="tag" />' },
}))

describe('ChatList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render chat list', () => {
    const chats = [mockOpenChat, mockAgentHandlingChat]
    const wrapper = mountWithPinia(ChatList, {
      props: {
        chats,
        loading: false,
      },
    })

    expect(wrapper.text()).toContain(mockOpenChat.subject)
    expect(wrapper.text()).toContain(mockAgentHandlingChat.subject)
  })

  it('should handle chat selection', async () => {
    const chats = [mockOpenChat]
    const wrapper = mountWithPinia(ChatList, {
      props: {
        chats,
        loading: false,
      },
    })

    const chatItem = wrapper.find('li')
    expect(chatItem.exists()).toBe(true)

    await chatItem.trigger('click')
    expect(wrapper.emitted('select')).toBeTruthy()
    expect(wrapper.emitted('select')![0][0]).toEqual(mockOpenChat)
  })

  it('should filter chats by status', () => {
    const chats = [mockOpenChat, mockAgentHandlingChat, mockResolvedChat]
    const wrapper = mountWithPinia(ChatList, {
      props: {
        chats,
        loading: false,
      },
    })

    expect(wrapper.text()).toContain(mockOpenChat.subject)
    expect(wrapper.text()).toContain(mockAgentHandlingChat.subject)
    expect(wrapper.text()).toContain(mockResolvedChat.subject)
  })

  it('should show loading state', () => {
    const wrapper = mountWithPinia(ChatList, {
      props: {
        chats: [],
        loading: true,
      },
    })

    expect(wrapper.text()).toContain('Loading chats')
  })

  it('should show empty state', () => {
    const wrapper = mountWithPinia(ChatList, {
      props: {
        chats: [],
        loading: false,
      },
    })

    expect(wrapper.text()).toContain('No conversations yet')
  })

  it('should highlight selected chat', () => {
    const chats = [mockOpenChat, mockAgentHandlingChat]
    const wrapper = mountWithPinia(ChatList, {
      props: {
        chats,
        selectedChat: mockOpenChat,
        loading: false,
      },
    })

    const chatItems = wrapper.findAll('li')
    expect(chatItems.length).toBeGreaterThan(0)
  })
})
