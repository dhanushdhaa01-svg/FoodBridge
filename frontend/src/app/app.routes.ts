import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { AwaitingApprovalComponent } from './features/auth/awaiting-approval/awaiting-approval.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { DashboardContainerComponent } from './features/dashboard/dashboard-container.component';
import { UnauthorizedComponent } from './shared/pages/unauthorized.component';
import { NotFoundComponent } from './shared/pages/not-found.component';

import { RootGuard } from './core/guards/root.guard';
import { PublicGuard } from './core/guards/public.guard';
import { AwaitingApprovalGuard } from './core/guards/awaiting-approval.guard';
import { AuthGuard } from './core/guards/auth.guard';
import { APP_ROUTES } from './core/constants/app.routes';

const ROUTE_SEGMENTS = {
  LOGIN: 'login',
  REGISTER: 'register',
  AWAITING_APPROVAL: 'awaiting-approval',
  DASHBOARD: 'dashboard',
  UNAUTHORIZED: 'unauthorized'
} as const;

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [RootGuard],
    children: [
      { path: '', component: DashboardContainerComponent },
      { path: ROUTE_SEGMENTS.DASHBOARD, component: DashboardContainerComponent },
      { path: ROUTE_SEGMENTS.UNAUTHORIZED, component: UnauthorizedComponent }
    ]
  },
  {
    path: ROUTE_SEGMENTS.LOGIN,
    canActivate: [PublicGuard],
    component: LoginComponent
  },
  {
    path: ROUTE_SEGMENTS.REGISTER,
    canActivate: [PublicGuard],
    component: RegisterComponent
  },
  {
    path: ROUTE_SEGMENTS.AWAITING_APPROVAL,
    canActivate: [AwaitingApprovalGuard],
    component: AwaitingApprovalComponent
  },
  {
    path: '**',
    component: NotFoundComponent
  }
];
