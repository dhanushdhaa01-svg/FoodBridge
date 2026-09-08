import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-ngo-approvals',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './ngo-approvals.component.html',
  styleUrl: './ngo-approvals.component.scss'
})
export class NgoApprovalsComponent {
  private readonly userService = inject(UserService);

  readonly pendingNgos = signal<User[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly approvingIds = signal<Set<string>>(new Set());

  constructor() {
    this.loadPendingNgos();
  }

  loadPendingNgos(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.userService.getPendingNgoApprovals().subscribe({
      next: (users) => {
        this.pendingNgos.set(users);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load pending NGO approvals. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  approveNgo(ngo: User): void {
    const currentApproving = new Set(this.approvingIds());
    currentApproving.add(ngo.id);
    this.approvingIds.set(currentApproving);

    this.userService.approveNgo(ngo.id).subscribe({
      next: () => {
        this.pendingNgos.update(ngos => ngos.filter(item => item.id !== ngo.id));
        this.approvingIds.update(current => {
          const next = new Set(current);
          next.delete(ngo.id);
          return next;
        });
      },
      error: () => {
        this.errorMessage.set(`Failed to approve ${ngo.fullName}. Please try again.`);
        this.approvingIds.update(current => {
          const next = new Set(current);
          next.delete(ngo.id);
          return next;
        });
      }
    });
  }

  isApproving(ngoId: string): boolean {
    return this.approvingIds().has(ngoId);
  }

  formatDate(date: Date | string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  getLocationText(ngo: User): string {
    const parts = [ngo.address, ngo.city, ngo.state, ngo.pincode].filter(Boolean);
    return parts.join(', ');
  }
}
