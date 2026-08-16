import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ApiService } from '../../core/api.service';
import { Customer, Machine } from '../../core/models';
import { StatusBadge } from '../../shared/components/status-badge';
import { AdminToolbarComponent } from '../../shared/components/admin-toolbar';
import { PaginationComponent } from '../../shared/components/pagination';
import { SkeletonComponent } from '../../shared/components/skeleton';
import { exportToCsv } from '../../shared/utils/csv-export';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-admin-machines',
  imports: [StatusBadge, FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatCardModule, AdminToolbarComponent, PaginationComponent, SkeletonComponent, TranslatePipe],
  template: `
    <div class="head">
      <h1>{{ 'ADMIN.MACHINES' | t }}</h1>
      <button mat-flat-button color="primary" (click)="showForm.set(!showForm())">
        {{ showForm() ? ('ADMIN.DELETE' | t) : '+ New Machine' }}
      </button>
    </div>

    @if (showForm()) {
      <mat-card class="form-card">
        <mat-card-content>
          <h3>{{ editingId() ? 'Edit Machine' : 'New Machine' }}</h3>
          <form (ngSubmit)="save()" class="form">
            <div class="row">
              <mat-form-field appearance="outline"><mat-label>Model Name</mat-label>
                <input matInput [(ngModel)]="form.modelName" name="model" /></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Customer</mat-label>
                <mat-select [(ngModel)]="form.customerId" name="customer">
                  @for (c of customers(); track c.id) { <mat-option [value]="c.id">{{ c.contactPerson }} ({{ c.companyName || c.customerCode }})</mat-option> }
                </mat-select>
              </mat-form-field>
            </div>
            <div class="row">
              <mat-form-field appearance="outline"><mat-label>Serial Number</mat-label>
                <input matInput [(ngModel)]="form.serialNumber" name="serial" /></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Location</mat-label>
                <input matInput [(ngModel)]="form.location" name="location" /></mat-form-field>
            </div>
            <div class="row">
              <mat-form-field appearance="outline"><mat-label>Status</mat-label>
                <mat-select [(ngModel)]="form.status" name="status">
                  <mat-option [value]="0">Operational</mat-option>
                  <mat-option [value]="1">Under Maintenance</mat-option>
                  <mat-option [value]="2">Out of Service</mat-option>
                  <mat-option [value]="3">Decommissioned</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Installation Date</mat-label>
                <input matInput type="date" [(ngModel)]="form.installationDate" name="instDate" /></mat-form-field>
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
          <app-skeleton variant="text" width="80px" /><app-skeleton variant="text" width="100px" />
          <app-skeleton variant="text" width="120px" /><app-skeleton variant="text" width="100px" />
          <app-skeleton variant="text" width="100px" /><app-skeleton variant="text" width="90px" />
          <app-skeleton variant="text" width="60px" />
        </div>
        @for (i of [1,2,3,4,5]; track i) {
          <app-skeleton variant="table-row" [columns]="['80px','1fr','1fr','1fr','100px','100px','70px']" />
        }
      </div>
    } @else {
      <app-admin-toolbar
        placeholder="Search machines..."
        [totalCount]="all().length"
        [filteredCount]="filtered().length"
        (searchChange)="onSearch($event)"
        (exportCsv)="doExport()"
      />

      <div class="table">
        <div class="thead"><span>No.</span><span>Machine</span><span>Customer</span><span>Serial</span><span>Location</span><span>Status</span><span></span></div>
        @for (m of paged(); track m.id) {
          <div class="trow">
            <span class="no">{{ m.machineNo }}</span>
            <span>{{ m.modelName || '—' }}</span>
            <span>{{ m.customerName || '—' }}</span>
            <span>{{ m.serialNumber || '—' }}</span>
            <span>{{ m.location || '—' }}</span>
            <span><app-status-badge kind="machine" [value]="m.status" /></span>
            <span class="row-actions">
              <button mat-icon-button color="primary" (click)="edit(m)">edit</button>
              <button mat-icon-button color="warn" (click)="remove(m.id)">delete</button>
            </span>
          </div>
        } @empty { <p class="muted">{{ 'ADMIN.NO_MACHINES' | t }}</p> }
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
    .actions { display: flex; gap: .8rem; }
    .skeleton-toolbar { display: flex; gap: 1rem; margin-bottom: 1rem; }
    .skeleton-table { border: 1px solid var(--mat-sys-outline-variant); border-radius: 12px; overflow: hidden; }
    .skel-thead { display: grid; grid-template-columns: 100px 1fr 1fr 1fr 1fr 130px 80px; gap: .8rem; padding: .7rem 1rem; background: #f4f7fb; }
    .table { border: 1px solid var(--mat-sys-outline-variant); border-radius: 12px; overflow: hidden; margin-top: 1rem; }
    .thead, .trow { display: grid; grid-template-columns: 100px 1fr 1fr 1fr 1fr 130px 80px; gap: .8rem; padding: .7rem 1rem; align-items: center; }
    .thead { background: #f4f7fb; font-weight: 700; font-size: .8rem; text-transform: uppercase; color: var(--mat-sys-on-surface-variant); }
    .trow { border-top: 1px solid var(--mat-sys-outline-variant); }
    .no { color: #0b3d91; font-weight: 700; }
    .row-actions { display: flex; gap: .1rem; }
    .ok { color: #1b5e20; }
    .muted { color: var(--mat-sys-on-surface-variant); padding: 1rem; }
  `
})
export class AdminMachinesPage implements OnInit {
  readonly all = signal<Machine[]>([]);
  readonly filtered = signal<Machine[]>([]);
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

  form: any = { modelName: '', customerId: '', serialNumber: '', location: '', status: 0, installationDate: '' };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loading.set(true);
    this.api.get<Machine[]>('/machines').subscribe({
      next: m => { this.all.set(m); this.filtered.set(m); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
    this.api.get<Customer[]>('/customers').subscribe({ next: c => this.customers.set(c) });
  }

  onSearch(term: string): void {
    this.searchTerm = term.toLowerCase(); this.page.set(1);
    this.filtered.set(this.searchTerm
      ? this.all().filter(m => (m.machineNo || '').toLowerCase().includes(this.searchTerm) || (m.modelName || '').toLowerCase().includes(this.searchTerm) || (m.customerName || '').toLowerCase().includes(this.searchTerm) || (m.serialNumber || '').toLowerCase().includes(this.searchTerm))
      : this.all());
  }

  onSizeChange(s: number): void { this.size.set(s); this.page.set(1); }

  doExport(): void {
    exportToCsv(this.filtered(), 'machines', [
      { key: 'machineNo', label: 'No.' }, { key: 'modelName', label: 'Model' },
      { key: 'customerName', label: 'Customer' }, { key: 'serialNumber', label: 'Serial' },
      { key: 'location', label: 'Location' }, { key: 'status', label: 'Status' }
    ]);
  }

  save(): void {
    const body = { ...this.form, installationDate: this.form.installationDate ? new Date(this.form.installationDate).toISOString() : null };
    if (this.editingId()) {
      this.api.put(`/machines/${this.editingId()}`, body).subscribe({ next: () => { this.msg.set('Machine updated.'); this.cancel(); this.ngOnInit(); } });
    } else {
      this.api.post('/machines', body).subscribe({ next: () => { this.msg.set('Machine created.'); this.cancel(); this.ngOnInit(); } });
    }
  }

  edit(m: Machine): void {
    this.showForm.set(true); this.editingId.set(m.id);
    this.form = { modelName: m.modelName || '', customerId: m.customerId || '', serialNumber: m.serialNumber || '', location: m.location || '', status: m.status, installationDate: m.installationDate ? m.installationDate.substring(0, 10) : '' };
  }

  cancel(): void {
    this.showForm.set(false); this.editingId.set(null); this.msg.set('');
    this.form = { modelName: '', customerId: '', serialNumber: '', location: '', status: 0, installationDate: '' };
  }

  remove(id: string): void {
    if (!confirm('Delete this machine?')) return;
    this.api.delete(`/machines/${id}`).subscribe({ next: () => { this.msg.set('Deleted.'); this.ngOnInit(); } });
  }
}
