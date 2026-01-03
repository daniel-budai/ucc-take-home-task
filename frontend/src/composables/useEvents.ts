import { ref, computed } from 'vue'
import { eventsApi } from '@/api/events'
import { useNotification } from '@/composables/useNotification'
import type { Event, CreateEventPayload, UpdateEventPayload } from '@/types'

export function useEvents() {
  // State
  const events = ref<Event[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const sortedEvents = computed(() =>
    [...events.value].sort(
      (a, b) => new Date(a.occurrence).getTime() - new Date(b.occurrence).getTime()
    )
  )

  const upcomingEvents = computed(() =>
    sortedEvents.value.filter((e) => new Date(e.occurrence) > new Date())
  )

  const pastEvents = computed(() =>
    sortedEvents.value.filter((e) => new Date(e.occurrence) <= new Date())
  )

  // Dependencies
  const { success, error: showError } = useNotification()

  // Actions
  async function fetchEvents() {
    loading.value = true
    error.value = null
    try {
      const response = await eventsApi.list()
      // Laravel wraps collection in { data: [...] }
      const data = response.data
      events.value = Array.isArray(data) ? data : (data as { data: Event[] }).data
    } catch (e: unknown) {
      const err = e as { message?: string }
      error.value = err.message || 'Failed to load events'
      showError('Failed to load events')
    } finally {
      loading.value = false
    }
  }

  async function createEvent(payload: CreateEventPayload) {
    const response = await eventsApi.create(payload)
    // Laravel wraps single resources with additional() in { data: {...}, message: "..." }
    const eventData = (response.data as { data?: Event }).data || response.data
    events.value.push(eventData as Event)
    success('Event created!')
    return eventData
  }

  async function updateEvent(id: number, payload: UpdateEventPayload) {
    const response = await eventsApi.update(id, payload)
    // Laravel wraps single resources with additional() in { data: {...}, message: "..." }
    const eventData = (response.data as { data?: Event }).data || response.data
    const index = events.value.findIndex((e) => e.id === id)
    if (index !== -1) {
      events.value[index] = eventData as Event
    }
    success('Event updated!')
    return eventData
  }

  async function deleteEvent(id: number) {
    await eventsApi.delete(id)
    events.value = events.value.filter((e) => e.id !== id)
    success('Event deleted!')
  }

  function getEventById(id: number) {
    return events.value.find((e) => e.id === id)
  }

  return {
    // State
    events: sortedEvents,
    upcomingEvents,
    pastEvents,
    loading,
    error,
    // Actions
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventById,
  }
}


