import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

// Enable relative time plugin
dayjs.extend(relativeTime)

/**
 * Format date and time as "Jan 5, 2026 3:30 PM"
 */
export function formatDateTime(date: string | Date): string {
  return dayjs(date).format('MMM D, YYYY h:mm A')
}

/**
 * Format as relative time "2 hours ago"
 */
export function formatRelative(date: string | Date): string {
  return dayjs(date).fromNow()
}

/**
 * Format time only as "3:30 PM"
 */
export function formatTime(date: string | Date): string {
  return dayjs(date).format('h:mm A')
}

/**
 * Check if date is in the past
 */
export function isPast(date: string | Date): boolean {
  return dayjs(date).isBefore(dayjs())
}
