import type { Message } from '@/types'

export const mockUserMessage: Message = {
  id: 1,
  chat_id: 1,
  user_id: 1,
  type: 'user',
  content: 'Hello, I need help',
  is_transfer_request: false,
  created_at: '2026-01-01T10:00:00Z',
}

export const mockAiMessage: Message = {
  id: 2,
  chat_id: 1,
  user_id: null,
  type: 'ai',
  content: 'I can help you with that',
  is_transfer_request: false,
  created_at: '2026-01-01T10:01:00Z',
}

export const mockAgentMessage: Message = {
  id: 3,
  chat_id: 1,
  user_id: 2,
  type: 'agent',
  content: 'Let me assist you',
  is_transfer_request: false,
  created_at: '2026-01-01T10:02:00Z',
}

export const mockSystemMessage: Message = {
  id: 4,
  chat_id: 1,
  user_id: null,
  type: 'system',
  content: 'Chat transferred to agent',
  is_transfer_request: false,
  created_at: '2026-01-01T10:03:00Z',
}

export const mockTransferRequestMessage: Message = {
  id: 5,
  chat_id: 1,
  user_id: 1,
  type: 'user',
  content: 'I want to speak to an agent',
  is_transfer_request: true,
  created_at: '2026-01-01T10:04:00Z',
}

