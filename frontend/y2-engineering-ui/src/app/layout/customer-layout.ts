import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { Language, TranslationService } from '../core/translation.service';
import { ThemeService } from '../core/theme.service';
import { TranslatePipe } from '../shared/pipes/translate.pipe';

@Component({
  selector: 'app-customer-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, TranslatePipe],
  template: `
    <mat-toolbar color="primary" class="topbar">
      <span>{{ 'CUSTOMER.PORTAL' | t }}</span>
      <span class="spacer"></span>
      @if (auth.user$(); as user) {
        <span class="who">{{ 'CUSTOMER.WELCOME' | t }} {{ user.fullName }}</span>
      }
      <div class="toggle-group">
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
      <a mat-button routerLink="/">{{ 'CUSTOMER.WEBSITE' | t }}</a>
      <button mat-button (click)="auth.logout()">{{ 'CUSTOMER.LOGOUT' | t }}</button>
    </mat-toolbar>

    <div class="tabs">
      <a routerLink="/customer" routerLinkActive="tab-active" [routerLinkActiveOptions]="{ exact: true }">{{ 'CUSTOMER.DASHBOARD' | t }}</a>
      <a routerLink="/customer/requests" routerLinkActive="tab-active">{{ 'CUSTOMER.SERVICE_REQUESTS' | t }}</a>
      <a routerLink="/customer/quotations" routerLinkActive="tab-active">{{ 'CUSTOMER.QUOTATIONS' | t }}</a>
    </div>

    <div class="container"><router-outlet /></div>
  `,
  styles: `
    .topbar { position: sticky; top: 0; z-index: 5; }
    .spacer { flex: 1; }
    .who { font-size: .9rem; opacity: .9; margin-right: .5rem; }
    .toggle-group { display: flex; align-items: center; gap: .4rem; margin-right: .5rem; }
    .icon-toggle {
      display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;
      border-radius: 50%; border: 1.5px solid rgba(255,255,255,.3); background: none;
      cursor: pointer; transition: all .2s;
    }
    .icon-toggle:hover { border-color: rgba(255,255,255,.6); }
    .icon { line-height: 1; font-size: .95rem; }
    .lang-toggle {
      display: flex; align-items: center; gap: .4rem; background: none; border: none; cursor: pointer;
      padding: .3rem .5rem; border-radius: 999px; border: 1.5px solid rgba(255,255,255,.3); transition: all .2s;
    }
    .lang-toggle:hover { border-color: rgba(255,255,255,.6); }
    .lang-label { font-size: .7rem; font-weight: 700; color: rgba(255,255,255,.45); transition: color .2s; user-select: none; }
    .lang-label.active { color: #fff; }
    .lang-track {
      width: 30px; height: 18px; border-radius: 999px; background: rgba(255,255,255,.25); position: relative; transition: background .3s;
    }
    .lang-track.on { background: rgba(255,255,255,.5); }
    .lang-track .lang-thumb {
      width: 14px; height: 14px; border-radius: 50%; background: #fff; position: absolute; top: 2px; left: 2px;
      box-shadow: 0 1px 3px rgba(0,0,0,.2); transition: transform .3s cubic-bezier(.4,0,.2,1);
    }
    .lang-track.on .lang-thumb { transform: translateX(12px); }
    .tabs { display: flex; gap: 1.2rem; padding: 1rem 1.5rem; max-width: 1200px; margin: 0 auto; border-bottom: 1px solid var(--mat-sys-outline-variant); }
    .tabs a { text-decoration: none; color: var(--mat-sys-on-surface); font-weight: 500; padding-bottom: .4rem; }
    .tab-active { color: #0b3d91 !important; border-bottom: 2px solid #0b3d91; }
    .container { max-width: 1200px; margin: 0 auto; padding: 1.5rem; }
  `
})
export class CustomerLayout {
  constructor(
    protected readonly auth: AuthService,
    readonly trans: TranslationService,
    readonly theme: ThemeService
  ) {}

  toggleLang(): void {
    this.trans.setLanguage(this.trans.currentLang() === 'en' ? 'am' : 'en');
  }
}
