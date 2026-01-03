import type { ChatStatus } from '@/types'

// Routes constants - centralized route definitions
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  RESET_PASSWORD: '/reset-password',
  EVENTS: '/events',
  CHAT: '/chat',
  AGENT_DASHBOARD: '/agent',
} as const

export type RouteKey = keyof typeof ROUTES

// Chat status labels - typed to actual ChatStatus values
export const CHAT_STATUS_LABELS: Record<ChatStatus, string> = {
  open: 'Open',
  ai_handling: 'AI Handling',
  transferred: 'Transferred',
  agent_handling: 'Agent Handling',
  resolved: 'Resolved',
  closed: 'Closed',
}

// Chat status colors (for PrimeVue Tag severity)
export const CHAT_STATUS_COLORS: Record<ChatStatus, string> = {
  open: 'info',
  ai_handling: 'info',
  transferred: 'warning',
  agent_handling: 'success',
  resolved: 'secondary',
  closed: 'secondary',
}

// UI Constants
export const UI_CONSTANTS = {
  TOAST_DURATION: {
    SUCCESS: 3000,
    ERROR: 5000,
    WARNING: 4000,
    INFO: 3000,
  },
  DEBOUNCE_DELAY: 300,
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
  },
} as const

// Validation Limits - Used for form validation and UI constraints
export const VALIDATION_LIMITS = {
  MESSAGE: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 5000,
  },
  SUBJECT: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 255,
  },
} as const
