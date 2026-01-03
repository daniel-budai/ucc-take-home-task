import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from '@/router/guards'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Auth routes (guest only)
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/auth/LoginPage.vue'),
      meta: { guest: true },
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('@/pages/auth/ResetPasswordPage.vue'),
      meta: { guest: true },
    },

    // Redirect root to events
    {
      path: '/',
      redirect: '/events',
    },

    // Protected routes
    {
      path: '/events',
      name: 'events',
      component: () => import('@/pages/events/EventsPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/chat',
      name: 'chat',
      component: () => import('@/pages/helpdesk/ChatPage.vue'),
      meta: { requiresAuth: true },
    },

    // Agent-only route
    {
      path: '/agent',
      name: 'agent-dashboard',
      component: () => import('@/pages/helpdesk/AgentDashboard.vue'),
      meta: { requiresAuth: true, requiresAgent: true },
    },

    // 404 fallback
    {
      path: '/:pathMatch(.*)*',
      redirect: '/events',
    },
  ],
})

// Apply auth guard to all routes
router.beforeEach(authGuard)

export default router






