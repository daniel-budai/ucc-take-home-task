import client from '@/api/client'
import type { Chat, CreateChatPayload, SendMessagePayload, Message } from '@/types'

export const helpdeskApi = {
  // ==================
  // User chat endpoints
  // ==================

  /**
   * Get all chats for current user
   */
  listChats: () => client.get<Chat[]>('/chats'),

  /**
   * Get single chat with messages
   */
  getChat: (id: number) => client.get<Chat>(`/chats/${id}`),

  /**
   * Create new chat
   */
  createChat: (data: CreateChatPayload) => client.post<Chat>('/chats', data),

  /**
   * Send message in chat
   */
  sendMessage: (chatId: number, data: SendMessagePayload) =>
    client.post<Message>(`/chats/${chatId}/messages`, data),

  // ==================
  // Agent endpoints
  // ==================

  /**
   * Get all chats for agent
   */
  listAgentChats: () => client.get<Chat[]>('/helpdesk/chats'),

  /**
   * Get unassigned chats
   */
  listUnassigned: () => client.get<Chat[]>('/helpdesk/chats/unassigned'),

  /**
   * Get a single chat with messages (agent)
   */
  getAgentChat: (chatId: number) => client.get<Chat>(`/helpdesk/chats/${chatId}`),

  /**
   * Assign chat to current agent
   */
  assignChat: (chatId: number) => client.post<Chat>(`/helpdesk/chats/${chatId}/assign`),

  /**
   * Agent reply to chat
   */
  replyToChat: (chatId: number, data: SendMessagePayload) =>
    client.post<Message>(`/helpdesk/chats/${chatId}/reply`, data),

  /**
   * Resolve chat
   */
  resolveChat: (chatId: number) => client.post<Chat>(`/helpdesk/chats/${chatId}/resolve`),
}






