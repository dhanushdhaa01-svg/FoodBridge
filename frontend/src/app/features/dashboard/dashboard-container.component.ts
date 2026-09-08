import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from '../../core/services/auth.service';
import { DashboardService, DashboardStatsResponse } from '../../core/services/dashboard.service';
import { APP_ROUTES } from '../../core/constants/app.routes';
import { ProfileCardComponent } from './components/profile-card.component';
import { QuickActionsComponent } from './components/quick-actions.component';
import { EmptyStateComponent } from './components/empty-state.component';
import { NgoApprovalsComponent } from '../admin/ngo-approvals/ngo-approvals.component';

@Component({
  selector: 'app-dashboard-container',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatProgressSpinnerModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    ProfileCardComponent,
    QuickActionsComponent,
    EmptyStateComponent,
    NgoApprovalsComponent
  ],
  templateUrl: './dashboard-container.component.html',
  styleUrl: './dashboard-container.component.scss'
})
export class DashboardContainerComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly dashboardService = inject(DashboardService);

  readonly appRoutes = APP_ROUTES;

  readonly user = this.authService.currentUser;
  readonly isAuthenticated = this.authService.isAuthenticated;

  readonly userName = computed(() => this.user()?.fullName ?? 'User');
  readonly userRole = computed(() => this.user()?.role ?? '');

  readonly dashboardData = signal<DashboardStatsResponse | null>(null);
  readonly isLoadingStats = signal(true);
  readonly statsError = signal<string | null>(null);

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.isLoadingStats.set(true);
    this.statsError.set(null);

    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.dashboardData.set(data);
        this.isLoadingStats.set(false);
      },
      error: () => {
        this.statsError.set('Unable to load live statistics.');
        this.isLoadingStats.set(false);
      }
    });
  }

  formatDate(dateStr?: string | Date): string {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
}
