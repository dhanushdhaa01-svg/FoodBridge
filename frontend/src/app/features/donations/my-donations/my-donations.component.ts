import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { DonationService } from '../../../core/services/donation.service';
import { APP_ROUTES } from '../../../core/constants/app.routes';
import { Donation, DonationStatus, DonationListResponse } from '../../../core/models/donation.model';

@Component({
  selector: 'app-my-donations',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule
  ],
  templateUrl: './my-donations.component.html',
  styleUrl: './my-donations.component.scss'
})
export class MyDonationsComponent {
  private readonly donationService = inject(DonationService);

  readonly appRoutes = APP_ROUTES;

  readonly donations = signal<Donation[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly page = signal(1);
  readonly limit = signal(10);
  readonly total = signal(0);
  readonly totalPages = signal(0);
  readonly selectedStatus = signal<string>('');

  readonly statusOptions: { value: string; label: string }[] = [
    { value: '', label: 'All Statuses' },
    { value: 'available', label: 'Available' },
    { value: 'claimed', label: 'Claimed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'expired', label: 'Expired' }
  ];

  constructor() {
    this.loadDonations();
  }

  onStatusChange(): void {
    this.page.set(1);
    this.loadDonations();
  }

  onPageChange(newPage: number): void {
    this.page.set(newPage);
    this.loadDonations();
  }

  private loadDonations(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const filters: Record<string, string | number> = {};
    if (this.selectedStatus()) {
      filters['status'] = this.selectedStatus();
    }
    filters['page'] = this.page();
    filters['limit'] = this.limit();

    this.donationService.listMyDonations(filters).subscribe({
      next: (response: DonationListResponse) => {
        this.donations.set(response.data);
        this.total.set(response.pagination.total);
        this.totalPages.set(response.pagination.totalPages);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load donations. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  getStatusClass(status: DonationStatus): string {
    return `status-${status}`;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  formatTime(timeString: string): string {
    if (!timeString) return '-';
    return timeString;
  }

  get pages(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages(); i++) {
      pages.push(i);
    }
    return pages;
  }
}
