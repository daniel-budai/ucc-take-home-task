import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

declare global {
  interface Window {
    Pusher: typeof Pusher
    Echo: Echo<'reverb'>
  }
}

// Enable Pusher logging for debugging
Pusher.logToConsole = true

window.Pusher = Pusher

let echoInstance: Echo<'reverb'> | null = null

export function getEcho(): Echo<'reverb'> {
  if (echoInstance) {
    return echoInstance
  }

  const token = localStorage.getItem('token')
  
  const config = {
    broadcaster: 'reverb' as const,
    key: import.meta.env.VITE_REVERB_APP_KEY || 'app-key',
    wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
    wsPort: Number(import.meta.env.VITE_REVERB_PORT) || 8080,
    wssPort: Number(import.meta.env.VITE_REVERB_PORT) || 8080,
    forceTLS: false,
    enabledTransports: ['ws', 'wss'] as ('ws' | 'wss')[],
    authEndpoint: `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    },
  }
  
  console.log('[Echo] Initializing with config:', {
    key: config.key,
    wsHost: config.wsHost,
    wsPort: config.wsPort,
    authEndpoint: config.authEndpoint,
    hasToken: !!token,
  })

  echoInstance = new Echo(config)

  return echoInstance
}

export function resetEcho(): void {
  if (echoInstance) {
    echoInstance.disconnect()
    echoInstance = null
  }
}

// Update auth token when it changes
export function updateEchoAuth(): void {
  resetEcho()
  // Will be recreated with new token on next getEcho() call
}

