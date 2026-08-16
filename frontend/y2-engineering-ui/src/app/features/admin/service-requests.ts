import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ApiService } from '../../core/api.service';
import { ServiceRequest } from '../../core/models';
import { StatusBadge } from '../../shared/components/status-badge';
import { AdminToolbarComponent } from '../../shared/components/admin-toolbar';
import { PaginationComponent } from '../../shared/components/pagination';
import { SkeletonComponent } from '../../shared/components/skeleton';
import { exportToCsv } from '../../shared/utils/csv-export';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

const STATUSES = [
  { value: 0, label: 'Pending' }, { value: 1, label: 'Under Review' }, { value: 2, label: 'Quoted' },
  { value: 3, label: 'Scheduled' }, { value: 4, label: 'In Progress' }, { value: 5, label: 'Completed' },
  { value: 6, label: 'Cancelled' }
];

@Component({
  selector: 'app-admin-service-requests',
  imports: [StatusBadge, FormsModule, MatFormFieldModule, MatSelectModule, MatButtonModule, AdminToolbarComponent, PaginationComponent, SkeletonComponent, TranslatePipe],
  template: `
    <div class="head">
      <h1>{{ 'ADMIN.SERVICE_REQUESTS' | t }}</h1>
    </div>

    @if (loading()) {
      <div class="skeleton-toolbar">
        <app-skeleton variant="text" width="300px" height="40px" />
        <app-skeleton variant="text" width="120px" height="40px" />
      </div>
      <div class="skeleton-table">
        <div class="skel-thead">
          <app-skeleton variant="text" width="80px" /><app-skeleton variant="text" width="120px" />
          <app-skeleton variant="text" width="100px" /><app-skeleton variant="text" width="70px" />
          <app-skeleton variant="text" width="90px" /><app-skeleton variant="text" width="100px" />
        </div>
        @for (i of [1,2,3,4,5]; track i) {
          <app-skeleton variant="table-row" [columns]="['100px','1fr','130px','70px','100px','120px']" />
        }
      </div>
    } @else {
      <app-admin-toolbar
        placeholder="Search requests..."
        [filters]="statusFilters"
        [totalCount]="all().length"
        [filteredCount]="filtered().length"
        (searchChange)="onSearch($event)"
        (filterChange)="onFilter($event)"
        (exportCsv)="doExport()"
      />

      <div class="table">
        <div class="thead">
          <span>No.</span><span>Machine / Problem</span><span>Contact</span><span>Priority</span><span>Status</span><span>Update</span>
        </div>
        @for (r of paged(); track r.id) {
          <div class="trow">
            <span class="no">{{ r.requestNo }}</span>
            <span>{{ r.machineName || r.problemDescription }}</span>
            <span class="who">{{ r.contactPerson }}<small>{{ r.contactPhone }}</small></span>
            <span><app-status-badge kind="priority" [value]="r.priority" /></span>
            <span><app-status-badge kind="request" [value]="r.status" /></span>
            <mat-form-field appearance="outline">
              <mat-select [value]="r.status" (selectionChange)="updateStatus(r, $event.value)">
                @for (s of statuses; track s.value) {
                  <mat-option [value]="s.value">{{ s.label }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>
        } @empty {
          <p class="muted">No service requests match your search.</p>
        }
      </div>

      <app-pagination
        [currentPage]="page()"
        [totalItems]="filtered().length"
        [pageSize]="size()"
        (pageChange)="page.set($event)"
        (pageSizeChange)="onSizeChange($event)"
      />
    }
  `,
  styles: `
    .head { display: flex; justify-content: space-between; align-items: center; }
    .skeleton-toolbar { display: flex; gap: 1rem; margin-bottom: 1rem; }
    .skeleton-table { border: 1px solid var(--mat-sys-outline-variant); border-radius: 12px; overflow: hidden; }
    .skel-thead { display: grid; grid-template-columns: 130px 1fr 160px 90px 120px 150px; gap: 1rem; padding: .7rem 1rem; background: #f4f7fb; }
    .table { border: 1px solid var(--mat-sys-outline-variant); border-radius: 12px; overflow: hidden; }
    .thead, .trow { display: grid; grid-template-columns: 130px 1fr 160px 90px 120px 150px; gap: 1rem; padding: .7rem 1rem; align-items: center; }
    .thead { background: #f4f7fb; font-weight: 700; font-size: .8rem; text-transform: uppercase; color: var(--mat-sys-on-surface-variant); }
    .trow { border-top: 1px solid var(--mat-sys-outline-variant); }
    .no { color: #0b3d91; font-weight: 700; }
    .who { display: flex; flex-direction: column; }
    .who small { color: var(--mat-sys-on-surface-variant); }
    .muted { color: var(--mat-sys-on-surface-variant); padding: 1rem; }
    @media (max-width: 1000px) { .thead, .trow { grid-template-columns: 110px 1fr 140px; } .thead span:nth-child(n+4), .trow span:nth-child(n+4) { display: none; } }
  `
})
export class AdminServiceRequestsPage implements OnInit {
  readonly statuses = STATUSES;
  readonly statusFilters = STATUSES.map(s => ({ value: s.value, label: s.label }));
  readonly all = signal<ServiceRequest[]>([]);
  readonly filtered = signal<ServiceRequest[]>([]);
  readonly page = signal(1);
  readonly size = signal(10);
  readonly loading = signal(true);
  filter: number | null = null;
  searchTerm = '';

  readonly paged = computed(() => {
    const start = (this.page() - 1) * this.size();
    return this.filtered().slice(start, start + this.size());
  });

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loading.set(true);
    this.api.get<ServiceRequest[]>('/service-requests').subscribe({
      next: r => { this.all.set(r); this.applyFilter(); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onSearch(term: string): void { this.searchTerm = term.toLowerCase(); this.page.set(1); this.applyFilter(); }
  onFilter(value: any): void { this.filter = value; this.page.set(1); this.applyFilter(); }
  onSizeChange(s: number): void { this.size.set(s); this.page.set(1); }

  applyFilter(): void {
    let result = this.filter === null ? this.all() : this.all().filter(r => r.status === this.filter);
    if (this.searchTerm) {
      result = result.filter(r =>
        (r.requestNo || '').toLowerCase().includes(this.searchTerm) ||
        (r.machineName || '').toLowerCase().includes(this.searchTerm) ||
        (r.problemDescription || '').toLowerCase().includes(this.searchTerm) ||
        (r.contactPerson || '').toLowerCase().includes(this.searchTerm)
      );
    }
    this.filtered.set(result);
  }

  doExport(): void {
    exportToCsv(this.filtered(), 'service-requests', [
      { key: 'requestNo', label: 'No.' }, { key: 'machineName', label: 'Machine' },
      { key: 'problemDescription', label: 'Problem' }, { key: 'contactPerson', label: 'Contact' },
      { key: 'contactPhone', label: 'Phone' }, { key: 'priority', label: 'Priority' },
      { key: 'status', label: 'Status' }, { key: 'createdAt', label: 'Created' }
    ]);
  }

  updateStatus(r: ServiceRequest, status: number): void {
    this.api.put(`/service-requests/${r.id}/status`, { status, notes: null }).subscribe({ next: () => this.ngOnInit() });
  }
}
