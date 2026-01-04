import type { Chat, Message } from '@/types'
import { mockUser } from './users'
import { mockAgent } from './users'

export const mockMessage: Message = {
  id: 1,
  chat_id: 1,
  user_id: 1,
  type: 'user',
  content: 'Test message',
  is_transfer_request: false,
  created_at: '2026-01-01T10:00:00Z',
}

export const mockAiMessage: Message = {
  id: 2,
  chat_id: 1,
  user_id: null,
  type: 'ai',
  content: 'AI response',
  is_transfer_request: false,
  created_at: '2026-01-01T10:01:00Z',
}

export const mockAgentMessage: Message = {
  id: 3,
  chat_id: 1,
  user_id: 2,
  type: 'agent',
  content: 'Agent response',
  is_transfer_request: false,
  created_at: '2026-01-01T10:02:00Z',
}

export const mockOpenChat: Chat = {
  id: 1,
  user_id: 1,
  assigned_agent_id: null,
  status: 'open',
  subject: 'Test Chat',
  resolved_at: null,
  created_at: '2026-01-01T10:00:00Z',
  updated_at: '2026-01-01T10:00:00Z',
  messages: [mockMessage],
  user: mockUser,
}

export const mockAiHandlingChat: Chat = {
  id: 2,
  user_id: 1,
  assigned_agent_id: null,
  status: 'ai_handling',
  subject: 'AI Handling Chat',
  resolved_at: null,
  created_at: '2026-01-01T10:00:00Z',
  updated_at: '2026-01-01T10:00:00Z',
  messages: [mockMessage, mockAiMessage],
  user: mockUser,
}

export const mockAgentHandlingChat: Chat = {
  id: 3,
  user_id: 1,
  assigned_agent_id: 2,
  status: 'agent_handling',
  subject: 'Agent Handling Chat',
  resolved_at: null,
  created_at: '2026-01-01T10:00:00Z',
  updated_at: '2026-01-01T10:00:00Z',
  messages: [mockMessage, mockAiMessage, mockAgentMessage],
  user: mockUser,
  assigned_agent: mockAgent,
}

export const mockTransferredChat: Chat = {
  id: 4,
  user_id: 1,
  assigned_agent_id: 2,
  status: 'transferred',
  subject: 'Transferred Chat',
  resolved_at: null,
  created_at: '2026-01-01T10:00:00Z',
  updated_at: '2026-01-01T10:00:00Z',
  messages: [mockMessage],
  user: mockUser,
  assigned_agent: mockAgent,
}

export const mockResolvedChat: Chat = {
  id: 5,
  user_id: 1,
  assigned_agent_id: 2,
  status: 'resolved',
  subject: 'Resolved Chat',
  resolved_at: '2026-01-01T12:00:00Z',
  created_at: '2026-01-01T10:00:00Z',
  updated_at: '2026-01-01T12:00:00Z',
  messages: [mockMessage, mockAgentMessage],
  user: mockUser,
  assigned_agent: mockAgent,
}

