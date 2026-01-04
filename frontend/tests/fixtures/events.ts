import type { Event } from '@/types'

export const mockEvent: Event = {
  id: 1,
  title: 'Test Event',
  occurrence: '2026-12-31T23:59:59Z',
  description: 'Test event description',
  user_id: 1,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

export const mockEventWithoutDescription: Event = {
  id: 2,
  title: 'Event Without Description',
  occurrence: '2026-12-31T23:59:59Z',
  description: null,
  user_id: 1,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

export const mockPastEvent: Event = {
  id: 3,
  title: 'Past Event',
  occurrence: '2025-01-01T00:00:00Z',
  description: 'This event is in the past',
  user_id: 1,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
}

export const mockFutureEvent: Event = {
  id: 4,
  title: 'Future Event',
  occurrence: '2027-01-01T00:00:00Z',
  description: 'This event is in the future',
  user_id: 1,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

