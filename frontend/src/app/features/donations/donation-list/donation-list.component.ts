import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { DonationService } from '../../../core/services/donation.service';
import { APP_ROUTES } from '../../../core/constants/app.routes';
import { Donation, DonationListResponse, FoodType, QuantityUnit } from '../../../core/models/donation.model';

@Component({
  selector: 'app-donation-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule
  ],
  templateUrl: './donation-list.component.html',
  styleUrl: './donation-list.component.scss'
})
export class DonationListComponent implements OnInit {
  private readonly donationService = inject(DonationService);

  readonly appRoutes = APP_ROUTES;

  readonly donations = signal<Donation[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly page = signal(1);
  readonly limit = signal(10);
  readonly total = signal(0);
  readonly totalPages = signal(0);

  readonly cityFilter = signal('');
  readonly foodTypeFilter = signal<string | null>(null);
  readonly quantityUnitFilter = signal<string | null>(null);

  readonly foodTypeOptions: { value: FoodType; label: string }[] = [
    { value: 'veg', label: 'Vegetarian' },
    { value: 'non-veg', label: 'Non-Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'jain', label: 'Jain' },
    { value: 'eggetarian', label: 'Eggetarian' }
  ];

  readonly quantityUnitOptions: { value: QuantityUnit; label: string }[] = [
    { value: 'meals', label: 'Meals' },
    { value: 'kg', label: 'Kilograms' },
    { value: 'litres', label: 'Litres' },
    { value: 'packets', label: 'Packets' },
    { value: 'pieces', label: 'Pieces' }
  ];

  ngOnInit(): void {
    this.loadDonations();
  }

  onApplyFilters(): void {
    this.page.set(1);
    this.loadDonations();
  }

  onClearFilters(): void {
    this.cityFilter.set('');
    this.foodTypeFilter.set(null);
    this.quantityUnitFilter.set(null);
    this.page.set(1);
    this.loadDonations();
  }

  onPageChange(newPage: number): void {
    this.page.set(newPage);
    this.loadDonations();
  }

  loadDonations(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const filters: Record<string, string | number> = {};
    if (this.cityFilter().trim()) {
      filters['city'] = this.cityFilter().trim();
    }
    if (this.foodTypeFilter() && this.foodTypeFilter() !== '') {
      filters['foodType'] = this.foodTypeFilter()!;
    }
    if (this.quantityUnitFilter() && this.quantityUnitFilter() !== '') {
      filters['quantityUnit'] = this.quantityUnitFilter()!;
    }
    filters['page'] = this.page();
    filters['limit'] = this.limit();

    this.donationService.listAvailableDonations(filters).subscribe({
      next: (response: DonationListResponse) => {
        this.donations.set(response.data);
        this.total.set(response.pagination?.total ?? 0);
        this.totalPages.set(response.pagination?.totalPages ?? 0);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load available donations. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  getStatusClass(status: string): string {
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
