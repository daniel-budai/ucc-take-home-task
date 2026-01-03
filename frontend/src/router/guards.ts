import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

/**
 * Authentication guard
 * Checks if user is authenticated and has required role
 */
export function authGuard(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const auth = useAuthStore()

  // Initialize auth state from localStorage
  if (!auth.isAuthenticated) {
    auth.initialize()
  }

  // Check if route requires authentication
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }

  // Check if route requires agent role
  if (to.meta.requiresAgent && !auth.isAgent) {
    return next({ name: 'events' })
  }

  // Check if route is for guests only (login, reset password)
  if (to.meta.guest && auth.isAuthenticated) {
    return next({ name: 'events' })
  }

  next()
}






