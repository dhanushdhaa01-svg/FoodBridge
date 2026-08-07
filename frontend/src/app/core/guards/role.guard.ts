import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { APP_ROUTES } from '../constants/app.routes';

export const RoleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const allowedRoles: string[] = route.data['roles'] || [];

  if (allowedRoles.length === 0) {
    return true;
  }

  if (!authService.isAuthenticated()) {
    return router.createUrlTree([APP_ROUTES.LOGIN]);
  }

  const user = authService.currentUser();

  if (!user) {
    return router.createUrlTree([APP_ROUTES.LOGIN]);
  }

  return allowedRoles.includes(user.role) ? true : router.createUrlTree([APP_ROUTES.UNAUTHORIZED]);
};
