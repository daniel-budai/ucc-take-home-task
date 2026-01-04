import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useChatStore } from '@/stores/chat'
import { mockOpenChat, mockAgentMessage } from '../../fixtures/chats'
import { mockNotification } from '../../setup/helpers'

// Mock dependencies
vi.mock('@/api/helpdesk', () => ({
  helpdeskApi: {
    listChats: vi.fn(),
    getChat: vi.fn(),
    createChat: vi.fn(),
    sendMessage: vi.fn(),
  },
}))

vi.mock('@/composables/useNotification', () => ({
  useNotification: () => mockNotification(),
}))

describe('chat Store', () => {
  let store: ReturnType<typeof useChatStore>
  let helpdeskApi: typeof import('@/api/helpdesk').helpdeskApi

  beforeEach(async () => {
    setActivePinia(createPinia())
    store = useChatStore()
    helpdeskApi = (await import('@/api/helpdesk')).helpdeskApi
    vi.clearAllMocks()
  })

  describe('fetchChats()', () => {
    it('should fetch and set chats', async () => {
      const chats = [mockOpenChat]
      vi.mocked(helpdeskApi.listChats).mockResolvedValue({ data: chats })

      await store.fetchChats()

      expect(store.chats).toEqual(chats)
      expect(store.loading).toBe(false)
    })

    it('should handle errors', async () => {
      vi.mocked(helpdeskApi.listChats).mockRejectedValue(new Error('Failed'))

      await store.fetchChats()

      expect(store.loading).toBe(false)
    })
  })

  describe('fetchChat()', () => {
    it('should fetch single chat with messages', async () => {
      vi.mocked(helpdeskApi.getChat).mockResolvedValue({ data: mockOpenChat })

      await store.fetchChat(mockOpenChat.id)

      expect(store.currentChat).toEqual(mockOpenChat)
      expect(store.messages).toEqual(mockOpenChat.messages || [])
    })
  })

  describe('createChat()', () => {
    it('should create chat and add to list', async () => {
      vi.mocked(helpdeskApi.createChat).mockResolvedValue({ data: mockOpenChat })

      const result = await store.createChat({
        subject: 'Test',
        message: 'Test message',
      })

      expect(result).toEqual(mockOpenChat)
      expect(store.chats).toContainEqual(mockOpenChat)
    })
  })

  describe('sendMessage()', () => {
    it('should send message and add to messages', async () => {
      store.currentChat = mockOpenChat
      vi.mocked(helpdeskApi.sendMessage).mockResolvedValue({ data: mockAgentMessage })

      const result = await store.sendMessage(mockOpenChat.id, 'Test message')

      expect(result).toEqual(mockAgentMessage)
      expect(store.messages).toContainEqual(mockAgentMessage)
    })
  })

  describe('sortedChats computed', () => {
    it('should sort chats by created_at descending', async () => {
      // Test the sorting by mocking the API response
      const olderChat = { ...mockOpenChat, id: 1, created_at: '2026-01-01T00:00:00Z' }
      const newerChat = { ...mockOpenChat, id: 2, created_at: '2026-01-02T00:00:00Z' }

      vi.mocked(helpdeskApi.listChats).mockResolvedValue({ data: [olderChat, newerChat] })

      await store.fetchChats()

      // Since fetchChats sets chats.value = data, and sortedChats sorts by created_at desc
      // The newer chat should appear first
      expect(store.chats[0].id).toBe(newerChat.id)
      expect(store.chats[1].id).toBe(olderChat.id)
    })
  })
})

