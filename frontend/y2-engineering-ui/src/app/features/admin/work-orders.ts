import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ApiService } from '../../core/api.service';
import { Machine, Customer, WorkOrder } from '../../core/models';
import { StatusBadge } from '../../shared/components/status-badge';
import { AdminToolbarComponent } from '../../shared/components/admin-toolbar';
import { PaginationComponent } from '../../shared/components/pagination';
import { SkeletonComponent } from '../../shared/components/skeleton';
import { exportToCsv } from '../../shared/utils/csv-export';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-admin-work-orders',
  imports: [CommonModule, StatusBadge, FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatCardModule, AdminToolbarComponent, PaginationComponent, SkeletonComponent, TranslatePipe],
  template: `
    <div class="head">
      <h1>{{ 'ADMIN.WORK_ORDERS' | t }}</h1>
      <button mat-flat-button color="primary" (click)="showForm.set(!showForm())">
        {{ showForm() ? ('ADMIN.DELETE' | t) : '+ New Work Order' }}
      </button>
    </div>

    @if (showForm()) {
      <mat-card class="form-card">
        <mat-card-content>
          <h3>{{ editingId() ? 'Edit Work Order' : 'New Work Order' }}</h3>
          <form (ngSubmit)="save()" class="form">
            <mat-form-field appearance="outline" class="full">
              <mat-label>Title</mat-label>
              <input matInput [(ngModel)]="form.title" name="title" required />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full">
              <mat-label>Problem Description</mat-label>
              <textarea matInput rows="3" [(ngModel)]="form.problemDescription" name="problem" required></textarea>
            </mat-form-field>
            <div class="row">
              <mat-form-field appearance="outline">
                <mat-label>Machine</mat-label>
                <mat-select [(ngModel)]="form.machineId" name="machine">
                  @for (m of machines(); track m.id) {
                    <mat-option [value]="m.id">{{ m.machineNo }} — {{ m.modelName || 'Unknown' }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Customer</mat-label>
                <mat-select [(ngModel)]="form.customerId" name="customer">
                  @for (c of customers(); track c.id) {
                    <mat-option [value]="c.id">{{ c.contactPerson }} ({{ c.companyName || c.customerCode }})</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>
            <div class="row">
              <mat-form-field appearance="outline">
                <mat-label>Priority</mat-label>
                <mat-select [(ngModel)]="form.priority" name="priority">
                  <mat-option [value]="0">Low</mat-option>
                  <mat-option [value]="1">Medium</mat-option>
                  <mat-option [value]="2">High</mat-option>
                  <mat-option [value]="3">Critical</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Status</mat-label>
                <mat-select [(ngModel)]="form.status" name="status">
                  <mat-option [value]="0">Open</mat-option>
                  <mat-option [value]="1">Assigned</mat-option>
                  <mat-option [value]="2">In Progress</mat-option>
                  <mat-option [value]="3">Completed</mat-option>
                  <mat-option [value]="4">Cancelled</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
            <div class="row">
              <mat-form-field appearance="outline">
                <mat-label>Scheduled Date</mat-label>
                <input matInput type="date" [(ngModel)]="form.scheduledDate" name="schedDate" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Parts Used</mat-label>
                <input matInput [(ngModel)]="form.partsUsed" name="parts" placeholder="e.g. Bearing, Belt" />
              </mat-form-field>
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
          <app-skeleton variant="text" width="80px" /><app-skeleton variant="text" width="120px" />
          <app-skeleton variant="text" width="100px" /><app-skeleton variant="text" width="100px" />
          <app-skeleton variant="text" width="70px" /><app-skeleton variant="text" width="90px" />
          <app-skeleton variant="text" width="80px" /><app-skeleton variant="text" width="50px" />
        </div>
        @for (i of [1,2,3,4,5]; track i) {
          <app-skeleton variant="table-row" [columns]="['90px','1fr','1fr','1fr','70px','100px','80px','50px']" />
        }
      </div>
    } @else {
      <app-admin-toolbar
        placeholder="Search work orders..."
        [totalCount]="all().length"
        [filteredCount]="filtered().length"
        (searchChange)="onSearch($event)"
        (exportCsv)="doExport()"
      />

      <div class="table">
        <div class="thead">
          <span>No.</span><span>Title</span>
          <span>Machine</span><span>Customer</span>
          <span>Priority</span><span>Status</span>
          <span>Scheduled</span><span></span>
        </div>
        @for (w of paged(); track w.id) {
          <div class="trow">
            <span class="no">{{ w.workOrderNo }}</span>
            <span>{{ w.title }}</span>
            <span>{{ w.machineName || '—' }}</span>
            <span>{{ w.customerName || '—' }}</span>
            <span><app-status-badge kind="priority" [value]="w.priority" /></span>
            <span><app-status-badge kind="workOrder" [value]="w.status" /></span>
            <span>{{ w.scheduledDate | date: 'mediumDate' }}</span>
            <span class="row-actions">
              <button mat-icon-button color="primary" (click)="edit(w)">edit</button>
            </span>
          </div>
        } @empty {
          <p class="muted">{{ 'ADMIN.NO_WORK_ORDERS' | t }}</p>
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
    .head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .form-card { margin-bottom: 1.5rem; }
    .form { display: grid; gap: .8rem; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .full { width: 100%; }
    .actions { display: flex; gap: .8rem; }
    .skeleton-toolbar { display: flex; gap: 1rem; margin-bottom: 1rem; }
    .skeleton-table { border: 1px solid var(--mat-sys-outline-variant); border-radius: 12px; overflow: hidden; }
    .skel-thead { display: grid; grid-template-columns: 110px 1fr 1fr 1fr 90px 120px 100px 60px; gap: .6rem; padding: .65rem .9rem; background: #f4f7fb; }
    .table { border: 1px solid var(--mat-sys-outline-variant); border-radius: 12px; overflow: hidden; }
    .thead, .trow { display: grid; grid-template-columns: 110px 1fr 1fr 1fr 90px 120px 100px 60px; gap: .6rem; padding: .65rem .9rem; align-items: center; }
    .thead { background: #f4f7fb; font-weight: 700; font-size: .75rem; text-transform: uppercase; color: var(--mat-sys-on-surface-variant); }
    .trow { border-top: 1px solid var(--mat-sys-outline-variant); }
    .no { color: #0b3d91; font-weight: 700; }
    .row-actions { display: flex; gap: .1rem; }
    .ok { color: #1b5e20; }
    .muted { color: var(--mat-sys-on-surface-variant); padding: 1rem; }
  `
})
export class AdminWorkOrdersPage implements OnInit {
  readonly all = signal<WorkOrder[]>([]);
  readonly filtered = signal<WorkOrder[]>([]);
  readonly machines = signal<Machine[]>([]);
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

  form: any = { title: '', problemDescription: '', machineId: '', customerId: '', priority: 1, status: 0, scheduledDate: '', partsUsed: '' };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loading.set(true);
    this.api.get<WorkOrder[]>('/work-orders').subscribe({
      next: w => { this.all.set(w); this.filtered.set(w); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
    this.api.get<Machine[]>('/machines').subscribe({ next: m => this.machines.set(m) });
    this.api.get<Customer[]>('/customers').subscribe({ next: c => this.customers.set(c) });
  }

  onSearch(term: string): void {
    this.searchTerm = term.toLowerCase(); this.page.set(1);
    this.filtered.set(this.searchTerm
      ? this.all().filter(w => (w.workOrderNo || '').toLowerCase().includes(this.searchTerm) || (w.title || '').toLowerCase().includes(this.searchTerm) || (w.machineName || '').toLowerCase().includes(this.searchTerm))
      : this.all());
  }

  onSizeChange(s: number): void { this.size.set(s); this.page.set(1); }

  doExport(): void {
    exportToCsv(this.filtered(), 'work-orders', [
      { key: 'workOrderNo', label: 'No.' }, { key: 'title', label: 'Title' },
      { key: 'machineName', label: 'Machine' }, { key: 'priority', label: 'Priority' },
      { key: 'status', label: 'Status' }, { key: 'scheduledDate', label: 'Scheduled' }
    ]);
  }

  save(): void {
    if (!this.form.title || !this.form.problemDescription) return;
    const body = { ...this.form, scheduledDate: this.form.scheduledDate ? new Date(this.form.scheduledDate).toISOString() : null, projectId: null };
    if (this.editingId()) {
      this.api.put(`/work-orders/${this.editingId()}`, body).subscribe({ next: () => { this.msg.set('Work order updated.'); this.cancel(); this.ngOnInit(); } });
    } else {
      this.api.post('/work-orders', body).subscribe({ next: () => { this.msg.set('Work order created.'); this.cancel(); this.ngOnInit(); } });
    }
  }

  edit(w: WorkOrder): void {
    this.showForm.set(true); this.editingId.set(w.id);
    this.form = { title: w.title, problemDescription: w.problemDescription, machineId: w.machineId || '', customerId: w.customerId || '', priority: w.priority, status: w.status, scheduledDate: w.scheduledDate ? w.scheduledDate.substring(0, 10) : '', partsUsed: w.partsUsed || '' };
  }

  cancel(): void {
    this.showForm.set(false); this.editingId.set(null); this.msg.set('');
    this.form = { title: '', problemDescription: '', machineId: '', customerId: '', priority: 1, status: 0, scheduledDate: '', partsUsed: '' };
  }
}
