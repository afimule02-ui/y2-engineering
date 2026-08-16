import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ServiceRequest } from '../../core/models';
import { StatusBadge } from '../../shared/components/status-badge';
import { SkeletonComponent } from '../../shared/components/skeleton';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-customer-requests',
  imports: [CommonModule, RouterLink, StatusBadge, SkeletonComponent, TranslatePipe],
  template: `
    <h1>{{ 'CUSTOMER.SERVICE_REQUESTS' | t }}</h1>
    @if (loading()) {
      <div class="list">
        @for (i of [1,2,3]; track i) {
          <article class="skel-card">
            <div class="skel-top"><app-skeleton variant="text" width="80px" /><app-skeleton variant="text" width="70px" /><app-skeleton variant="text" width="60px" /></div>
            <app-skeleton variant="title" width="150px" />
            <app-skeleton variant="text" width="100%" />
            <app-skeleton variant="text" width="60%" />
          </article>
        }
      </div>
    } @else {
      <div class="list">
        @for (r of requests(); track r.id) {
          <article class="item">
            <div class="top">
              <strong>{{ r.requestNo }}</strong>
              <app-status-badge kind="request" [value]="r.status" />
              <app-status-badge kind="priority" [value]="r.priority" />
            </div>
            <h3>{{ r.machineName || 'Machine' }}</h3>
            <p>{{ r.problemDescription }}</p>
            <div class="meta">
              <span>{{ 'CUSTOMER.SUBMITTED' | t }} {{ r.createdAt | date: 'medium' }}</span>
              @if (r.city) { <span>{{ r.city }}</span> }
            </div>
          </article>
        } @empty {
          <p class="muted">{{ 'CUSTOMER.NO_REQUESTS' | t }} <a routerLink="/request-service">{{ 'CUSTOMER.REQUEST_SERVICE' | t }}</a>.</p>
        }
      </div>
    }
  `,
  styles: `
    .list { display: grid; gap: 1.2rem; }
    .skel-card { border: 1px solid var(--mat-sys-outline-variant); border-radius: 12px; padding: 1.3rem; display: flex; flex-direction: column; gap: .6rem; }
    .skel-top { display: flex; gap: .6rem; }
    .item { border: 1px solid var(--mat-sys-outline-variant); border-radius: 12px; padding: 1.3rem; }
    .top { display: flex; gap: .6rem; align-items: center; }
    .top strong { margin-right: auto; color: #0b3d91; }
    .meta { display: flex; gap: 1.5rem; color: var(--mat-sys-on-surface-variant); font-size: .85rem; }
    .muted { color: var(--mat-sys-on-surface-variant); }
  `
})
export class CustomerRequestsPage implements OnInit {
  readonly requests = signal<ServiceRequest[]>([]);
  readonly loading = signal(true);

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loading.set(true);
    this.api.get<ServiceRequest[]>('/service-requests/mine').subscribe({
      next: r => { this.requests.set(r); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
