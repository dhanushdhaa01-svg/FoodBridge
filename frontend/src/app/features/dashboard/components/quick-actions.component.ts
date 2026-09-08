import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { APP_ROUTES } from '../../../core/constants/app.routes';

interface Action {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule],
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
          { label: 'Create Donation', icon: 'add_circle', route: APP_ROUTES.DONATION_CREATE },
          { label: 'My Donations', icon: 'volunteer_activism', route: APP_ROUTES.DONATIONS_MY },
          { label: 'My Profile', icon: 'person', route: APP_ROUTES.PROFILE }
        ];
      case 'ngo':
        return [
          { label: 'Browse Donations', icon: 'search', route: APP_ROUTES.DONATIONS },
          { label: 'My Claims', icon: 'handshake', route: APP_ROUTES.DONATIONS_CLAIMS },
          { label: 'My Profile', icon: 'person', route: APP_ROUTES.PROFILE }
        ];
      case 'admin':
        return [
          { label: 'Review NGO Approvals', icon: 'verified_user', route: APP_ROUTES.ADMIN_NGO_APPROVALS },
          { label: 'Manage Users', icon: 'group', route: APP_ROUTES.ADMIN_USERS },
          { label: 'All Donations', icon: 'list_alt', route: APP_ROUTES.ADMIN_DONATIONS },
          { label: 'My Profile', icon: 'person', route: APP_ROUTES.PROFILE }
        ];
      default:
        return [];
    }
  });
}
