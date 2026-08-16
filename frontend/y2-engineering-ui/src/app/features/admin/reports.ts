import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { ReportData, StatusCount } from '../../core/models';
import { SkeletonComponent } from '../../shared/components/skeleton';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

const LABELS: Record<string, string[]> = {
  request: ['Pending', 'Under Review', 'Quoted', 'Scheduled', 'In Progress', 'Completed', 'Cancelled'],
  quotation: ['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired', 'Converted'],
  invoice: ['Draft', 'Sent', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled'],
  project: ['Not Started', 'In Progress', 'On Hold', 'Completed', 'Cancelled'],
  machine: ['Operational', 'Under Maintenance', 'Out of Service', 'Decommissioned']
};

@Component({
  selector: 'app-admin-reports',
  imports: [CommonModule, SkeletonComponent, TranslatePipe],
  template: `
    <h1>{{ 'ADMIN.REPORTS_TITLE' | t }}</h1>
    @if (loading()) {
      <div class="kpis">
        @for (i of [1,2,3,4,5,6,7]; track i) { <app-skeleton variant="stat" /> }
      </div>
      <div class="grid">
        @for (i of [1,2,3]; track i) {
          <section class="panel">
            <app-skeleton variant="title" width="160px" />
            @for (j of [1,2,3,4]; track j) {
              <div class="skel-bar"><app-skeleton variant="text" width="100px" /><app-skeleton variant="text" width="100%" height="10px" /><app-skeleton variant="text" width="20px" /></div>
            }
          </section>
        }
      </div>
    } @else if (data(); as d) {
      <div class="kpis">
        <div class="kpi"><span class="num">{{ d.totalRevenue | currency: 'ETB ' }}</span><span>Revenue (paid)</span></div>
        <div class="kpi"><span class="num warn">{{ d.outstandingBalance | currency: 'ETB ' }}</span><span>Outstanding</span></div>
        <div class="kpi"><span class="num">{{ d.totalRequests }}</span><span>Service Requests</span></div>
        <div class="kpi"><span class="num">{{ d.totalQuotations }}</span><span>Quotations</span></div>
        <div class="kpi"><span class="num">{{ d.totalInvoices }}</span><span>Invoices</span></div>
        <div class="kpi"><span class="num">{{ d.totalProjects }}</span><span>Projects</span></div>
        <div class="kpi"><span class="num">{{ d.totalMachines }}</span><span>Machines</span></div>
      </div>

      <div class="grid">
        <section class="panel">
          <h3>Service Requests by status</h3>
          @for (s of bars(d.requestStatuses, 'request'); track s.status) {
            <div class="bar">
              <span class="label">{{ s.label }}</span>
              <div class="track"><div class="fill" [style.width.%]="s.percent"></div></div>
              <span class="count">{{ s.count }}</span>
            </div>
          }
        </section>
        <section class="panel">
          <h3>Quotations by status</h3>
          @for (s of bars(d.quotationStatuses, 'quotation'); track s.status) {
            <div class="bar">
              <span class="label">{{ s.label }}</span>
              <div class="track"><div class="fill" [style.width.%]="s.percent"></div></div>
              <span class="count">{{ s.count }}</span>
            </div>
          }
        </section>
        <section class="panel">
          <h3>Invoices by status</h3>
          @for (s of bars(d.invoiceStatuses, 'invoice'); track s.status) {
            <div class="bar">
              <span class="label">{{ s.label }}</span>
              <div class="track"><div class="fill" [style.width.%]="s.percent"></div></div>
              <span class="count">{{ s.count }}</span>
            </div>
          }
        </section>
        <section class="panel">
          <h3>Projects by status</h3>
          @for (s of bars(d.projectStatuses, 'project'); track s.status) {
            <div class="bar">
              <span class="label">{{ s.label }}</span>
              <div class="track"><div class="fill" [style.width.%]="s.percent"></div></div>
              <span class="count">{{ s.count }}</span>
            </div>
          }
        </section>
        <section class="panel">
          <h3>Machines by status</h3>
          @for (s of bars(d.machineStatuses, 'machine'); track s.status) {
            <div class="bar">
              <span class="label">{{ s.label }}</span>
              <div class="track"><div class="fill" [style.width.%]="s.percent"></div></div>
              <span class="count">{{ s.count }}</span>
            </div>
          }
        </section>
      </div>
    } @else {
      <p class="muted">Loading…</p>
    }
  `,
  styles: `
    .kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 1rem; margin: 1.5rem 0; }
    .kpi { border: 1px solid var(--mat-sys-outline-variant); border-radius: 12px; padding: 1.3rem; display: flex; flex-direction: column; gap: .3rem; }
    .num { font-size: 1.35rem; font-weight: 800; color: #0b3d91; }
    .num.warn { color: #e65100; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 1.2rem; }
    .panel { border: 1px solid var(--mat-sys-outline-variant); border-radius: 12px; padding: 1.3rem; }
    .bar { display: grid; grid-template-columns: 130px 1fr 36px; gap: .7rem; align-items: center; margin: .5rem 0; }
    .skel-bar { display: grid; grid-template-columns: 100px 1fr 20px; gap: .7rem; align-items: center; margin: .5rem 0; }
    .label { font-size: .85rem; }
    .track { height: 10px; background: #eef2f7; border-radius: 999px; overflow: hidden; }
    .fill { height: 100%; background: #0b3d91; border-radius: 999px; }
    .count { font-weight: 700; text-align: right; font-size: .85rem; }
    .muted { color: var(--mat-sys-on-surface-variant); }
  `
})
export class AdminReportsPage implements OnInit {
  readonly data = signal<ReportData | null>(null);
  readonly loading = signal(true);

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loading.set(true);
    this.api.get<ReportData>('/admin/reports').subscribe({
      next: d => { this.data.set(d); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  bars(items: StatusCount[], kind: keyof typeof LABELS): { status: number; label: string; count: number; percent: number }[] {
    const labels = LABELS[kind];
    const total = items.reduce((sum, i) => sum + i.count, 0) || 1;
    return items.map(i => ({
      status: i.status,
      label: labels[i.status] ?? `Status ${i.status}`,
      count: i.count,
      percent: Math.round((i.count / total) * 100)
    }));
  }
}
