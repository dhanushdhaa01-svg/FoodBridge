import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../core/services/auth.service';
import { ProfileCardComponent } from './components/profile-card.component';
import { QuickActionsComponent } from './components/quick-actions.component';
import { EmptyStateComponent } from './components/empty-state.component';

@Component({
  selector: 'app-dashboard-container',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    ProfileCardComponent,
    QuickActionsComponent,
    EmptyStateComponent
  ],
  templateUrl: './dashboard-container.component.html',
  styleUrl: './dashboard-container.component.scss'
})
export class DashboardContainerComponent {
  private readonly authService = inject(AuthService);

  readonly user = this.authService.currentUser;
  readonly isAuthenticated = this.authService.isAuthenticated;

  readonly userName = computed(() => this.user()?.fullName ?? 'User');
  readonly userRole = computed(() => this.user()?.role ?? '');
}
