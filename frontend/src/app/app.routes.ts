import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { AwaitingApprovalComponent } from './features/auth/awaiting-approval/awaiting-approval.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'awaiting-approval', component: AwaitingApprovalComponent }
];
