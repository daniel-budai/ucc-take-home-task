import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { eventsApi } from '@/api/events'
import { useNotification } from '@/composables/useNotification'
import { handleApiError } from '@/utils/errorHandler'
import type { Event, CreateEventPayload, UpdateEventPayload } from '@/types'
import type { AppError } from '@/utils/errorHandler'

export const useEventsStore = defineStore('events', () => {
  const events = ref<Event[]>([])
  const loading = ref(false)
  const error = ref<AppError | null>(null)

  const actionLoading = ref({
    fetch: false,
    create: false,
    update: false,
    delete: false,
  })

  const sortedEvents = computed(() =>
    [...events.value].sort(
      (a, b) => new Date(a.occurrence).getTime() - new Date(b.occurrence).getTime()
    )
  )

  const upcomingEvents = computed(() => {
    const currentTime = Date.now()
    return sortedEvents.value.filter((e) => {
      const eventTime = new Date(e.occurrence).getTime()
      return eventTime > currentTime
    })
  })

  const pastEvents = computed(() => {
    const currentTime = Date.now()
    return sortedEvents.value.filter((e) => {
      const eventTime = new Date(e.occurrence).getTime()
      return eventTime <= currentTime
    })
  })

  async function fetchEvents() {
    const { showErrorWithRecovery } = useNotification()
    
    actionLoading.value.fetch = true
    error.value = null
    
    try {
      const { data } = await eventsApi.list()
      events.value = data
    } catch (err) {
      const appError = handleApiError(err, {
        operation: 'fetchEvents',
        retry: fetchEvents,
      })
      
      error.value = appError
      showErrorWithRecovery(appError)
    } finally {
      actionLoading.value.fetch = false
    }
  }

  async function createEvent(payload: CreateEventPayload) {
    const { success, showErrorWithRecovery } = useNotification()
    
    actionLoading.value.create = true
    error.value = null
    
    try {
      const { data } = await eventsApi.create(payload)
      events.value.push(data)
      success('Event created successfully!')
      return data
    } catch (err) {
      const appError = handleApiError(err, {
        operation: 'createEvent',
        retry: async () => {
          await createEvent(payload)
        },
      })
      
      error.value = appError
      showErrorWithRecovery(appError)
      throw appError
    } finally {
      actionLoading.value.create = false
    }
  }

  async function updateEvent(id: number, payload: UpdateEventPayload) {
    const { success, showErrorWithRecovery } = useNotification()
    
    actionLoading.value.update = true
    error.value = null
    
    const originalEvent = events.value.find(e => e.id === id)
    
    try {
      const { data } = await eventsApi.update(id, payload)
      const index = events.value.findIndex((e) => e.id === id)
      if (index !== -1) {
        events.value[index] = data
      }
      success('Event updated successfully!')
      return data
    } catch (err) {
      const appError = handleApiError(err, {
        operation: 'updateEvent',
        retry: async () => {
          await updateEvent(id, payload)
        },
      })
      
      error.value = appError
      showErrorWithRecovery(appError)
      
      if (originalEvent) {
        const index = events.value.findIndex(e => e.id === id)
        if (index !== -1) {
          events.value[index] = originalEvent
        }
      }
      
      throw appError
    } finally {
      actionLoading.value.update = false
    }
  }

  async function deleteEvent(id: number) {
    const { success, showErrorWithRecovery } = useNotification()
    
    actionLoading.value.delete = true
    error.value = null
    
    const eventToDelete = events.value.find(e => e.id === id)
    
    try {
      await eventsApi.delete(id)
      events.value = events.value.filter((e) => e.id !== id)
      success('Event deleted successfully!')
    } catch (err) {
      const appError = handleApiError(err, {
        operation: 'deleteEvent',
        retry: () => deleteEvent(id),
      })
      
      error.value = appError
      showErrorWithRecovery(appError)
      
      if (eventToDelete) {
        events.value.push(eventToDelete)
      }
      
      throw appError
    } finally {
      actionLoading.value.delete = false
    }
  }

  function clearError() {
    error.value = null
  }

  function getEventById(id: number) {
    return events.value.find((e) => e.id === id)
  }

  function $reset() {
    events.value = []
    loading.value = false
    error.value = null
    actionLoading.value = {
      fetch: false,
      create: false,
      update: false,
      delete: false,
    }
  }

  return {
    events: sortedEvents,
    upcomingEvents,
    pastEvents,
    loading,
    error,
    actionLoading,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    clearError,
    getEventById,
    $reset,
  }
})