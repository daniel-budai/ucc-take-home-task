import { vi } from 'vitest'
import type { Event } from '@/types'
import { mockEvent, mockPastEvent, mockFutureEvent } from '@/tests/fixtures/events'

export const mockEventsApi = {
  list: vi.fn<[], Promise<{ data: Event[] }>>(),
  get: vi.fn<[number], Promise<{ data: Event }>>(),
  create: vi.fn<Parameters<typeof import('@/api/events').eventsApi.create>, Promise<{ data: Event }>>(),
  update: vi.fn<Parameters<typeof import('@/api/events').eventsApi.update>, Promise<{ data: Event }>>(),
  delete: vi.fn<[number], Promise<{ data: unknown }>>(),
}

export function setupEventsMocks() {
  mockEventsApi.list.mockResolvedValue({
    data: [mockEvent, mockPastEvent, mockFutureEvent],
  })

  mockEventsApi.get.mockImplementation((id: number) => {
    const event = [mockEvent, mockPastEvent, mockFutureEvent].find((e) => e.id === id)
    return Promise.resolve({ data: event || mockEvent })
  })

  mockEventsApi.create.mockResolvedValue({ data: mockEvent })
  mockEventsApi.update.mockResolvedValue({ data: { ...mockEvent, description: 'Updated description' } })
  mockEventsApi.delete.mockResolvedValue({ data: { success: true } })
}

