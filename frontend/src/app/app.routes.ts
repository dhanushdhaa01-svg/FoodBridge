import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { AwaitingApprovalComponent } from './features/auth/awaiting-approval/awaiting-approval.component';
import { DashboardPlaceholderComponent } from './features/dashboard/dashboard-placeholder.component';

import { RootGuard } from './core/guards/root.guard';
import { PublicGuard } from './core/guards/public.guard';
import { AwaitingApprovalGuard } from './core/guards/awaiting-approval.guard';
import { AuthGuard } from './core/guards/auth.guard';
import { APP_ROUTES } from './core/constants/app.routes';

export const routes: Routes = [
  {
    path: '',
    canActivate: [RootGuard]
  },
  {
    path: APP_ROUTES.LOGIN,
    canActivate: [PublicGuard],
    component: LoginComponent
  },
  {
    path: APP_ROUTES.REGISTER,
    canActivate: [PublicGuard],
    component: RegisterComponent
  },
  {
    path: APP_ROUTES.AWAITING_APPROVAL,
    canActivate: [AwaitingApprovalGuard],
    component: AwaitingApprovalComponent
  },
  {
    path: APP_ROUTES.DASHBOARD,
    canActivate: [AuthGuard],
    component: DashboardPlaceholderComponent
  },
  {
    path: '**',
    redirectTo: APP_ROUTES.LOGIN
  }
];
