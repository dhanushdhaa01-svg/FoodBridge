import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { AwaitingApprovalComponent } from './features/auth/awaiting-approval/awaiting-approval.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { DashboardContainerComponent } from './features/dashboard/dashboard-container.component';
import { CreateDonationComponent } from './features/donations/create-donation/create-donation.component';
import { MyDonationsComponent } from './features/donations/my-donations/my-donations.component';
import { DonationListComponent } from './features/donations/donation-list/donation-list.component';
import { DonationDetailComponent } from './features/donations/donation-detail/donation-detail.component';
import { NgoApprovalsComponent } from './features/admin/ngo-approvals/ngo-approvals.component';
import { UsersListComponent } from './features/admin/users-list/users-list.component';
import { AllDonationsComponent } from './features/admin/donations-list/all-donations.component';
import { MyClaimsComponent } from './features/donations/my-claims/my-claims.component';
import { ProfileComponent } from './features/profile/profile.component';
import { UnauthorizedComponent } from './shared/pages/unauthorized.component';
import { NotFoundComponent } from './shared/pages/not-found.component';

import { RootGuard } from './core/guards/root.guard';
import { PublicGuard } from './core/guards/public.guard';
import { AwaitingApprovalGuard } from './core/guards/awaiting-approval.guard';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { APP_ROUTES } from './core/constants/app.routes';

const ROUTE_SEGMENTS = {
  LOGIN: 'login',
  REGISTER: 'register',
  AWAITING_APPROVAL: 'awaiting-approval',
  DASHBOARD: 'dashboard',
  UNAUTHORIZED: 'unauthorized',
  DONATIONS: 'donations',
  DONATIONS_MY: 'donations/my',
  DONATION_CREATE: 'donations/create',
  DONATION_DETAIL: 'donations/:id',
  DONATIONS_CLAIMS: 'donations/my-claims',
  PROFILE: 'profile',
  ADMIN_NGO_APPROVALS: 'admin/ngo-approvals',
  ADMIN_USERS: 'admin/users',
  ADMIN_DONATIONS: 'admin/donations'
} as const;

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [RootGuard],
    children: [
      { path: '', component: DashboardContainerComponent },
      { path: ROUTE_SEGMENTS.DASHBOARD, component: DashboardContainerComponent },
      {
        path: ROUTE_SEGMENTS.DONATION_CREATE,
        canActivate: [RoleGuard],
        data: { roles: ['donor'] },
        component: CreateDonationComponent
      },
      {
        path: ROUTE_SEGMENTS.DONATIONS_MY,
        canActivate: [RoleGuard],
        data: { roles: ['donor'] },
        component: MyDonationsComponent
      },
      {
        path: ROUTE_SEGMENTS.DONATIONS,
        canActivate: [RoleGuard],
        data: { roles: ['ngo'] },
        component: DonationListComponent
      },
      {
        path: ROUTE_SEGMENTS.DONATIONS_CLAIMS,
        canActivate: [RoleGuard],
        data: { roles: ['ngo'] },
        component: MyClaimsComponent
      },
      {
        path: ROUTE_SEGMENTS.DONATION_DETAIL,
        component: DonationDetailComponent
      },
      {
        path: ROUTE_SEGMENTS.ADMIN_NGO_APPROVALS,
        canActivate: [RoleGuard],
        data: { roles: ['admin'] },
        component: NgoApprovalsComponent
      },
      {
        path: ROUTE_SEGMENTS.ADMIN_USERS,
        canActivate: [RoleGuard],
        data: { roles: ['admin'] },
        component: UsersListComponent
      },
      {
        path: ROUTE_SEGMENTS.ADMIN_DONATIONS,
        canActivate: [RoleGuard],
        data: { roles: ['admin'] },
        component: AllDonationsComponent
      },
      {
        path: ROUTE_SEGMENTS.PROFILE,
        component: ProfileComponent
      },
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
