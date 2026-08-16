import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ApiService } from '../../core/api.service';
import { Customer, QuotationSummary } from '../../core/models';
import { StatusBadge } from '../../shared/components/status-badge';
import { AdminToolbarComponent } from '../../shared/components/admin-toolbar';
import { PaginationComponent } from '../../shared/components/pagination';
import { SkeletonComponent } from '../../shared/components/skeleton';
import { exportToCsv } from '../../shared/utils/csv-export';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-admin-quotations',
  imports: [CommonModule, StatusBadge, FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatCardModule, AdminToolbarComponent, PaginationComponent, SkeletonComponent, TranslatePipe],
  template: `
    <div class="head">
      <h1>{{ 'CUSTOMER.QUOTATIONS' | t }}</h1>
      <button mat-flat-button color="primary" (click)="showForm.set(!showForm())">
        {{ showForm() ? 'Close' : ('ADMIN.CREATE_QUOTATION' | t) }}
      </button>
    </div>

    @if (showForm()) {
      <mat-card class="form-card">
        <mat-card-content>
          <h3>{{ editingId() ? 'Edit Quotation' : 'New Quotation' }}</h3>
          <form (ngSubmit)="save()" class="form">
            <div class="row">
              <mat-form-field appearance="outline"><mat-label>{{ 'ADMIN.TITLE_LABEL' | t }}</mat-label>
                <input matInput [(ngModel)]="form.title" name="title" required /></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>{{ 'ADMIN.CUSTOMER' | t }}</mat-label>
                <mat-select [(ngModel)]="form.customerId" name="customer">
                  @for (c of customers(); track c.id) { <mat-option [value]="c.id">{{ c.contactPerson }} ({{ c.companyName || c.customerCode }})</mat-option> }
                </mat-select>
              </mat-form-field>
            </div>
            <mat-form-field appearance="outline" class="full"><mat-label>{{ 'ADMIN.ITEM_DESC' | t }}</mat-label>
              <input matInput [(ngModel)]="form.itemDescription" name="item" required /></mat-form-field>
            <div class="row">
              <mat-form-field appearance="outline"><mat-label>{{ 'ADMIN.QUANTITY' | t }}</mat-label>
                <input matInput type="number" [(ngModel)]="form.quantity" name="qty" /></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>{{ 'ADMIN.UNIT_PRICE' | t }}</mat-label>
                <input matInput type="number" [(ngModel)]="form.unitPrice" name="price" /></mat-form-field>
            </div>
            <div class="actions">
              <button mat-flat-button color="primary" type="submit">{{ editingId() ? 'Update' : 'Create' }}</button>
              <button mat-stroked-button type="button" (click)="cancel()">Cancel</button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    }

    @if (msg()) { <p class="ok">{{ msg() }}</p> }

    @if (loading()) {
      <div class="skeleton-toolbar">
        <app-skeleton variant="text" width="300px" height="40px" />
        <app-skeleton variant="text" width="120px" height="40px" />
      </div>
      <div class="skeleton-table">
        <div class="skel-thead">
          <app-skeleton variant="text" width="100px" /><app-skeleton variant="text" width="120px" />
          <app-skeleton variant="text" width="120px" /><app-skeleton variant="text" width="80px" />
          <app-skeleton variant="text" width="90px" /><app-skeleton variant="text" width="50px" />
        </div>
        @for (i of [1,2,3,4,5]; track i) {
          <app-skeleton variant="table-row" [columns]="['100px','1fr','1fr','100px','90px','50px']" />
        }
      </div>
    } @else {
      <app-admin-toolbar
        placeholder="Search quotations..."
        [totalCount]="all().length"
        [filteredCount]="filtered().length"
        (searchChange)="onSearch($event)"
        (exportCsv)="doExport()"
      />

      <div class="table">
        <div class="thead"><span>No.</span><span>Title</span><span>Customer</span><span>Total</span><span>Status</span><span></span></div>
        @for (q of paged(); track q.id) {
          <div class="trow">
            <span class="no">{{ q.quotationNo }}</span>
            <span>{{ q.title }}</span>
            <span>{{ q.customerName || '—' }}</span>
            <span>{{ q.total | currency: 'ETB ' }}</span>
            <span><app-status-badge kind="quotation" [value]="q.status" /></span>
            <span class="row-actions">
              <button mat-icon-button color="primary" (click)="edit(q)">edit</button>
            </span>
          </div>
        } @empty { <p class="muted">{{ 'ADMIN.NO_QUOTATIONS' | t }}</p> }
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
    .head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .form-card { margin-bottom: 1.5rem; }
    .form { display: grid; gap: .8rem; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .full { width: 100%; }
    .actions { display: flex; gap: .8rem; }
    .skeleton-toolbar { display: flex; gap: 1rem; margin-bottom: 1rem; }
    .skeleton-table { border: 1px solid var(--mat-sys-outline-variant); border-radius: 12px; overflow: hidden; }
    .skel-thead { display: grid; grid-template-columns: 130px 1fr 1fr 130px 120px 60px; gap: 1rem; padding: .7rem 1rem; background: #f4f7fb; }
    .table { border: 1px solid var(--mat-sys-outline-variant); border-radius: 12px; overflow: hidden; }
    .thead, .trow { display: grid; grid-template-columns: 130px 1fr 1fr 130px 120px 60px; gap: 1rem; padding: .7rem 1rem; align-items: center; }
    .thead { background: #f4f7fb; font-weight: 700; font-size: .8rem; text-transform: uppercase; color: var(--mat-sys-on-surface-variant); }
    .trow { border-top: 1px solid var(--mat-sys-outline-variant); }
    .no { color: #0b3d91; font-weight: 700; }
    .row-actions { display: flex; gap: .1rem; }
    .ok { color: #1b5e20; }
    .muted { color: var(--mat-sys-on-surface-variant); padding: 1rem; }
  `
})
export class AdminQuotationsPage implements OnInit {
  readonly all = signal<QuotationSummary[]>([]);
  readonly filtered = signal<QuotationSummary[]>([]);
  readonly customers = signal<Customer[]>([]);
  readonly showForm = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly msg = signal('');
  readonly page = signal(1);
  readonly size = signal(10);
  readonly loading = signal(true);
  searchTerm = '';

  readonly paged = computed(() => {
    const start = (this.page() - 1) * this.size();
    return this.filtered().slice(start, start + this.size());
  });

  form = { title: '', customerId: undefined as string | undefined, itemDescription: '', quantity: 1, unitPrice: 0 };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loading.set(true);
    this.api.get<QuotationSummary[]>('/quotations').subscribe({
      next: q => { this.all.set(q); this.filtered.set(q); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
    this.api.get<Customer[]>('/customers').subscribe({ next: c => this.customers.set(c) });
  }

  onSearch(term: string): void {
    this.searchTerm = term.toLowerCase(); this.page.set(1);
    this.filtered.set(this.searchTerm
      ? this.all().filter(q => (q.quotationNo || '').toLowerCase().includes(this.searchTerm) || (q.title || '').toLowerCase().includes(this.searchTerm) || (q.customerName || '').toLowerCase().includes(this.searchTerm))
      : this.all());
  }

  onSizeChange(s: number): void { this.size.set(s); this.page.set(1); }

  doExport(): void {
    exportToCsv(this.filtered(), 'quotations', [
      { key: 'quotationNo', label: 'No.' }, { key: 'title', label: 'Title' },
      { key: 'customerName', label: 'Customer' }, { key: 'total', label: 'Total' },
      { key: 'status', label: 'Status' }, { key: 'issueDate', label: 'Issue Date' }
    ]);
  }

  save(): void {
    if (!this.form.title || !this.form.itemDescription || !this.form.customerId) return;
    if (this.editingId()) {
      this.api.put(`/quotations/${this.editingId()}`, this.form).subscribe({ next: () => { this.msg.set('Quotation updated.'); this.cancel(); this.ngOnInit(); } });
    } else {
      this.api.post('/quotations', { customerId: this.form.customerId, title: this.form.title, taxRate: 15, discount: 0, items: [{ description: this.form.itemDescription, quantity: Number(this.form.quantity) || 1, unitPrice: Number(this.form.unitPrice) || 0 }] }).subscribe({
        next: () => { this.msg.set('Quotation created.'); this.cancel(); this.ngOnInit(); }
      });
    }
  }

  edit(q: QuotationSummary): void {
    this.showForm.set(true); this.editingId.set(q.id);
    this.form = { title: q.title, customerId: undefined, itemDescription: '', quantity: 1, unitPrice: q.total };
  }

  cancel(): void {
    this.showForm.set(false); this.editingId.set(null); this.msg.set('');
    this.form = { title: '', customerId: undefined, itemDescription: '', quantity: 1, unitPrice: 0 };
  }
}
