import type { User } from '@/types'

export const mockUser: User = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  role: 'user',
  role_label: 'User',
  created_at: '2026-01-01T00:00:00Z',
}

export const mockAgent: User = {
  id: 2,
  name: 'Test Agent',
  email: 'agent@example.com',
  role: 'helpdesk_agent',
  role_label: 'Helpdesk Agent',
  created_at: '2026-01-01T00:00:00Z',
}

export const mockAdmin: User = {
  id: 3,
  name: 'Test Admin',
  email: 'admin@example.com',
  role: 'admin',
  role_label: 'Admin',
  created_at: '2026-01-01T00:00:00Z',
}

