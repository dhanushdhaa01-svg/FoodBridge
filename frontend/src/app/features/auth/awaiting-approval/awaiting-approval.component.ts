import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { APP_ROUTES } from '../../../core/constants/app.routes';

@Component({
  selector: 'app-awaiting-approval',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './awaiting-approval.component.html',
  styleUrl: './awaiting-approval.component.scss'
})
export class AwaitingApprovalComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly notification = inject(NotificationService);

  readonly isRefreshing = signal(false);

  onLogout(): void {
    this.authService.logout();
    this.notification.info('You have been logged out.');
    this.router.navigate([APP_ROUTES.LOGIN]);
  }

  refreshStatus(): void {
    this.isRefreshing.set(true);

    this.authService.hydrateCurrentUser().subscribe({
      next: (user) => {
        this.isRefreshing.set(false);
        if (user && user.role === 'ngo' && user.isApproved) {
          this.notification.success('Your account has been approved!');
          this.router.navigate([APP_ROUTES.DASHBOARD]);
        } else if (!this.authService.isAuthenticated()) {
          this.notification.error('Your session has expired. Please login again.');
          this.router.navigate([APP_ROUTES.LOGIN]);
        } else {
          this.notification.info('Your account is still pending approval.');
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isRefreshing.set(false);
        this.notification.handleHttpError(err);
      }
    });
  }
}
