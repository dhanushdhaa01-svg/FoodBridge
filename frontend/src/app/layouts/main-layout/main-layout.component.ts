import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { RouterModule } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';

import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { APP_ROUTES } from '../../core/constants/app.routes';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  roles: string[];
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatListModule,
    MatDividerModule
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly notification = inject(NotificationService);

  readonly appRoutes = APP_ROUTES;
  readonly isMobile = toSignal(
    this.breakpointObserver.observe(['(max-width: 767px)']).pipe(
      map(result => result.matches)
    ),
    { initialValue: false }
  );

  private readonly _sidenavOpened = signal(false);
  readonly sidenavOpened = computed(() => this._sidenavOpened());

  readonly user = this.authService.currentUser;

  private readonly navItems: NavItem[] = [
    { label: 'Dashboard', route: APP_ROUTES.DASHBOARD, icon: 'dashboard', roles: ['donor', 'ngo', 'admin'] }
  ];

  readonly visibleNavItems = computed(() => {
    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      return [];
    }
    return this.navItems.filter(item => item.roles.includes(currentUser.role));
  });

  constructor() {
    effect(() => {
      const mobile = this.isMobile();
      this._sidenavOpened.set(!mobile);
    });
  }

  toggleSidenav(): void {
    this._sidenavOpened.update(value => !value);
  }

  onLogout(): void {
    this.authService.logout();
    this.notification.info('You have been logged out.');
    this.router.navigate([APP_ROUTES.LOGIN]);
  }
}
