import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useChatAgentStore } from '@/stores/chatAgent'
import {
  mockOpenChat,
  mockAgentHandlingChat,
  mockTransferredChat,
  mockResolvedChat,
  mockAgentMessage,
} from '../../fixtures/chats'
import { mockNotification, createMockAxiosError } from '../../setup/helpers'
import type { Chat } from '@/types'

// Mock dependencies
vi.mock('@/api/helpdesk', () => ({
  helpdeskApi: {
    listAgentChats: vi.fn(),
    listUnassigned: vi.fn(),
    getAgentChat: vi.fn(),
    assignChat: vi.fn(),
    replyToChat: vi.fn(),
    resolveChat: vi.fn(),
  },
}))

vi.mock('@/composables/useNotification', () => ({
  useNotification: () => mockNotification(),
}))

describe('chatAgent Store', () => {
  let store: ReturnType<typeof useChatAgentStore>
  let helpdeskApi: typeof import('@/api/helpdesk').helpdeskApi

  beforeEach(async () => {
    setActivePinia(createPinia())
    store = useChatAgentStore()
    helpdeskApi = (await import('@/api/helpdesk')).helpdeskApi
    vi.clearAllMocks()
  })

  describe('fetchAgentChats()', () => {
    it('should fetch and set chats', async () => {
      const chats = [mockAgentHandlingChat, mockTransferredChat]
      vi.mocked(helpdeskApi.listAgentChats).mockResolvedValue({ data: chats })

      await store.fetchAgentChats()

      expect(store.chats).toEqual(chats)
      expect(store.actionLoading.fetchAgentChats).toBe(false)
    })

    it('should handle errors', async () => {
      const error = createMockAxiosError(500)
      vi.mocked(helpdeskApi.listAgentChats).mockRejectedValue(error)

      await store.fetchAgentChats()

      expect(store.error).toBeDefined()
      expect(store.actionLoading.fetchAgentChats).toBe(false)
    })

    it('should set loading state correctly', async () => {
      let resolvePromise: (value: { data: Chat[] }) => void
      const promise = new Promise<{ data: Chat[] }>((resolve) => {
        resolvePromise = resolve
      })
      vi.mocked(helpdeskApi.listAgentChats).mockReturnValue(promise)

      const fetchPromise = store.fetchAgentChats()
      expect(store.actionLoading.fetchAgentChats).toBe(true)

      resolvePromise!({ data: [] })
      await fetchPromise

      expect(store.actionLoading.fetchAgentChats).toBe(false)
    })
  })

  describe('fetchUnassigned()', () => {
    it('should fetch and set unassigned chats', async () => {
      const unassigned = [mockOpenChat]
      vi.mocked(helpdeskApi.listUnassigned).mockResolvedValue({ data: unassigned })

      await store.fetchUnassigned()

      expect(store.unassignedChats).toEqual(unassigned)
      expect(store.actionLoading.fetchUnassigned).toBe(false)
    })
  })

  describe('assignChat()', () => {
    it('should assign chat and update state', async () => {
      store.unassignedChats = [mockOpenChat]
      vi.mocked(helpdeskApi.assignChat).mockResolvedValue({ data: mockAgentHandlingChat })

      const result = await store.assignChat(mockOpenChat.id)

      expect(result).toEqual(mockAgentHandlingChat)
      expect(store.unassignedChats).not.toContainEqual(mockOpenChat)
      expect(store.chats).toContainEqual(mockAgentHandlingChat)
      expect(store.currentChat).toEqual(mockAgentHandlingChat)
      expect(store.messages).toEqual(mockAgentHandlingChat.messages || [])
    })

    it('should rollback on failure', async () => {
      const originalUnassigned = [mockOpenChat]
      store.unassignedChats = [...originalUnassigned]
      const error = createMockAxiosError(500)
      vi.mocked(helpdeskApi.assignChat).mockRejectedValue(error)

      await expect(store.assignChat(mockOpenChat.id)).rejects.toBeDefined()

      expect(store.unassignedChats).toEqual(originalUnassigned)
      expect(store.actionLoading.assignChat).toBe(false)
    })
  })

  describe('replyToChat()', () => {
    it('should send message and add to messages', async () => {
      store.currentChat = mockAgentHandlingChat
      vi.mocked(helpdeskApi.replyToChat).mockResolvedValue({ data: mockAgentMessage })

      const result = await store.replyToChat('Test reply')

      expect(result).toEqual(mockAgentMessage)
      expect(store.messages).toContainEqual(mockAgentMessage)
    })

    it('should not send if no current chat', async () => {
      store.currentChat = null

      await store.replyToChat('Test reply')

      expect(helpdeskApi.replyToChat).not.toHaveBeenCalled()
    })

    it('should handle errors', async () => {
      store.currentChat = mockAgentHandlingChat
      const error = createMockAxiosError(500)
      vi.mocked(helpdeskApi.replyToChat).mockRejectedValue(error)

      await expect(store.replyToChat('Test')).rejects.toBeDefined()
      expect(store.error).toBeDefined()
    })
  })

  describe('resolveChat()', () => {
    it('should resolve chat and update state', async () => {
      store.chats = [mockAgentHandlingChat]
      store.currentChat = mockAgentHandlingChat
      vi.mocked(helpdeskApi.resolveChat).mockResolvedValue({ data: mockResolvedChat })

      const result = await store.resolveChat(mockAgentHandlingChat.id)

      expect(result).toEqual(mockResolvedChat)
      expect(store.chats[0]).toEqual(mockResolvedChat)
      expect(store.currentChat).toEqual(mockResolvedChat)
    })

    it('should rollback on failure', async () => {
      const originalChats = [mockAgentHandlingChat]
      const originalCurrentChat = mockAgentHandlingChat
      store.chats = [...originalChats]
      store.currentChat = originalCurrentChat
      const error = createMockAxiosError(500)
      vi.mocked(helpdeskApi.resolveChat).mockRejectedValue(error)

      await expect(store.resolveChat(mockAgentHandlingChat.id)).rejects.toBeDefined()

      expect(store.chats).toEqual(originalChats)
      expect(store.currentChat).toEqual(originalCurrentChat)
    })
  })

  describe('selectChat()', () => {
    it('should set current chat and messages', () => {
      store.selectChat(mockAgentHandlingChat)

      expect(store.currentChat).toEqual(mockAgentHandlingChat)
      expect(store.messages).toEqual(mockAgentHandlingChat.messages || [])
    })

    it('should fetch messages if chat has no messages', async () => {
      const chatWithoutMessages = { ...mockAgentHandlingChat, messages: undefined }
      const chatWithMessages = { ...mockAgentHandlingChat, messages: [mockAgentMessage] }
      vi.mocked(helpdeskApi.getAgentChat).mockResolvedValue({ data: chatWithMessages })

      await store.selectChat(chatWithoutMessages)

      expect(helpdeskApi.getAgentChat).toHaveBeenCalledWith(chatWithoutMessages.id)
      expect(store.currentChat).toEqual(chatWithMessages)
      expect(store.messages).toEqual(chatWithMessages.messages || [])
    })
  })

  describe('addMessage()', () => {
    it('should add message if not duplicate', () => {
      store.messages = []
      store.addMessage(mockAgentMessage)

      expect(store.messages).toContainEqual(mockAgentMessage)
    })

    it('should not add duplicate message', () => {
      store.messages = [mockAgentMessage]
      store.addMessage(mockAgentMessage)

      expect(store.messages).toHaveLength(1)
    })
  })

  describe('Computed Properties', () => {
    describe('myChats', () => {
      it('should filter chats with agent_handling status', () => {
        store.chats = [mockAgentHandlingChat, mockOpenChat, mockResolvedChat]

        expect(store.myChats).toContainEqual(mockAgentHandlingChat)
        expect(store.myChats).not.toContainEqual(mockOpenChat)
        expect(store.myChats).not.toContainEqual(mockResolvedChat)
      })

      it('should filter chats with transferred status', () => {
        store.chats = [mockTransferredChat, mockOpenChat]

        expect(store.myChats).toContainEqual(mockTransferredChat)
        expect(store.myChats).not.toContainEqual(mockOpenChat)
      })
    })

    describe('resolvedChats', () => {
      it('should filter chats with resolved status', () => {
        store.chats = [mockResolvedChat, mockAgentHandlingChat, mockOpenChat]

        expect(store.resolvedChats).toContainEqual(mockResolvedChat)
        expect(store.resolvedChats).not.toContainEqual(mockAgentHandlingChat)
        expect(store.resolvedChats).not.toContainEqual(mockOpenChat)
      })
    })
  })

  describe('$reset()', () => {
    it('should reset all state', () => {
      store.chats = [mockAgentHandlingChat]
      store.unassignedChats = [mockOpenChat]
      store.currentChat = mockAgentHandlingChat
      store.messages = [mockAgentMessage]
      store.loading = true

      store.$reset()

      expect(store.chats).toEqual([])
      expect(store.unassignedChats).toEqual([])
      expect(store.currentChat).toBeNull()
      expect(store.messages).toEqual([])
      expect(store.loading).toBe(false)
    })
  })
})

