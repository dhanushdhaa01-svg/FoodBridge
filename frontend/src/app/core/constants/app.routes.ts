export const APP_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  AWAITING_APPROVAL: '/awaiting-approval',
  UNAUTHORIZED: '/unauthorized',
  DASHBOARD: '/dashboard',
  DONATIONS: '/donations',
  DONATIONS_MY: '/donations/my',
  DONATION_CREATE: '/donations/create',
  DONATION_DETAIL: '/donations',
  DONATIONS_CLAIMS: '/donations/my-claims',
  PROFILE: '/profile',
  ADMIN_NGO_APPROVALS: '/admin/ngo-approvals',
  ADMIN_USERS: '/admin/users',
  ADMIN_DONATIONS: '/admin/donations'
} as const;

export type AppRoute = typeof APP_ROUTES[keyof typeof APP_ROUTES];

/**
 * Route documentation
 *
 * DASHBOARD: Primary authenticated route.
 *            Will be implemented after complete Angular Authentication Module is committed.
 */
