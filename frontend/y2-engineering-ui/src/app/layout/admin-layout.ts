import { Component, OnInit } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatListItem, MatNavList } from '@angular/material/list';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { MatToolbar } from '@angular/material/toolbar';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { NotificationService } from '../core/notification.service';
import { Language, TranslationService } from '../core/translation.service';
import { ThemeService } from '../core/theme.service';
import { LogoComponent } from '../shared/components/logo';
import { TranslatePipe } from '../shared/pipes/translate.pipe';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, MatSidenav, MatSidenavContainer, MatSidenavContent,
    MatToolbar, MatNavList, MatListItem, MatIcon, TranslatePipe, LogoComponent],
  template: `
    <mat-sidenav-container class="shell">
      <mat-sidenav mode="side" opened>
        <div class="side-brand">
          <app-logo [size]="40" />
          <strong>Y2 Engineering</strong>
          <small>{{ 'ADMIN.PORTAL' | t }}</small>
        </div>
        <div class="toggle-bar">
          <button class="icon-toggle" (click)="theme.toggle()">
            @if (theme.currentTheme() === 'light') {
              <span class="icon">🌙</span>
            } @else {
              <span class="icon">☀️</span>
            }
          </button>
          <button class="lang-toggle" (click)="toggleLang()">
            <span class="lang-label" [class.active]="trans.currentLang() === 'en'">EN</span>
            <span class="lang-track" [class.on]="trans.currentLang() === 'am'"><span class="lang-thumb"></span></span>
            <span class="lang-label" [class.active]="trans.currentLang() === 'am'">አማ</span>
          </button>
        </div>
        <mat-nav-list>
          @for (item of navItems; track item.path) {
            <a mat-list-item [routerLink]="item.path" routerLinkActive="active-link">
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span>{{ item.key | t }}</span>
              @if (getBadge(item.path)) {
                <span class="badge">{{ getBadge(item.path) }}</span>
              }
            </a>
          }
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar class="toolbar">
          <span class="toolbar-title">{{ 'ADMIN.TITLE' | t }}</span>
          <span class="spacer"></span>
          <a mat-button routerLink="/">{{ 'ADMIN.VIEW_WEBSITE' | t }}</a>
          <button mat-button (click)="auth.logout()">{{ 'ADMIN.LOGOUT' | t }}</button>
        </mat-toolbar>
        <div class="content"><router-outlet /></div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: `
    .shell { height: 100vh; }
    mat-sidenav { width: 250px; border-right: 1px solid var(--mat-sys-outline-variant); }
    .side-brand { padding: 1.2rem 1rem; display: flex; flex-direction: column; gap: .15rem; border-bottom: 1px solid var(--mat-sys-outline-variant); }
    .side-brand small { color: var(--mat-sys-on-surface-variant); }
    .toggle-bar {
      display: flex; align-items: center; gap: .5rem; padding: .6rem 1rem;
      border-bottom: 1px solid var(--mat-sys-outline-variant);
    }
    .icon-toggle {
      display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;
      border-radius: 50%; border: 1.5px solid var(--mat-sys-outline-variant); background: none;
      cursor: pointer; transition: all .2s; flex-shrink: 0;
    }
    .icon-toggle:hover { border-color: #0b3d91; }
    .icon { line-height: 1; font-size: .95rem; }
    .lang-toggle {
      display: flex; align-items: center; gap: .4rem; background: none; border: none; cursor: pointer;
      padding: .3rem .5rem; border-radius: 999px;
      border: 1.5px solid var(--mat-sys-outline-variant); transition: all .2s;
    }
    .lang-toggle:hover { border-color: #0b3d91; }
    .lang-label { font-size: .7rem; font-weight: 700; color: #9ca3af; transition: color .2s; user-select: none; }
    .lang-label.active { color: #0b3d91; }
    .lang-track {
      width: 30px; height: 18px; border-radius: 999px; background: #d1d5db; position: relative; transition: background .3s;
    }
    .lang-track.on { background: #0b3d91; }
    .lang-track .lang-thumb {
      width: 14px; height: 14px; border-radius: 50%; background: #fff; position: absolute; top: 2px; left: 2px;
      box-shadow: 0 1px 3px rgba(0,0,0,.2); transition: transform .3s cubic-bezier(.4,0,.2,1);
    }
    .lang-track.on .lang-thumb { transform: translateX(12px); }
    .badge {
      margin-left: auto; min-width: 20px; height: 20px; padding: 0 6px;
      border-radius: 999px; background: #e65100; color: #fff;
      font-size: .65rem; font-weight: 700; display: inline-grid; place-items: center;
      line-height: 1;
    }
    mat-nav-list a { position: relative; }
    .active-link { background: #e3edfb; }
    .toolbar { border-bottom: 1px solid var(--mat-sys-outline-variant); }
    .spacer { flex: 1; }
    .content { padding: 1.5rem; }
    a.active-link { color: #0b3d91; font-weight: 600; }
  `
})
export class AdminLayout implements OnInit {
  readonly navItems = [
    { key: 'ADMIN.TITLE', icon: 'dashboard', path: '/admin' },
    { key: 'ADMIN.SERVICE_REQUESTS', icon: 'assignment', path: '/admin/service-requests' },
    { key: 'NAV.SERVICES', icon: 'build', path: '/admin/services' },
    { key: 'ADMIN.CUSTOMERS', icon: 'people', path: '/admin/customers' },
    { key: 'NAV.PROJECTS', icon: 'folder', path: '/admin/projects' },
    { key: 'ADMIN.MACHINES', icon: 'precision_manufacturing', path: '/admin/machines' },
    { key: 'CUSTOMER.QUOTATIONS', icon: 'request_quote', path: '/admin/quotations' },
    { key: 'ADMIN.WORK_ORDERS', icon: 'fact_check', path: '/admin/work-orders' },
    { key: 'ADMIN.PRODUCTS', icon: 'inventory_2', path: '/admin/inventory' },
    { key: 'ADMIN.REVENUE', icon: 'payments', path: '/admin/finance' },
    { key: 'NAV.TRAINING', icon: 'school', path: '/admin/training' },
    { key: 'ADMIN.CANDIDATES', icon: 'group', path: '/admin/staffing' },
    { key: 'ADMIN.CMS_TITLE', icon: 'edit_note', path: '/admin/cms' },
    { key: 'ADMIN.REPORTS_TITLE', icon: 'bar_chart', path: '/admin/reports' }
  ];

  constructor(
    protected readonly auth: AuthService,
    readonly trans: TranslationService,
    readonly theme: ThemeService,
    readonly notifications: NotificationService
  ) {}

  ngOnInit(): void {
    this.notifications.start();
  }

  toggleLang(): void {
    this.trans.setLanguage(this.trans.currentLang() === 'en' ? 'am' : 'en');
  }

  getBadge(path: string): number | null {
    const n = this.notifications;
    switch (path) {
      case '/admin/service-requests': return n.pendingRequests() || null;
      case '/admin/quotations': return n.pendingQuotations() || null;
      case '/admin/customers': return null;
      default: return null;
    }
  }
}
