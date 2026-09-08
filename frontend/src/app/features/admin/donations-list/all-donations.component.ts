import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { DonationService } from '../../../core/services/donation.service';
import { Donation, FoodType } from '../../../core/models/donation.model';

@Component({
  selector: 'app-all-donations',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './all-donations.component.html',
  styleUrl: './all-donations.component.scss'
})
export class AllDonationsComponent {
  private readonly donationService = inject(DonationService);

  readonly donations = signal<Donation[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  readonly statusFilter = signal<string>('all');
  readonly cityFilter = signal<string>('');
  readonly foodTypeFilter = signal<string>('all');

  readonly displayedColumns = ['foodName', 'foodType', 'quantity', 'city', 'status', 'createdAt', 'actions'];

  constructor() {
    this.loadDonations();
  }

  loadDonations(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const filters: { status?: string; city?: string; foodType?: string } = {};
    if (this.statusFilter() !== 'all') {
      filters.status = this.statusFilter();
    }
    if (this.cityFilter().trim()) {
      filters.city = this.cityFilter().trim();
    }
    if (this.foodTypeFilter() !== 'all') {
      filters.foodType = this.foodTypeFilter();
    }

    this.donationService.listAllDonations(filters).subscribe({
      next: (res) => {
        this.donations.set(res.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load donations list.');
        this.isLoading.set(false);
      }
    });
  }

  onFilterChange(): void {
    this.loadDonations();
  }

  onResetFilters(): void {
    this.statusFilter.set('all');
    this.cityFilter.set('');
    this.foodTypeFilter.set('all');
    this.loadDonations();
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
