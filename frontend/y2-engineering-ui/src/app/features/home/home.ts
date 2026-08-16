import { Component, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ServiceSummary } from '../../core/models';
import { SkeletonComponent } from '../../shared/components/skeleton';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-home',
  imports: [RouterLink, MatCardModule, MatIcon, SkeletonComponent, TranslatePipe],
  template: `
    <section class="hero">
      <div class="hero-inner">
        <p class="eyebrow">{{ 'HOME.EYEBROW' | t }}</p>
        <h1 [innerHTML]="'HOME.HERO_TITLE' | t"></h1>
        <p class="lead">{{ 'HOME.HERO_LEAD' | t }}</p>
        <div class="cta">
          <a routerLink="/request-service" class="btn">{{ 'HOME.CTA_REQUEST' | t }}</a>
          <a routerLink="/services" class="btn ghost">{{ 'HOME.CTA_EXPLORE' | t }}</a>
        </div>
      </div>
    </section>

    <section class="section">
      <h2 class="center">{{ 'HOME.SERVICES_TITLE' | t }}</h2>
      <p class="center muted">{{ 'HOME.SERVICES_SUBTITLE' | t }}</p>
      <div class="cards">
        @if (loadingServices()) {
          @for (i of [1,2,3]; track i) {
            <div class="skel-card-wrap"><app-skeleton variant="card" height="220px" /></div>
          }
        } @else {
          @for (service of services(); track service.id) {
            <a class="card" [routerLink]="['/services', service.slug]">
              <mat-icon>{{ service.icon || 'settings' }}</mat-icon>
              <h3>{{ service.name }}</h3>
              <p>{{ service.shortDescription }}</p>
              <span class="more">{{ 'HOME.LEARN_MORE' | t }}</span>
            </a>
          }
        }
      </div>
    </section>

    <section class="section alt">
      <div class="split">
        <div>
          <h2>{{ 'HOME.WHY_TITLE' | t }}</h2>
          <p>{{ 'HOME.WHY_TEXT' | t }}</p>
        </div>
        <ul class="points">
          <li>{{ 'HOME.POINT_1' | t }}</li>
          <li>{{ 'HOME.POINT_2' | t }}</li>
          <li>{{ 'HOME.POINT_3' | t }}</li>
          <li>{{ 'HOME.POINT_4' | t }}</li>
          <li>{{ 'HOME.POINT_5' | t }}</li>
        </ul>
      </div>
    </section>

    <section class="section cta-band">
      <h2>{{ 'HOME.BOTTOM_TITLE' | t }}</h2>
      <p>{{ 'HOME.BOTTOM_TEXT' | t }}</p>
      <a routerLink="/request-service" class="btn">{{ 'HOME.CTA_REQUEST' | t }}</a>
    </section>
  `,
  styles: `
    .hero {
      background: linear-gradient(135deg, #0b2438 0%, #0b3d91 100%);
      color: #fff;
      padding: 5rem 0;
    }
    .hero-inner { max-width: 1000px; margin: 0 auto; padding: 0 1.5rem; }
    .eyebrow { letter-spacing: .18em; font-size: .8rem; opacity: .8; }
    h1 { font-size: 2.8rem; line-height: 1.15; margin: 1rem 0; }
    .lead { max-width: 640px; font-size: 1.1rem; opacity: .9; }
    .cta { display: flex; gap: 1rem; margin-top: 2rem; flex-wrap: wrap; }
    .btn {
      background: #f59e0b; color: #0b2438; font-weight: 700; padding: .8rem 1.4rem;
      border-radius: 8px; text-decoration: none;
    }
    .btn.ghost { background: transparent; color: #fff; border: 1px solid rgba(255,255,255,.5); }
    .section { padding: 4rem 0; max-width: 1200px; margin: 0 auto; padding-left: 1.5rem; padding-right: 1.5rem; }
    .section.alt { background: #f4f7fb; max-width: none; padding-left: 1.5rem; padding-right: 1.5rem; }
    .center { text-align: center; }
    .muted { color: var(--mat-sys-on-surface-variant); }
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-top: 2rem; }
    .skel-card-wrap { border-radius: 12px; overflow: hidden; }
    .card {
      border: 1px solid var(--mat-sys-outline-variant); border-radius: 12px; padding: 1.8rem;
      text-decoration: none; color: inherit; display: block; background: var(--mat-sys-surface);
      transition: box-shadow .15s ease, transform .15s ease;
    }
    .card:hover { box-shadow: 0 8px 24px rgba(11,61,145,.12); transform: translateY(-2px); }
    .card mat-icon { font-size: 2.4rem; width: 2.4rem; height: 2.4rem; color: #0b3d91; }
    .card h3 { margin: 1rem 0 .5rem; }
    .card p { color: var(--mat-sys-on-surface-variant); }
    .more { color: #0b3d91; font-weight: 600; font-size: .9rem; }
    .split { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: center; }
    @media (max-width: 800px) { .split { grid-template-columns: 1fr; } }
    .points { list-style: none; padding: 0; display: grid; gap: .8rem; font-weight: 500; }
    .cta-band { text-align: center; background: #0b3d91; color: #fff; border-radius: 16px; margin: 3rem auto; padding: 3rem 1.5rem; }
    .cta-band .btn { margin-top: 1rem; display: inline-block; }
  `
})
export class HomePage implements OnInit {
  readonly services = signal<ServiceSummary[]>([]);
  readonly loadingServices = signal(true);

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadingServices.set(true);
    this.api.get<ServiceSummary[]>('/services').subscribe({
      next: s => { this.services.set(s.slice(0, 6)); this.loadingServices.set(false); },
      error: () => this.loadingServices.set(false)
    });
  }
}
