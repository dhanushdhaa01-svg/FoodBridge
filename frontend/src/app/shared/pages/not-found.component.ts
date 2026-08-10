import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from '../../core/services/auth.service';
import { APP_ROUTES } from '../../core/constants/app.routes';

@Component({
  selector: 'app-not-found',
  standalone: true,
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
  imports: [CommonModule, RouterModule, MatButtonModule]
})
export class NotFoundComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly appRoutes = APP_ROUTES;
  readonly isAuthenticated = this.authService.isAuthenticated;

  goToLogin(): void {
    this.router.navigate([APP_ROUTES.LOGIN]);
  }

  goToDashboard(): void {
    this.router.navigate([APP_ROUTES.DASHBOARD]);
  }
}
