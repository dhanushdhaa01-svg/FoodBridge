import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { APP_ROUTES } from '../../../core/constants/app.routes';
import { User } from '../../../core/models/user.model';
import { RegisterRequest } from '../../../core/models/register-request.model';
import { AuthResponse } from '../../../core/models/auth-response.model';

const indianPhonePattern = /^[6-9]\d{9}$/;
const indianPincodePattern = /^[1-9][0-9]{5}$/;

const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password && confirmPassword && password !== confirmPassword ? { passwordMismatch: true } : null;
};

@Component({
  selector: 'app-register',
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
    MatProgressSpinnerModule,
    MatSelectModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly notification = inject(NotificationService);

  readonly appRoutes = APP_ROUTES;

  readonly registerForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
    phone: ['', [Validators.required, Validators.pattern(indianPhonePattern)]],
    role: ['', [Validators.required]],
    organizationName: ['', []],
    address: ['', [Validators.required]],
    city: ['', [Validators.required]],
    state: ['', [Validators.required]],
    pincode: ['', [Validators.required, Validators.pattern(indianPincodePattern)]]
  }, { validators: passwordMatchValidator });

  readonly isSubmitting = signal(false);
  readonly hidePassword = signal(true);
  readonly hideConfirmPassword = signal(true);

  constructor() {
    this.registerForm.get('role')?.valueChanges.subscribe(role => {
      const orgControl = this.registerForm.get('organizationName');
      if (role === 'ngo') {
        orgControl?.setValidators([Validators.required]);
      } else {
        orgControl?.clearValidators();
        orgControl?.setValue('');
      }
      orgControl?.updateValueAndValidity();
    });
  }

  get fullName() { return this.registerForm.get('fullName'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
  get phone() { return this.registerForm.get('phone'); }
  get role() { return this.registerForm.get('role'); }
  get organizationName() { return this.registerForm.get('organizationName'); }
  get address() { return this.registerForm.get('address'); }
  get city() { return this.registerForm.get('city'); }
  get state() { return this.registerForm.get('state'); }
  get pincode() { return this.registerForm.get('pincode'); }

  togglePasswordVisibility(): void {
    this.hidePassword.update(value => !value);
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword.update(value => !value);
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const data: RegisterRequest = {
      fullName: this.registerForm.value.fullName.trim(),
      email: this.registerForm.value.email.trim().toLowerCase(),
      password: this.registerForm.value.password,
      phone: this.registerForm.value.phone.trim(),
      role: this.registerForm.value.role,
      address: this.registerForm.value.address.trim(),
      city: this.registerForm.value.city.trim(),
      state: this.registerForm.value.state.trim(),
      pincode: this.registerForm.value.pincode.trim(),
      ...(this.registerForm.value.role === 'ngo' && { organizationName: this.registerForm.value.organizationName.trim() })
    };

    this.authService.register(data).subscribe({
      next: (response: AuthResponse) => {
        this.notification.success(response.message || 'Account created successfully!');
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
