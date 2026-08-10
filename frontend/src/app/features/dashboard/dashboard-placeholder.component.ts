import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from '../../core/services/auth.service';
import { APP_ROUTES } from '../../core/constants/app.routes';

@Component({
  selector: 'app-dashboard-placeholder',
  standalone: true,
  templateUrl: './dashboard-placeholder.component.html',
  styleUrl: './dashboard-placeholder.component.scss',
  imports: [MatButtonModule]
})
export class DashboardPlaceholderComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  onLogout(): void {
    this.authService.logout();
    this.router.navigate([APP_ROUTES.LOGIN]);
  }
}
