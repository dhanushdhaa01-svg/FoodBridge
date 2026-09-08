import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';

import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { NotificationService } from '../../core/services/notification.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly notification = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  readonly user = signal<User | null>(null);
  readonly isEditing = signal(false);
  readonly isSaving = signal(false);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  profileForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.loadProfile();
  }

  private initForm(): void {
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      organizationName: [''],
      address: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      city: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      state: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      pincode: ['', [Validators.required, Validators.pattern(/^[1-9][0-9]{5}$/)]]
    });
  }

  loadProfile(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.userService.getProfile().subscribe({
      next: (user) => {
        this.user.set(user);
        this.authService.setCurrentUser(user);
        this.populateForm(user);
        this.isLoading.set(false);
      },
      error: () => {
        // Fallback to authService currentUser if profile endpoint fails
        const currentUser = this.authService.currentUser();
        if (currentUser) {
          this.user.set(currentUser);
          this.populateForm(currentUser);
        } else {
          this.errorMessage.set('Failed to load profile details.');
        }
        this.isLoading.set(false);
      }
    });
  }

  private populateForm(user: User): void {
    this.profileForm.patchValue({
      fullName: user.fullName || '',
      phone: user.phone || '',
      organizationName: user.organizationName || '',
      address: user.address || '',
      city: user.city || '',
      state: user.state || '',
      pincode: user.pincode || ''
    });

    if (user.role === 'ngo') {
      this.profileForm.get('organizationName')?.setValidators([Validators.required, Validators.minLength(2)]);
    } else {
      this.profileForm.get('organizationName')?.clearValidators();
    }
    this.profileForm.get('organizationName')?.updateValueAndValidity();
  }

  toggleEdit(): void {
    if (this.isEditing()) {
      // Cancel edit - reset form to current user values
      if (this.user()) {
        this.populateForm(this.user()!);
      }
      this.isEditing.set(false);
      this.errorMessage.set(null);
    } else {
      this.isEditing.set(true);
    }
  }

  onSave(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    const updatePayload = { ...this.profileForm.value };

    this.userService.updateProfile(updatePayload).subscribe({
      next: (updatedUser) => {
        this.user.set(updatedUser);
        this.authService.setCurrentUser(updatedUser);
        this.isSaving.set(false);
        this.isEditing.set(false);
        this.notification.success('Profile updated successfully!');
      },
      error: (err) => {
        this.isSaving.set(false);
        const msg = err.error?.message || 'Failed to update profile. Please check your inputs.';
        this.errorMessage.set(msg);
        this.notification.error(msg);
      }
    });
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
}
