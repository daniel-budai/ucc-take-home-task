import { describe, it, expect } from 'vitest'
import { formatDateTime, formatRelative, formatTime, isPast } from '@/utils/date'

describe('date utils', () => {
  const testDate = new Date('2026-01-15T14:30:00Z')

  describe('formatDateTime()', () => {
    it('should format date and time correctly', () => {
      const result = formatDateTime(testDate)
      expect(result).toMatch(/Jan 15, 2026/)
      expect(result).toMatch(/\d{1,2}:\d{2} (AM|PM)/)
    })

    it('should handle string dates', () => {
      const result = formatDateTime('2026-01-15T14:30:00Z')
      expect(result).toMatch(/Jan 15, 2026/)
    })
  })

  describe('formatRelative()', () => {
    it('should format as relative time', () => {
      const pastDate = new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      const result = formatRelative(pastDate)
      expect(result).toMatch(/ago/)
    })

    it('should handle string dates', () => {
      const pastDate = new Date(Date.now() - 1000).toISOString()
      const result = formatRelative(pastDate)
      expect(result).toBeTruthy()
    })
  })

  describe('formatTime()', () => {
    it('should format time only', () => {
      const result = formatTime(testDate)
      expect(result).toMatch(/\d{1,2}:\d{2} (AM|PM)/)
    })

    it('should handle string dates', () => {
      const result = formatTime('2026-01-15T14:30:00Z')
      expect(result).toMatch(/\d{1,2}:\d{2} (AM|PM)/)
    })
  })

  describe('isPast()', () => {
    it('should return true for past dates', () => {
      const pastDate = new Date(Date.now() - 1000)
      expect(isPast(pastDate)).toBe(true)
    })

    it('should return false for future dates', () => {
      const futureDate = new Date(Date.now() + 1000)
      expect(isPast(futureDate)).toBe(false)
    })

    it('should handle string dates', () => {
      const pastDate = new Date(Date.now() - 1000).toISOString()
      expect(isPast(pastDate)).toBe(true)
    })
  })
})

