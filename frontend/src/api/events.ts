import client from '@/api/client'
import type { Event, CreateEventPayload, UpdateEventPayload } from '@/types'

export const eventsApi = {
  /**
   * Get all events for current user
   */
  list: () => client.get<Event[]>('/events'),

  /**
   * Get single event by ID
   */
  get: (id: number) => client.get<Event>(`/events/${id}`),

  /**
   * Create new event
   */
  create: (data: CreateEventPayload) => client.post<Event>('/events', data),

  /**
   * Update event description
   */
  update: (id: number, data: UpdateEventPayload) => client.patch<Event>(`/events/${id}`, data),

  /**
   * Delete event
   */
  delete: (id: number) => client.delete(`/events/${id}`),
}






