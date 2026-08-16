import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { DashboardData } from '../../core/models';
import { StatusBadge } from '../../shared/components/status-badge';
import { SkeletonComponent } from '../../shared/components/skeleton';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, RouterLink, StatusBadge, SkeletonComponent, TranslatePipe],
  template: `
    <h1>{{ 'CUSTOMER.DASHBOARD' | t }}</h1>
    @if (loading()) {
      <div class="stats">
        @for (i of [1,2,3,4,5,6,7]; track i) {
          <app-skeleton variant="stat" />
        }
      </div>
      <section class="panel">
        <h2>{{ 'ADMIN.RECENT_REQUESTS' | t }}</h2>
        @for (i of [1,2,3]; track i) {
          <div class="skel-row">
            <app-skeleton variant="text" width="80px" />
            <app-skeleton variant="text" width="200px" />
            <app-skeleton variant="text" width="120px" />
            <app-skeleton variant="text" width="80px" />
            <app-skeleton variant="text" width="60px" />
          </div>
        }
      </section>
    } @else if (data(); as d) {
      <div class="stats">
        <a class="stat" routerLink="/admin/customers"><span class="num">{{ d.customers }}</span><span>{{ 'ADMIN.CUSTOMERS' | t }}</span></a>
        <a class="stat" routerLink="/admin/service-requests"><span class="num">{{ d.serviceRequests }}</span><span>{{ 'ADMIN.SERVICE_REQUESTS' | t }}</span></a>
        <a class="stat" routerLink="/admin/service-requests"><span class="num warn">{{ d.pendingRequests }}</span><span>{{ 'ADMIN.PENDING_REQUESTS' | t }}</span></a>
        <a class="stat" routerLink="/admin/projects"><span class="num">{{ d.activeProjects }}</span><span>{{ 'ADMIN.ACTIVE_PROJECTS' | t }}</span></a>
        <a class="stat" routerLink="/admin/machines"><span class="num">{{ d.machines }}</span><span>{{ 'ADMIN.MACHINES' | t }}</span></a>
        <a class="stat" routerLink="/admin/quotations"><span class="num warn">{{ d.pendingQuotations }}</span><span>{{ 'ADMIN.QUOTATIONS_SENT' | t }}</span></a>
        <a class="stat" routerLink="/admin/finance"><span class="num">{{ d.totalRevenue | currency: 'ETB ' }}</span><span>{{ 'ADMIN.REVENUE' | t }}</span></a>
      </div>

      <section class="panel">
        <h2>{{ 'ADMIN.RECENT_REQUESTS' | t }}</h2>
        @for (r of d.recentRequests; track r.id) {
          <div class="row">
            <strong>{{ r.requestNo }}</strong>
            <span>{{ r.machineName || r.problemDescription }}</span>
            <span class="who">{{ r.contactPerson }}</span>
            <app-status-badge kind="request" [value]="r.status" />
            <app-status-badge kind="priority" [value]="r.priority" />
          </div>
        } @empty {
          <p class="muted">{{ 'ADMIN.NO_REQUESTS' | t }}</p>
        }
      </section>
    } @else {
      <p class="muted">{{ 'COMMON.LOADING' | t }}</p>
    }
  `,
  styles: `
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; margin: 1.5rem 0; }
    .stat { border: 1px solid var(--mat-sys-outline-variant); border-radius: 12px; padding: 1.3rem; text-decoration: none; color: inherit; display: flex; flex-direction: column; gap: .2rem; }
    .num { font-size: 1.7rem; font-weight: 800; color: #0b3d91; }
    .num.warn { color: #e65100; }
    .panel { border: 1px solid var(--mat-sys-outline-variant); border-radius: 12px; padding: 1.3rem; }
    .row { display: flex; gap: 1rem; align-items: center; padding: .6rem 0; border-bottom: 1px solid var(--mat-sys-outline-variant); }
    .row span { flex: 1; color: var(--mat-sys-on-surface-variant); }
    .skel-row { display: flex; gap: 1rem; align-items: center; padding: .6rem 0; border-bottom: 1px solid var(--mat-sys-outline-variant); }
    .who { max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .muted { color: var(--mat-sys-on-surface-variant); }
  `
})
export class AdminDashboardPage implements OnInit {
  readonly data = signal<DashboardData | null>(null);
  readonly loading = signal(true);

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loading.set(true);
    this.api.get<DashboardData>('/admin/dashboard').subscribe({
      next: d => { this.data.set(d); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
