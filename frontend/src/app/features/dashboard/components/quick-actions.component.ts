import { Component, inject, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface Action {
  label: string;
  icon: string;
}

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './quick-actions.component.html',
  styleUrl: './quick-actions.component.scss'
})
export class QuickActionsComponent {
  private readonly _role = signal<string>('');

  @Input() set role(value: string) {
    this._role.set(value);
  }

  readonly actions = computed<Action[]>(() => {
    switch (this._role()) {
      case 'donor':
        return [
          { label: 'Create Donation', icon: 'add_circle' },
        ];
      case 'ngo':
        return [
          { label: 'Browse Donations', icon: 'search' },
        ];
      case 'admin':
        return [
          { label: 'Manage Users', icon: 'people' },
        ];
      default:
        return [];
    }
  });
}
