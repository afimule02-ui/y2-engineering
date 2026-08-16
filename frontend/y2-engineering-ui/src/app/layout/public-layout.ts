import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { Language, TranslationService } from '../core/translation.service';
import { ThemeService } from '../core/theme.service';
import { LogoComponent } from '../shared/components/logo';
import { TranslatePipe } from '../shared/pipes/translate.pipe';

@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe, LogoComponent],
  template: `
    <header class="site-header">
      <div class="container header-inner">
        <a class="brand" routerLink="/">
          <app-logo [size]="44" />
          <span class="brand-text">
            <strong>{{ 'BRAND.NAME' | t }}</strong>
            <small>{{ 'BRAND.TAGLINE' | t }}</small>
          </span>
        </a>
        <nav class="nav">
          <a routerLink="/services" routerLinkActive="active">{{ 'NAV.SERVICES' | t }}</a>
          <a routerLink="/projects" routerLinkActive="active">{{ 'NAV.PROJECTS' | t }}</a>
          <a routerLink="/training" routerLinkActive="active">{{ 'NAV.TRAINING' | t }}</a>
          <a routerLink="/careers" routerLinkActive="active">{{ 'NAV.CAREERS' | t }}</a>
          <a routerLink="/blog" routerLinkActive="active">{{ 'NAV.KNOWLEDGE' | t }}</a>
          <a routerLink="/contact" routerLinkActive="active">{{ 'NAV.CONTACT' | t }}</a>
          @if (auth.isAuthenticated) {
            <a routerLink="/customer" class="btn-outline">{{ 'NAV.MY_PORTAL' | t }}</a>
            <button class="btn-outline" (click)="auth.logout()">{{ 'NAV.LOGOUT' | t }}</button>
          } @else {
            <a routerLink="/auth/login" class="btn-outline">{{ 'NAV.LOGIN' | t }}</a>
          }
          <a routerLink="/request-service" class="btn-primary">{{ 'NAV.REQUEST_SERVICE' | t }}</a>
          <div class="toggle-group">
            <!-- Theme toggle -->
            <button class="icon-toggle" (click)="theme.toggle()" [attr.aria-label]="theme.currentTheme() === 'light' ? 'Switch to dark mode' : 'Switch to light mode'">
              @if (theme.currentTheme() === 'light') {
                <span class="icon">🌙</span>
              } @else {
                <span class="icon">☀️</span>
              }
            </button>
            <!-- Language toggle -->
            <button class="lang-toggle" (click)="toggleLang()">
              <span class="lang-label" [class.active]="trans.currentLang() === 'en'">EN</span>
              <span class="lang-track" [class.on]="trans.currentLang() === 'am'"><span class="lang-thumb"></span></span>
              <span class="lang-label" [class.active]="trans.currentLang() === 'am'">አማ</span>
            </button>
          </div>
        </nav>
      </div>
    </header>

    <main class="container"><router-outlet /></main>

    <footer class="site-footer">
      <div class="container footer-grid">
        <div class="footer-brand">
          <app-logo [size]="40" />
          <h4>{{ 'FOOTER.COMPANY' | t }}</h4>
          <p>{{ 'FOOTER.DESCRIPTION' | t }}</p>
        </div>
        <div>
          <h4>{{ 'FOOTER.QUICK_LINKS' | t }}</h4>
          <a routerLink="/services">{{ 'NAV.SERVICES' | t }}</a>
          <a routerLink="/projects">{{ 'NAV.PROJECTS' | t }}</a>
          <a routerLink="/training">{{ 'NAV.TRAINING' | t }}</a>
          <a routerLink="/contact">{{ 'NAV.CONTACT' | t }}</a>
        </div>
        <div>
          <h4>{{ 'FOOTER.GET_IN_TOUCH' | t }}</h4>
          <p>{{ 'FOOTER.CITY' | t }}</p>
          <p>{{ 'FOOTER.EMAIL' | t }}</p>
          <p>{{ 'FOOTER.REQUEST_NOTE' | t }}</p>
        </div>
      </div>
      <div class="container footer-bottom">{{ 'FOOTER.COPYRIGHT' | t }}</div>
    </footer>
  `,
  styles: `
    .site-header {
      border-bottom: 1px solid var(--mat-sys-outline-variant);
      background: var(--mat-sys-surface);
      position: sticky; top: 0; z-index: 10;
    }
    .header-inner { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: .8rem 0; flex-wrap: wrap; }
    .brand { display: flex; align-items: center; gap: .7rem; text-decoration: none; color: inherit; }
    .brand-text { display: flex; flex-direction: column; line-height: 1.2; }
    .brand-text small { color: var(--mat-sys-on-surface-variant); font-size: .75rem; }
    .nav { display: flex; align-items: center; gap: .9rem; flex-wrap: wrap; }
    .nav a { text-decoration: none; color: var(--mat-sys-on-surface); font-weight: 500; font-size: .95rem; }
    .nav a.active { color: #0b3d91; }
    .btn-primary, .btn-outline {
      padding: .5rem 1rem; border-radius: 8px; font-weight: 600; font-size: .9rem; border: 1px solid #0b3d91; cursor: pointer;
    }
    .btn-primary { background: #0b3d91; color: #fff; text-decoration: none; }
    .btn-outline { background: transparent; color: #0b3d91; text-decoration: none; }

    .toggle-group { display: flex; align-items: center; gap: .4rem; }

    /* Theme toggle */
    .icon-toggle {
      display: flex; align-items: center; justify-content: center; width: 34px; height: 34px;
      border-radius: 50%; border: 1.5px solid var(--mat-sys-outline-variant); background: none;
      cursor: pointer; transition: all .2s; font-size: 1rem;
    }
    .icon-toggle:hover { border-color: #0b3d91; background: rgba(11,61,145,.06); }
    .icon { line-height: 1; font-size: 1.05rem; }

    /* Language toggle */
    .lang-toggle {
      display: flex; align-items: center; gap: .45rem; background: none; border: none; cursor: pointer;
      padding: .35rem .6rem; border-radius: 999px; border: 1.5px solid var(--mat-sys-outline-variant); transition: all .2s;
    }
    .lang-toggle:hover { border-color: #0b3d91; background: rgba(11,61,145,.04); }
    .lang-label { font-size: .72rem; font-weight: 700; color: #9ca3af; transition: color .2s; user-select: none; }
    .lang-label.active { color: #0b3d91; }
    .lang-track {
      width: 34px; height: 20px; border-radius: 999px; background: #d1d5db; position: relative; transition: background .3s;
    }
    .lang-track.on { background: #0b3d91; }
    .lang-track .lang-thumb {
      width: 16px; height: 16px; border-radius: 50%; background: #fff; position: absolute; top: 2px; left: 2px;
      box-shadow: 0 1px 4px rgba(0,0,0,.25); transition: transform .3s cubic-bezier(.4,0,.2,1);
    }
    .lang-track.on .lang-thumb { transform: translateX(14px); }

    .site-footer { background: #0b2438; color: #cbd5e1; margin-top: 4rem; }
    .footer-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 2rem; padding: 3rem 0 2rem; }
    .footer-brand { display: flex; flex-direction: column; gap: .5rem; }
    .footer-brand h4 { margin: 0; }
    .site-footer h4 { color: #fff; margin: 0 0 .8rem; }
    .site-footer a { display: block; color: #cbd5e1; text-decoration: none; padding: .2rem 0; }
    .site-footer a:hover { color: #fff; }
    .footer-bottom { padding: 1rem 0; border-top: 1px solid #1e3a52; font-size: .85rem; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }
    main.container { min-height: 60vh; }
  `
})
export class PublicLayout {
  constructor(
    protected readonly auth: AuthService,
    readonly trans: TranslationService,
    readonly theme: ThemeService
  ) {}

  toggleLang(): void {
    this.trans.setLanguage(this.trans.currentLang() === 'en' ? 'am' : 'en');
  }
}
