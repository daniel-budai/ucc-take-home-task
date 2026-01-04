import { describe, it, expect } from 'vitest'
import {
  chatStatusSchema,
  messageTypeSchema,
  messageSchema,
  chatSchema,
  createChatSchema,
  sendMessageSchema,
} from '@/types/chat'

describe('Chat Type Schemas', () => {
  describe('chatStatusSchema', () => {
    it('should validate valid chat statuses', () => {
      expect(chatStatusSchema.parse('open')).toBe('open')
      expect(chatStatusSchema.parse('ai_handling')).toBe('ai_handling')
      expect(chatStatusSchema.parse('transferred')).toBe('transferred')
      expect(chatStatusSchema.parse('agent_handling')).toBe('agent_handling')
      expect(chatStatusSchema.parse('resolved')).toBe('resolved')
      expect(chatStatusSchema.parse('closed')).toBe('closed')
    })

    it('should reject invalid chat statuses', () => {
      expect(() => chatStatusSchema.parse('invalid')).toThrow()
    })
  })

  describe('messageTypeSchema', () => {
    it('should validate valid message types', () => {
      expect(messageTypeSchema.parse('user')).toBe('user')
      expect(messageTypeSchema.parse('ai')).toBe('ai')
      expect(messageTypeSchema.parse('agent')).toBe('agent')
      expect(messageTypeSchema.parse('system')).toBe('system')
    })

    it('should reject invalid message types', () => {
      expect(() => messageTypeSchema.parse('invalid')).toThrow()
    })
  })

  describe('messageSchema', () => {
    const validMessage = {
      id: 1,
      chat_id: 1,
      user_id: 1,
      type: 'user',
      content: 'Test message',
      is_transfer_request: false,
      created_at: '2026-01-01T00:00:00Z',
    }

    it('should validate valid message', () => {
      expect(messageSchema.parse(validMessage)).toEqual(validMessage)
    })

    it('should allow null user_id', () => {
      const messageWithNullUserId = { ...validMessage, user_id: null }
      expect(messageSchema.parse(messageWithNullUserId)).toEqual(messageWithNullUserId)
    })

    it('should reject invalid message structure', () => {
      expect(() => messageSchema.parse({})).toThrow()
    })
  })

  describe('chatSchema', () => {
    const validChat = {
      id: 1,
      user_id: 1,
      assigned_agent_id: null,
      status: 'open',
      subject: 'Test Chat',
      resolved_at: null,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    }

    it('should validate valid chat', () => {
      expect(chatSchema.parse(validChat)).toEqual(validChat)
    })

    it('should allow optional messages array', () => {
      const chatWithMessages = { ...validChat, messages: [] }
      expect(chatSchema.parse(chatWithMessages)).toEqual(chatWithMessages)
    })

    it('should reject invalid chat structure', () => {
      expect(() => chatSchema.parse({})).toThrow()
    })
  })

  describe('createChatSchema', () => {
    it('should validate valid create chat payload', () => {
      const validPayload = {
        subject: 'Test Subject',
        message: 'Test message content',
      }
      expect(createChatSchema.parse(validPayload)).toEqual(validPayload)
    })

    it('should reject subject that is too short', () => {
      const invalidPayload = {
        subject: 'A',
        message: 'Test message',
      }
      expect(() => createChatSchema.parse(invalidPayload)).toThrow()
    })

    it('should reject empty message', () => {
      const invalidPayload = {
        subject: 'Test Subject',
        message: '',
      }
      expect(() => createChatSchema.parse(invalidPayload)).toThrow()
    })

    it('should trim whitespace', () => {
      const payload = {
        subject: '  Test Subject  ',
        message: '  Test message  ',
      }
      const result = createChatSchema.parse(payload)
      expect(result.subject).toBe('Test Subject')
      expect(result.message).toBe('Test message')
    })
  })

  describe('sendMessageSchema', () => {
    it('should validate valid message payload', () => {
      const validPayload = { content: 'Test message' }
      expect(sendMessageSchema.parse(validPayload)).toEqual(validPayload)
    })

    it('should reject empty content', () => {
      expect(() => sendMessageSchema.parse({ content: '' })).toThrow()
    })

    it('should trim whitespace', () => {
      const payload = { content: '  Test message  ' }
      const result = sendMessageSchema.parse(payload)
      expect(result.content).toBe('Test message')
    })
  })
})

