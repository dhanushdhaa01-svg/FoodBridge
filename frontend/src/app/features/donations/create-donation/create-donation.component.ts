import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { HttpErrorResponse } from '@angular/common/http';

import { DonationService } from '../../../core/services/donation.service';
import { APP_ROUTES } from '../../../core/constants/app.routes';
import { CreateDonationPayload, FoodType, QuantityUnit } from '../../../core/models/donation.model';

const foodTypeOptions: { value: FoodType; label: string }[] = [
  { value: 'veg', label: 'Vegetarian' },
  { value: 'non-veg', label: 'Non-Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'jain', label: 'Jain' },
  { value: 'eggetarian', label: 'Eggetarian' }
];

const quantityUnitOptions: { value: QuantityUnit; label: string }[] = [
  { value: 'meals', label: 'Meals' },
  { value: 'kg', label: 'Kilograms' },
  { value: 'litres', label: 'Litres' },
  { value: 'packets', label: 'Packets' },
  { value: 'pieces', label: 'Pieces' }
];

@Component({
  selector: 'app-create-donation',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule
  ],
  templateUrl: './create-donation.component.html',
  styleUrl: './create-donation.component.scss'
})
export class CreateDonationComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly donationService = inject(DonationService);

  readonly appRoutes = APP_ROUTES;

  readonly donationForm: FormGroup = this.fb.group({
    foodName: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.required, Validators.maxLength(500)]],
    foodType: ['', Validators.required],
    quantity: ['', [Validators.required, Validators.min(1), Validators.max(10000)]],
    quantityUnit: ['', Validators.required],
    date: ['', Validators.required],
    phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
    address: ['', [Validators.required, Validators.maxLength(200)]],
    city: ['', Validators.required]
  });

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  get foodName() { return this.donationForm.get('foodName'); }
  get description() { return this.donationForm.get('description'); }
  get foodType() { return this.donationForm.get('foodType'); }
  get quantity() { return this.donationForm.get('quantity'); }
  get quantityUnit() { return this.donationForm.get('quantityUnit'); }
  get date() { return this.donationForm.get('date'); }
  get phone() { return this.donationForm.get('phone'); }
  get address() { return this.donationForm.get('address'); }
  get city() { return this.donationForm.get('city'); }

  readonly foodTypeOptions = foodTypeOptions;
  readonly quantityUnitOptions = quantityUnitOptions;

  onSubmit(): void {
    if (this.donationForm.invalid) {
      this.donationForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const formValue = this.donationForm.value;

    const payload: CreateDonationPayload = {
      foodName: formValue.foodName.trim(),
      description: formValue.description.trim(),
      foodType: formValue.foodType,
      quantity: formValue.quantity,
      quantityUnit: formValue.quantityUnit,
      date: formValue.date,
      phone: formValue.phone.trim(),
      address: formValue.address.trim(),
      city: formValue.city.trim()
    };

    this.donationService.createDonation(payload).subscribe({
      next: (donation) => {
        this.router.navigate([`${APP_ROUTES.DONATIONS}/${donation.id}`]);
      },
      error: (err: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        if (err.error?.message) {
          this.errorMessage.set(err.error.message);
        } else {
          this.errorMessage.set('Failed to create donation. Please try again.');
        }
      },
      complete: () => {
        this.isSubmitting.set(false);
      }
    });
  }
}
