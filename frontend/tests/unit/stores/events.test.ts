import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useEventsStore } from '@/stores/events'
import { mockEvent, mockPastEvent, mockFutureEvent } from '../../fixtures/events'
import { mockNotification } from '../../setup/helpers'

// Mock dependencies
vi.mock('@/api/events', () => ({
  eventsApi: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('@/composables/useNotification', () => ({
  useNotification: () => mockNotification(),
}))

describe('events Store', () => {
  let store: ReturnType<typeof useEventsStore>
  let eventsApi: typeof import('@/api/events').eventsApi

  beforeEach(async () => {
    setActivePinia(createPinia())
    store = useEventsStore()
    eventsApi = (await import('@/api/events')).eventsApi
    vi.clearAllMocks()
  })

  // Helper function to set up events in store
  async function setupEvents() {
    vi.mocked(eventsApi.create).mockResolvedValueOnce({ data: mockEvent })
    vi.mocked(eventsApi.create).mockResolvedValueOnce({ data: mockPastEvent })
    vi.mocked(eventsApi.create).mockResolvedValueOnce({ data: mockFutureEvent })

    await store.createEvent({
      title: mockEvent.title,
      occurrence: mockEvent.occurrence,
      description: mockEvent.description,
    })
    await store.createEvent({
      title: mockPastEvent.title,
      occurrence: mockPastEvent.occurrence,
      description: mockPastEvent.description,
    })
    await store.createEvent({
      title: mockFutureEvent.title,
      occurrence: mockFutureEvent.occurrence,
      description: mockFutureEvent.description,
    })
  }

  describe('fetchEvents()', () => {
    it('should fetch and set events', async () => {
      const events = [mockEvent, mockPastEvent, mockFutureEvent]
      vi.mocked(eventsApi.list).mockResolvedValue({ data: events })

      await store.fetchEvents()

      // Events should be sorted by occurrence (computed property)
      expect(store.events.length).toBe(3)
      expect(store.events[0].occurrence).toBe('2025-01-01T00:00:00Z') // Past event first
      expect(store.loading).toBe(false)
    })
  })

  describe('createEvent()', () => {
    it('should create event with optimistic update', async () => {
      vi.mocked(eventsApi.create).mockResolvedValue({ data: mockEvent })

      const result = await store.createEvent({
        title: 'Test Event',
        occurrence: '2026-12-31T23:59:59Z',
      })

      expect(result).toEqual(mockEvent)
      // Note: store.events is sortedEvents computed, so we check if it contains the event
      expect(store.events.some(e => e.id === mockEvent.id)).toBe(true)
    })

    it('should rollback on failure', async () => {
      // First add an event to have initial state
      vi.mocked(eventsApi.create).mockResolvedValueOnce({ data: mockPastEvent })
      await store.createEvent({
        title: mockPastEvent.title,
        occurrence: mockPastEvent.occurrence,
        description: mockPastEvent.description,
      })

      const originalLength = store.events.length
      vi.mocked(eventsApi.create).mockRejectedValue(new Error('Failed'))

      await expect(
        store.createEvent({
          title: 'Test Event',
          occurrence: '2026-12-31T23:59:59Z',
        })
      ).rejects.toBeDefined()

      // After rollback, events should be back to original length
      expect(store.events.length).toBe(originalLength)
    })
  })

  describe('updateEvent()', () => {
    beforeEach(async () => {
      // Set up a single event for update tests
      vi.mocked(eventsApi.create).mockResolvedValueOnce({ data: mockEvent })
      await store.createEvent({
        title: mockEvent.title,
        occurrence: mockEvent.occurrence,
        description: mockEvent.description,
      })
    })

    it('should update event with optimistic update', async () => {
      const updatedEvent = { ...mockEvent, description: 'Updated description' }
      vi.mocked(eventsApi.update).mockResolvedValue({ data: updatedEvent })

      const result = await store.updateEvent(mockEvent.id, {
        description: 'Updated description',
      })

      expect(result).toEqual(updatedEvent)
      const updated = store.events.find(e => e.id === mockEvent.id)
      expect(updated?.description).toBe('Updated description')
    })

    it('should rollback on failure', async () => {
      const originalDescription = store.events.find(e => e.id === mockEvent.id)?.description
      vi.mocked(eventsApi.update).mockRejectedValue(new Error('Failed'))

      await expect(
        store.updateEvent(mockEvent.id, { description: 'Updated' })
      ).rejects.toBeDefined()

      const event = store.events.find(e => e.id === mockEvent.id)
      expect(event?.description).toBe(originalDescription)
    })
  })

  describe('deleteEvent()', () => {
    beforeEach(async () => {
      // Set up events for delete tests
      vi.mocked(eventsApi.create).mockResolvedValueOnce({ data: mockEvent })
      vi.mocked(eventsApi.create).mockResolvedValueOnce({ data: mockPastEvent })
      await store.createEvent({
        title: mockEvent.title,
        occurrence: mockEvent.occurrence,
        description: mockEvent.description,
      })
      await store.createEvent({
        title: mockPastEvent.title,
        occurrence: mockPastEvent.occurrence,
        description: mockPastEvent.description,
      })
    })

    it('should delete event with optimistic update', async () => {
      vi.mocked(eventsApi.delete).mockResolvedValue({ data: {} })

      await store.deleteEvent(mockEvent.id)

      expect(store.events.find(e => e.id === mockEvent.id)).toBeUndefined()
      expect(store.events.find(e => e.id === mockPastEvent.id)).toBeDefined()
    })

    it('should rollback on failure', async () => {
      vi.mocked(eventsApi.delete).mockRejectedValue(new Error('Failed'))

      await expect(store.deleteEvent(mockEvent.id)).rejects.toBeDefined()

      expect(store.events.find(e => e.id === mockEvent.id)).toBeDefined()
    })
  })

  describe('getEventById()', () => {
    it('should return event by id', async () => {
      await setupEvents()

      expect(store.getEventById(mockEvent.id)).toEqual(mockEvent)
      expect(store.getEventById(mockPastEvent.id)).toEqual(mockPastEvent)
      expect(store.getEventById(mockFutureEvent.id)).toEqual(mockFutureEvent)
    })

    it('should return undefined for non-existent id', () => {
      expect(store.getEventById(999)).toBeUndefined()
    })
  })

  describe('Computed Properties', () => {
    describe('sortedEvents (via events)', () => {
      it('should sort events by occurrence', async () => {
        await setupEvents()

        const sorted = store.events
        expect(sorted.length).toBe(3)
        // Check that they are sorted by occurrence (ascending)
        expect(sorted[0].id).toBe(mockPastEvent.id) // Past event first
        expect(sorted[1].id).toBe(mockEvent.id) // Current/present event
        expect(sorted[2].id).toBe(mockFutureEvent.id) // Future event last
      })
    })

    describe('upcomingEvents', () => {
      it('should filter future events', async () => {
        await setupEvents()

        const upcoming = store.upcomingEvents
        expect(upcoming.find(e => e.id === mockPastEvent.id)).toBeUndefined()
        // mockEvent (2026-12-31) is in the future, so it should be in upcomingEvents
        expect(upcoming.find(e => e.id === mockEvent.id)).toBeDefined()
        expect(upcoming.find(e => e.id === mockFutureEvent.id)).toBeDefined()
        expect(upcoming.length).toBe(2) // Should have mockEvent and mockFutureEvent
      })
    })

    describe('pastEvents', () => {
      it('should filter past events', async () => {
        await setupEvents()

        const past = store.pastEvents
        expect(past.find(e => e.id === mockPastEvent.id)).toBeDefined()
        // mockEvent (2026-12-31) is in the future, so it should NOT be in pastEvents
        expect(past.find(e => e.id === mockEvent.id)).toBeUndefined()
        expect(past.find(e => e.id === mockFutureEvent.id)).toBeUndefined()
        expect(past.length).toBe(1) // Should have only mockPastEvent
      })
    })
  })
})

