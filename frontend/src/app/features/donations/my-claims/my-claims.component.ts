import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { DonationService } from '../../../core/services/donation.service';
import { NotificationService } from '../../../core/services/notification.service';
import { APP_ROUTES } from '../../../core/constants/app.routes';
import { Donation } from '../../../core/models/donation.model';

@Component({
  selector: 'app-my-claims',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatButtonToggleModule
  ],
  templateUrl: './my-claims.component.html',
  styleUrl: './my-claims.component.scss'
})
export class MyClaimsComponent {
  private readonly donationService = inject(DonationService);
  private readonly notification = inject(NotificationService);

  readonly appRoutes = APP_ROUTES;

  readonly claims = signal<Donation[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly statusFilter = signal<string>('all');
  readonly actionInProgressId = signal<string | null>(null);

  constructor() {
    this.loadClaims();
  }

  loadClaims(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const filters: { status?: string } = {};
    if (this.statusFilter() !== 'all') {
      filters.status = this.statusFilter();
    }

    this.donationService.listMyClaims(filters).subscribe({
      next: (res) => {
        this.claims.set(res.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load your claimed donations.');
        this.isLoading.set(false);
      }
    });
  }

  onFilterChange(status: string): void {
    this.statusFilter.set(status);
    this.loadClaims();
  }

  onComplete(donation: Donation): void {
    if (!confirm(`Confirm that you have collected and distributed "${donation.foodName}"?`)) {
      return;
    }

    this.actionInProgressId.set(donation.id);

    this.donationService.completeDonation(donation.id).subscribe({
      next: (updated) => {
        this.actionInProgressId.set(null);
        this.notification.success('Donation marked as successfully completed!');
        this.claims.update(list => list.map(d => d.id === updated.id ? updated : d));
      },
      error: (err) => {
        this.actionInProgressId.set(null);
        this.notification.error(err.error?.message || 'Failed to complete donation.');
      }
    });
  }

  onCancelClaim(donation: Donation): void {
    if (!confirm(`Are you sure you want to cancel your claim on "${donation.foodName}"? It will become available to other NGOs.`)) {
      return;
    }

    this.actionInProgressId.set(donation.id);

    this.donationService.cancelClaim(donation.id).subscribe({
      next: () => {
        this.actionInProgressId.set(null);
        this.notification.info('Claim cancelled. Food returned to available pool.');
        // Remove from list or refresh
        this.loadClaims();
      },
      error: (err) => {
        this.actionInProgressId.set(null);
        this.notification.error(err.error?.message || 'Failed to cancel claim.');
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
