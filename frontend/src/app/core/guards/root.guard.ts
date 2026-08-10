import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { APP_ROUTES } from '../constants/app.routes';

export const RootGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree([APP_ROUTES.LOGIN]);
  }

  const user = authService.currentUser();

  if (!user) {
    return router.createUrlTree([APP_ROUTES.LOGIN]);
  }

  if (user.role === 'ngo' && !user.isApproved) {
    return router.createUrlTree([APP_ROUTES.AWAITING_APPROVAL]);
  }

  return router.createUrlTree([APP_ROUTES.DASHBOARD]);
};
