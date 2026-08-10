export const APP_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  AWAITING_APPROVAL: '/awaiting-approval',
  UNAUTHORIZED: '/unauthorized',
  DASHBOARD: '/dashboard'
} as const;

export type AppRoute = typeof APP_ROUTES[keyof typeof APP_ROUTES];

/**
 * Route documentation
 *
 * DASHBOARD: Primary authenticated route.
 *            Will be implemented after complete Angular Authentication Module is committed.
 */
