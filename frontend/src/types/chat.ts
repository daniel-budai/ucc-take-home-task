import { z } from 'zod'
import { userSchema } from '@/types/auth'

// Chat status
export const chatStatusSchema = z.enum([
  'open',
  'ai_handling',
  'transferred',
  'agent_handling',
  'resolved',
  'closed',
])
export type ChatStatus = z.infer<typeof chatStatusSchema>

// Message type
export const messageTypeSchema = z.enum(['user', 'ai', 'agent', 'system'])
export type MessageType = z.infer<typeof messageTypeSchema>

// Message schema
export const messageSchema = z.object({
  id: z.number(),
  chat_id: z.number(),
  user_id: z.number().nullable(),
  type: messageTypeSchema,
  content: z.string(),
  is_transfer_request: z.boolean(),
  created_at: z.string(),
})
export type Message = z.infer<typeof messageSchema>

// Chat schema
export const chatSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  assigned_agent_id: z.number().nullable(),
  status: chatStatusSchema,
  subject: z.string(),
  resolved_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  messages: z.array(messageSchema).optional(),
  user: userSchema.optional(),
  assigned_agent: userSchema.optional(),
})
export type Chat = z.infer<typeof chatSchema>

// Create chat payload
export const createChatSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
})
export type CreateChatPayload = z.infer<typeof createChatSchema>

// Send message payload
export const sendMessageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty'),
})
export type SendMessagePayload = z.infer<typeof sendMessageSchema>

// Chat list
export const chatsListSchema = z.array(chatSchema)
export type ChatsList = z.infer<typeof chatsListSchema>






