import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { APP_ROUTES } from '../../../core/constants/app.routes';
import { User } from '../../../core/models/user.model';
import { AuthResponse } from '../../../core/models/auth-response.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly notification = inject(NotificationService);

  readonly appRoutes = APP_ROUTES;

  readonly loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  readonly isSubmitting = signal(false);
  readonly hidePassword = signal(true);

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  togglePasswordVisibility(): void {
    this.hidePassword.update(value => !value);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    this.authService.login(this.loginForm.value).subscribe({
      next: (response: AuthResponse) => {
        this.notification.success(response.message || 'Logged in successfully!');
        this.navigateBasedOnRole(response.data.user);
      },
      error: (err: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        this.notification.handleHttpError(err);
      },
      complete: () => {
        this.isSubmitting.set(false);
      }
    });
  }

  private navigateBasedOnRole(user: User): void {
    if (user.role === 'donor') {
      this.router.navigate([APP_ROUTES.DASHBOARD]);
    } else if (user.role === 'ngo') {
      if (user.isApproved) {
        this.router.navigate([APP_ROUTES.DASHBOARD]);
      } else {
        this.router.navigate([APP_ROUTES.AWAITING_APPROVAL]);
      }
    } else if (user.role === 'admin') {
      this.router.navigate([APP_ROUTES.DASHBOARD]);
    } else {
      this.router.navigate([APP_ROUTES.HOME]);
    }
  }
}
