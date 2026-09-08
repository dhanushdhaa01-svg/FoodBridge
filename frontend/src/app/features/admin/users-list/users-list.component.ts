import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';

import { UserService } from '../../../core/services/user.service';
import { NotificationService } from '../../../core/services/notification.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss'
})
export class UsersListComponent {
  private readonly userService = inject(UserService);
  private readonly notification = inject(NotificationService);

  readonly users = signal<User[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly roleFilter = signal<string>('all');
  readonly searchQuery = signal<string>('');
  readonly approvingUserId = signal<string | null>(null);

  readonly displayedColumns = ['name', 'email', 'role', 'status', 'city', 'joined', 'actions'];

  constructor() {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const filters: { role?: string; search?: string } = {};
    if (this.roleFilter() !== 'all') {
      filters.role = this.roleFilter();
    }
    if (this.searchQuery().trim()) {
      filters.search = this.searchQuery().trim();
    }

    this.userService.getAllUsers(filters).subscribe({
      next: (res) => {
        this.users.set(res.users);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load users list.');
        this.isLoading.set(false);
      }
    });
  }

  onRoleChange(role: string): void {
    this.roleFilter.set(role);
    this.loadUsers();
  }

  onSearch(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.searchQuery.set(val);
    this.loadUsers();
  }

  onApproveNgo(user: User): void {
    if (!confirm(`Are you sure you want to approve NGO "${user.organizationName || user.fullName}"?`)) {
      return;
    }

    this.approvingUserId.set(user.id);

    this.userService.approveNgo(user.id).subscribe({
      next: (approved) => {
        this.approvingUserId.set(null);
        this.notification.success(`NGO "${approved.organizationName || approved.fullName}" has been approved!`);
        this.users.update(list => list.map(u => u.id === approved.id ? { ...u, isApproved: true } : u));
      },
      error: (err) => {
        this.approvingUserId.set(null);
        this.notification.error(err.error?.message || 'Failed to approve NGO.');
      }
    });
  }

  formatDate(dateStr?: Date | string): string {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
}
