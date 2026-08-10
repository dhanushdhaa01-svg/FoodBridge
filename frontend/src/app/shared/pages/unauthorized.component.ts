import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { APP_ROUTES } from '../../core/constants/app.routes';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  templateUrl: './unauthorized.component.html',
  styleUrl: './unauthorized.component.scss',
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule]
})
export class UnauthorizedComponent {
  private readonly router = inject(Router);

  readonly appRoutes = APP_ROUTES;

  goBack(): void {
    this.router.navigate([APP_ROUTES.DASHBOARD]);
  }
}
