import { vi } from 'vitest'
import type { Chat, Message } from '@/types'
import {
  mockOpenChat,
  mockAgentHandlingChat,
  mockResolvedChat,
  mockTransferredChat,
  mockAgentMessage,
} from '@/tests/fixtures/chats'

export const mockHelpdeskApi = {
  listChats: vi.fn<[], Promise<{ data: Chat[] }>>(),
  getChat: vi.fn<[number], Promise<{ data: Chat }>>(),
  createChat: vi.fn<Parameters<typeof import('@/api/helpdesk').helpdeskApi.createChat>, Promise<{ data: Chat }>>(),
  sendMessage: vi.fn<Parameters<typeof import('@/api/helpdesk').helpdeskApi.sendMessage>, Promise<{ data: Message }>>(),
  listAgentChats: vi.fn<[], Promise<{ data: Chat[] }>>(),
  listUnassigned: vi.fn<[], Promise<{ data: Chat[] }>>(),
  getAgentChat: vi.fn<[number], Promise<{ data: Chat }>>(),
  assignChat: vi.fn<[number], Promise<{ data: Chat }>>(),
  replyToChat: vi.fn<Parameters<typeof import('@/api/helpdesk').helpdeskApi.replyToChat>, Promise<{ data: Message }>>(),
  resolveChat: vi.fn<[number], Promise<{ data: Chat }>>(),
}

export function setupHelpdeskMocks() {
  mockHelpdeskApi.listChats.mockResolvedValue({
    data: [mockOpenChat],
  })

  mockHelpdeskApi.getChat.mockResolvedValue({ data: mockOpenChat })
  mockHelpdeskApi.createChat.mockResolvedValue({ data: mockOpenChat })
  mockHelpdeskApi.sendMessage.mockResolvedValue({ data: mockAgentMessage })

  mockHelpdeskApi.listAgentChats.mockResolvedValue({
    data: [mockAgentHandlingChat, mockTransferredChat],
  })

  mockHelpdeskApi.listUnassigned.mockResolvedValue({
    data: [mockOpenChat],
  })

  mockHelpdeskApi.getAgentChat.mockResolvedValue({ data: mockAgentHandlingChat })
  mockHelpdeskApi.assignChat.mockResolvedValue({ data: mockAgentHandlingChat })
  mockHelpdeskApi.replyToChat.mockResolvedValue({ data: mockAgentMessage })
  mockHelpdeskApi.resolveChat.mockResolvedValue({ data: mockResolvedChat })
}

