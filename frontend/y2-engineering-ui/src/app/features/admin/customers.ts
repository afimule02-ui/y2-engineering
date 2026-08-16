import { Component, OnInit, signal, computed } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { Customer } from '../../core/models';
import { AdminToolbarComponent } from '../../shared/components/admin-toolbar';
import { PaginationComponent } from '../../shared/components/pagination';
import { SkeletonComponent } from '../../shared/components/skeleton';
import { exportToCsv } from '../../shared/utils/csv-export';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-admin-customers',
  imports: [AdminToolbarComponent, PaginationComponent, SkeletonComponent, TranslatePipe],
  template: `
    <h1>{{ 'ADMIN.CUSTOMERS' | t }}</h1>

    @if (loading()) {
      <div class="skeleton-toolbar">
        <app-skeleton variant="text" width="300px" height="40px" />
        <app-skeleton variant="text" width="120px" height="40px" />
      </div>
      <div class="skeleton-table">
        <div class="skel-thead">
          <app-skeleton variant="text" width="80px" /><app-skeleton variant="text" width="100px" />
          <app-skeleton variant="text" width="120px" /><app-skeleton variant="text" width="150px" />
          <app-skeleton variant="text" width="100px" /><app-skeleton variant="text" width="80px" />
        </div>
        @for (i of [1,2,3,4,5]; track i) {
          <app-skeleton variant="table-row" [columns]="['90px','130px','1fr','1fr','100px','90px']" />
        }
      </div>
    } @else {
      <app-admin-toolbar
        placeholder="Search customers..."
        [totalCount]="all().length"
        [filteredCount]="filtered().length"
        (searchChange)="onSearch($event)"
        (exportCsv)="doExport()"
      />

      <div class="table">
        <div class="thead"><span>Code</span><span>Contact</span><span>Company</span><span>Email</span><span>Phone</span><span>City</span></div>
        @for (c of paged(); track c.id) {
          <div class="trow">
            <span class="code">{{ c.customerCode }}</span>
            <span>{{ c.contactPerson }}</span>
            <span>{{ c.companyName || '—' }}</span>
            <span>{{ c.email || '—' }}</span>
            <span>{{ c.phone || '—' }}</span>
            <span>{{ c.city || '—' }}</span>
          </div>
        } @empty {
          <p class="muted">{{ 'ADMIN.NO_CUSTOMERS' | t }}</p>
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
    .skeleton-toolbar { display: flex; gap: 1rem; margin-bottom: 1rem; }
    .skeleton-table { border: 1px solid var(--mat-sys-outline-variant); border-radius: 12px; overflow: hidden; }
    .skel-thead { display: grid; grid-template-columns: 110px 160px 1fr 1fr 130px 110px; gap: 1rem; padding: .7rem 1rem; background: #f4f7fb; }
    .table { border: 1px solid var(--mat-sys-outline-variant); border-radius: 12px; overflow: hidden; margin-top: 1rem; }
    .thead, .trow { display: grid; grid-template-columns: 110px 160px 1fr 1fr 130px 110px; gap: 1rem; padding: .7rem 1rem; align-items: center; }
    .thead { background: #f4f7fb; font-weight: 700; font-size: .8rem; text-transform: uppercase; color: var(--mat-sys-on-surface-variant); }
    .trow { border-top: 1px solid var(--mat-sys-outline-variant); }
    .code { color: #0b3d91; font-weight: 700; }
    .muted { color: var(--mat-sys-on-surface-variant); padding: 1rem; }
  `
})
export class AdminCustomersPage implements OnInit {
  readonly all = signal<Customer[]>([]);
  readonly filtered = signal<Customer[]>([]);
  readonly page = signal(1);
  readonly size = signal(10);
  readonly loading = signal(true);
  searchTerm = '';

  readonly paged = computed(() => {
    const start = (this.page() - 1) * this.size();
    return this.filtered().slice(start, start + this.size());
  });

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loading.set(true);
    this.api.get<Customer[]>('/customers').subscribe({
      next: c => { this.all.set(c); this.filtered.set(c); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onSearch(term: string): void {
    this.searchTerm = term.toLowerCase(); this.page.set(1);
    this.filtered.set(this.searchTerm
      ? this.all().filter(c => (c.contactPerson || '').toLowerCase().includes(this.searchTerm) || (c.companyName || '').toLowerCase().includes(this.searchTerm) || (c.email || '').toLowerCase().includes(this.searchTerm) || (c.customerCode || '').toLowerCase().includes(this.searchTerm))
      : this.all());
  }

  onSizeChange(s: number): void { this.size.set(s); this.page.set(1); }

  doExport(): void {
    exportToCsv(this.filtered(), 'customers', [
      { key: 'customerCode', label: 'Code' }, { key: 'contactPerson', label: 'Contact' },
      { key: 'companyName', label: 'Company' }, { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' }, { key: 'city', label: 'City' }
    ]);
  }
}
