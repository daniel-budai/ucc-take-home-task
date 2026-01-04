import { vi } from 'vitest'

export const mockEcho = {
  channel: vi.fn(() => ({
    listen: vi.fn(() => ({
      stop: vi.fn(),
    })),
    stopListening: vi.fn(),
  })),
  disconnect: vi.fn(),
  connector: {
    pusher: {
      disconnect: vi.fn(),
    },
  },
}

export function setupEchoMock() {
  return mockEcho
}

