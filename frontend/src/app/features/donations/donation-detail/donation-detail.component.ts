import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { HttpErrorResponse } from '@angular/common/http';

import { DonationService } from '../../../core/services/donation.service';
import { AuthService } from '../../../core/services/auth.service';
import { APP_ROUTES } from '../../../core/constants/app.routes';
import { Donation, DonationStatus } from '../../../core/models/donation.model';

@Component({
  selector: 'app-donation-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatBadgeModule
  ],
  templateUrl: './donation-detail.component.html',
  styleUrl: './donation-detail.component.scss'
})
export class DonationDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly donationService = inject(DonationService);
  private readonly authService = inject(AuthService);

  readonly appRoutes = APP_ROUTES;

  readonly donation = signal<Donation | null>(null);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly isCancelling = signal(false);
  readonly isClaiming = signal(false);
  readonly isCancellingClaim = signal(false);
  readonly isCompleting = signal(false);

  readonly currentUserRole = computed(() => this.authService.currentUser()?.role ?? null);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadDonation(id);
    } else {
      this.errorMessage.set('Invalid donation ID.');
      this.isLoading.set(false);
    }
  }

  getStatusClass(status: DonationStatus): string {
    return `status-${status}`;
  }

  onCancelDonation(): void {
    if (!this.donation() || !confirm('Are you sure you want to cancel this donation?')) {
      return;
    }

    this.isCancelling.set(true);
    this.errorMessage.set(null);

    this.donationService.cancelDonation(this.donation()!.id).subscribe({
      next: (updated) => {
        this.donation.set(updated);
        this.isCancelling.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.isCancelling.set(false);
        if (err.error?.message) {
          this.errorMessage.set(err.error.message);
        } else {
          this.errorMessage.set('Failed to cancel donation. Please try again.');
        }
      }
    });
  }

  onClaimDonation(): void {
    if (!this.donation() || !confirm('Are you sure you want to claim this donation?')) {
      return;
    }

    this.isClaiming.set(true);
    this.errorMessage.set(null);

    this.donationService.claimDonation(this.donation()!.id).subscribe({
      next: (updated) => {
        this.donation.set(updated);
        this.isClaiming.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.isClaiming.set(false);
        if (err.error?.message) {
          this.errorMessage.set(err.error.message);
        } else {
          this.errorMessage.set('Failed to claim donation. Please try again.');
        }
      }
    });
  }

  onCancelClaim(): void {
    if (!this.donation() || !confirm('Are you sure you want to cancel your claim?')) {
      return;
    }

    this.isCancellingClaim.set(true);
    this.errorMessage.set(null);

    this.donationService.cancelClaim(this.donation()!.id).subscribe({
      next: (updated) => {
        this.donation.set(updated);
        this.isCancellingClaim.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.isCancellingClaim.set(false);
        if (err.error?.message) {
          this.errorMessage.set(err.error.message);
        } else {
          this.errorMessage.set('Failed to cancel claim. Please try again.');
        }
      }
    });
  }

  onCompleteDonation(): void {
    if (!this.donation() || !confirm('Mark this donation as completed?')) {
      return;
    }

    this.isCompleting.set(true);
    this.errorMessage.set(null);

    this.donationService.completeDonation(this.donation()!.id).subscribe({
      next: (updated) => {
        this.donation.set(updated);
        this.isCompleting.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.isCompleting.set(false);
        if (err.error?.message) {
          this.errorMessage.set(err.error.message);
        } else {
          this.errorMessage.set('Failed to complete donation. Please try again.');
        }
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  formatTime(timeString: string): string {
    if (!timeString) return '-';
    return timeString;
  }

  private loadDonation(id: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.donationService.getDonationById(id).subscribe({
      next: (donation) => {
        this.donation.set(donation);
        this.isLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        if (err.status === 404) {
          this.errorMessage.set('Donation not found.');
        } else if (err.status === 403) {
          this.errorMessage.set('You are not authorized to view this donation.');
        } else {
          this.errorMessage.set('Failed to load donation. Please try again.');
        }
      }
    });
  }
}
