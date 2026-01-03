import { z } from 'zod'

// Event schema
export const eventSchema = z.object({
  id: z.number(),
  title: z.string(),
  occurrence: z.string(),
  description: z.string().nullable(),
  user_id: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
})
export type Event = z.infer<typeof eventSchema>

// Create event payload
export const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  occurrence: z.union([z.string(), z.date()]).refine((val) => val !== '', {
    message: 'Date and time is required',
  }),
  description: z.string().optional(),
})
export type CreateEventPayload = z.infer<typeof createEventSchema>

// Update event payload (only description can be updated per requirements)
export const updateEventSchema = z.object({
  description: z.string(),
})
export type UpdateEventPayload = z.infer<typeof updateEventSchema>
