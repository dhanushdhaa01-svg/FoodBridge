import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from '../../core/services/auth.service';
import { APP_ROUTES } from '../../core/constants/app.routes';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  imports: [CommonModule, RouterModule, MatButtonModule]
})
export class DashboardComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly appRoutes = APP_ROUTES;

  onLogout(): void {
    this.authService.logout();
    this.router.navigate([APP_ROUTES.LOGIN]);
  }
}
