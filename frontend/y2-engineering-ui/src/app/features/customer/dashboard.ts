import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { QuotationSummary, ServiceRequest } from '../../core/models';
import { StatusBadge } from '../../shared/components/status-badge';
import { SkeletonComponent } from '../../shared/components/skeleton';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-customer-dashboard',
  imports: [CommonModule, RouterLink, StatusBadge, SkeletonComponent, TranslatePipe],
  template: `
    <h1>{{ 'CUSTOMER.DASHBOARD' | t }}</h1>
    <p class="muted">{{ 'CUSTOMER.WELCOME' | t }} {{ auth.user$()?.fullName }}.</p>

    @if (loading()) {
      <div class="cards">
        @for (i of [1,2,3]; track i) { <app-skeleton variant="stat" /> }
      </div>
      <section class="panel">
        <h2>{{ 'CUSTOMER.RECENT' | t }}</h2>
        @for (i of [1,2,3]; track i) {
          <div class="skel-row">
            <app-skeleton variant="text" width="80px" />
            <app-skeleton variant="text" width="200px" />
            <app-skeleton variant="text" width="80px" />
          </div>
        }
      </section>
    } @else {
      <div class="cards">
        <div class="stat"><span class="num">{{ requests().length }}</span><span>{{ 'CUSTOMER.SERVICE_REQUESTS' | t }}</span></div>
        <div class="stat"><span class="num">{{ quotations().length }}</span><span>{{ 'CUSTOMER.QUOTATIONS' | t }}</span></div>
        <div class="stat"><span class="num">{{ pendingQuotes() }}</span><span>{{ 'CUSTOMER.AWAITING' | t }}</span></div>
      </div>

      <section class="panel">
        <h2>{{ 'CUSTOMER.RECENT' | t }}</h2>
        <a routerLink="/customer/requests" class="link">{{ 'CUSTOMER.VIEW_ALL' | t }}</a>
        @for (r of requests().slice(0, 5); track r.id) {
          <div class="row">
            <strong>{{ r.requestNo }}</strong>
            <span>{{ r.machineName || r.problemDescription }}</span>
            <app-status-badge kind="request" [value]="r.status" />
          </div>
        } @empty {
          <p class="muted">{{ 'CUSTOMER.NO_REQUESTS' | t }} <a routerLink="/request-service">{{ 'CUSTOMER.REQUEST_SERVICE' | t }}</a>.</p>
        }
      </section>

      <section class="panel">
        <h2>{{ 'CUSTOMER.YOUR_QUOTATIONS' | t }}</h2>
        <a routerLink="/customer/quotations" class="link">{{ 'CUSTOMER.VIEW_ALL' | t }}</a>
        @for (q of quotations(); track q.id) {
          <div class="row">
            <strong>{{ q.quotationNo }}</strong>
            <span>{{ q.title }}</span>
            <span>{{ q.total | currency: 'ETB ' }}</span>
            <app-status-badge kind="quotation" [value]="q.status" />
          </div>
        } @empty {
          <p class="muted">{{ 'CUSTOMER.NO_QUOTATIONS' | t }}</p>
        }
      </section>
    }
  `,
  styles: `
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1.2rem; margin: 1.5rem 0; }
    .stat { border: 1px solid var(--mat-sys-outline-variant); border-radius: 12px; padding: 1.5rem; display: flex; flex-direction: column; gap: .3rem; }
    .num { font-size: 2rem; font-weight: 800; color: #0b3d91; }
    .panel { border: 1px solid var(--mat-sys-outline-variant); border-radius: 12px; padding: 1.3rem; margin-bottom: 1.5rem; }
    .row { display: flex; gap: 1rem; align-items: center; padding: .6rem 0; border-bottom: 1px solid var(--mat-sys-outline-variant); }
    .row span { flex: 1; color: var(--mat-sys-on-surface-variant); }
    .skel-row { display: flex; gap: 1rem; align-items: center; padding: .6rem 0; border-bottom: 1px solid var(--mat-sys-outline-variant); }
    .link { float: right; color: #0b3d91; text-decoration: none; font-size: .9rem; font-weight: 600; }
    .muted { color: var(--mat-sys-on-surface-variant); }
  `
})
export class CustomerDashboardPage implements OnInit {
  private readonly api = inject(ApiService);
  protected readonly auth = inject(AuthService);
  readonly requests = signal<ServiceRequest[]>([]);
  readonly quotations = signal<QuotationSummary[]>([]);
  readonly loading = signal(true);

  readonly pendingQuotes = () => this.quotations().filter(q => q.status === 1).length;

  ngOnInit(): void {
    this.loading.set(true);
    this.api.get<ServiceRequest[]>('/service-requests/mine').subscribe({
      next: r => this.requests.set(r)
    });
    this.api.get<QuotationSummary[]>('/quotations/mine').subscribe({
      next: q => { this.quotations.set(q); this.loading.set(false); }
    });
  }
}
