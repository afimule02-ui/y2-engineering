import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../core/api.service';
import { QuotationSummary } from '../../core/models';
import { StatusBadge } from '../../shared/components/status-badge';
import { SkeletonComponent } from '../../shared/components/skeleton';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-customer-quotations',
  imports: [CommonModule, StatusBadge, MatButtonModule, SkeletonComponent, TranslatePipe],
  template: `
    <h1>{{ 'CUSTOMER.QUOTATIONS' | t }}</h1>
    @if (loading()) {
      <div class="list">
        @for (i of [1,2,3]; track i) {
          <article class="skel-card">
            <div class="skel-top"><app-skeleton variant="text" width="80px" /><app-skeleton variant="text" width="70px" /></div>
            <app-skeleton variant="title" width="200px" />
            <app-skeleton variant="text" width="100px" height="24px" />
            <app-skeleton variant="text" width="250px" />
          </article>
        }
      </div>
    } @else {
      <div class="list">
        @for (q of quotations(); track q.id) {
          <article class="item">
            <div class="top">
              <strong>{{ q.quotationNo }}</strong>
              <app-status-badge kind="quotation" [value]="q.status" />
            </div>
            <h3>{{ q.title }}</h3>
            <p class="amount">{{ q.total | currency: 'ETB ' }}</p>
            <p class="meta">{{ 'CUSTOMER.ISSUED' | t }} {{ q.issueDate | date: 'mediumDate' }} · {{ 'CUSTOMER.EXPIRES' | t }} {{ q.expiryDate | date: 'mediumDate' }}</p>
            @if (q.status === 1) {
              <div class="actions">
                <button mat-flat-button color="primary" (click)="respond(q.id, true)">{{ 'CUSTOMER.ACCEPT' | t }}</button>
                <button mat-stroked-button (click)="respond(q.id, false)">{{ 'CUSTOMER.REJECT' | t }}</button>
              </div>
            }
          </article>
        } @empty {
          <p class="muted">{{ 'CUSTOMER.NO_QUOTATIONS' | t }}</p>
        }
      </div>
    }
  `,
  styles: `
    .list { display: grid; gap: 1.2rem; }
    .skel-card { border: 1px solid var(--mat-sys-outline-variant); border-radius: 12px; padding: 1.3rem; display: flex; flex-direction: column; gap: .6rem; }
    .skel-top { display: flex; gap: .6rem; }
    .item { border: 1px solid var(--mat-sys-outline-variant); border-radius: 12px; padding: 1.3rem; }
    .top { display: flex; align-items: center; gap: .6rem; }
    .top strong { margin-right: auto; color: #0b3d91; }
    .amount { font-size: 1.4rem; font-weight: 700; margin: .5rem 0; }
    .meta { color: var(--mat-sys-on-surface-variant); font-size: .85rem; }
    .actions { display: flex; gap: .8rem; margin-top: .8rem; }
    .muted { color: var(--mat-sys-on-surface-variant); }
  `
})
export class CustomerQuotationsPage implements OnInit {
  readonly quotations = signal<QuotationSummary[]>([]);
  readonly loading = signal(true);

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loading.set(true);
    this.api.get<QuotationSummary[]>('/quotations/mine').subscribe({
      next: q => { this.quotations.set(q); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  respond(id: string, accept: boolean): void {
    this.api.post(`/quotations/${id}/${accept ? 'accept' : 'reject'}`).subscribe({
      next: () => this.ngOnInit()
    });
  }
}
