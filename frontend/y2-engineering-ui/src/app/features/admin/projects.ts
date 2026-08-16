import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { ApiService } from '../../core/api.service';
import { Customer, Project } from '../../core/models';
import { StatusBadge } from '../../shared/components/status-badge';
import { AdminToolbarComponent } from '../../shared/components/admin-toolbar';
import { PaginationComponent } from '../../shared/components/pagination';
import { SkeletonComponent } from '../../shared/components/skeleton';
import { exportToCsv } from '../../shared/utils/csv-export';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-admin-projects',
  imports: [CommonModule, StatusBadge, MatProgressBarModule, FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatCardModule, AdminToolbarComponent, PaginationComponent, SkeletonComponent, TranslatePipe],
  template: `
    <div class="head">
      <h1>{{ 'NAV.PROJECTS' | t }}</h1>
      <button mat-flat-button color="primary" (click)="showForm.set(!showForm())">
        {{ showForm() ? 'Close' : '+ New Project' }}
      </button>
    </div>

    @if (showForm()) {
      <mat-card class="form-card">
        <mat-card-content>
          <h3>{{ editingId() ? 'Edit Project' : 'New Project' }}</h3>
          <form (ngSubmit)="save()" class="form">
            <div class="row">
              <mat-form-field appearance="outline"><mat-label>Project Name</mat-label>
                <input matInput [(ngModel)]="form.name" name="name" required /></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Customer</mat-label>
                <mat-select [(ngModel)]="form.customerId" name="customer">
                  @for (c of customers(); track c.id) { <mat-option [value]="c.id">{{ c.contactPerson }} ({{ c.companyName || c.customerCode }})</mat-option> }
                </mat-select>
              </mat-form-field>
            </div>
            <mat-form-field appearance="outline" class="full"><mat-label>Description</mat-label>
              <textarea matInput rows="3" [(ngModel)]="form.description" name="desc"></textarea></mat-form-field>
            <div class="row">
              <mat-form-field appearance="outline"><mat-label>Start Date</mat-label>
                <input matInput type="date" [(ngModel)]="form.startDate" name="start" /></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>End Date</mat-label>
                <input matInput type="date" [(ngModel)]="form.endDate" name="end" /></mat-form-field>
            </div>
            <div class="row">
              <mat-form-field appearance="outline"><mat-label>Status</mat-label>
                <mat-select [(ngModel)]="form.status" name="status">
                  <mat-option [value]="0">Not Started</mat-option>
                  <mat-option [value]="1">In Progress</mat-option>
                  <mat-option [value]="2">On Hold</mat-option>
                  <mat-option [value]="3">Completed</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Progress (%)</mat-label>
                <input matInput type="number" [(ngModel)]="form.progress" name="progress" min="0" max="100" /></mat-form-field>
            </div>
            <mat-form-field appearance="outline"><mat-label>Budget (ETB)</mat-label>
              <input matInput type="number" [(ngModel)]="form.budget" name="budget" /></mat-form-field>
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
      <div class="skeleton-grid">
        @for (i of [1,2,3,4,5,6]; track i) {
          <app-skeleton variant="card" height="180px" />
        }
      </div>
    } @else {
      <app-admin-toolbar
        placeholder="Search projects..."
        [totalCount]="all().length"
        [filteredCount]="filtered().length"
        (searchChange)="onSearch($event)"
        (exportCsv)="doExport()"
      />

      <div class="list">
        @for (p of paged(); track p.id) {
          <article class="item">
            <div class="item-top">
              <strong>{{ p.projectNo }}</strong>
              <app-status-badge kind="project" [value]="p.status" />
              <span class="pct">{{ p.progress }}%</span>
            </div>
            <h3>{{ p.name }}</h3>
            <p class="muted">{{ p.customerName || '—' }} · {{ p.budget | currency: 'ETB ' }}</p>
            <mat-progress-bar mode="determinate" [value]="p.progress" />
            <div class="item-actions">
              <button mat-icon-button color="primary" (click)="edit(p)">edit</button>
              <button mat-icon-button color="warn" (click)="remove(p.id)">delete</button>
            </div>
          </article>
        } @empty { <p class="muted">{{ 'ADMIN.NO_PROJECTS' | t }}</p> }
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
    .skeleton-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.2rem; }
    .list { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.2rem; }
    .item { border: 1px solid var(--mat-sys-outline-variant); border-radius: 12px; padding: 1.2rem; }
    .item-top { display: flex; align-items: center; gap: .6rem; }
    .pct { margin-left: auto; color: var(--mat-sys-on-surface-variant); font-size: .85rem; }
    .item-actions { display: flex; gap: .3rem; margin-top: .6rem; }
    .muted { color: var(--mat-sys-on-surface-variant); font-size: .85rem; }
    .ok { color: #1b5e20; }
  `
})
export class AdminProjectsPage implements OnInit {
  readonly all = signal<Project[]>([]);
  readonly filtered = signal<Project[]>([]);
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

  form: any = { name: '', customerId: '', description: '', startDate: '', endDate: '', status: 0, progress: 0, budget: 0 };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loading.set(true);
    this.api.get<Project[]>('/projects').subscribe({
      next: p => { this.all.set(p); this.filtered.set(p); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
    this.api.get<Customer[]>('/customers').subscribe({ next: c => this.customers.set(c) });
  }

  onSearch(term: string): void {
    this.searchTerm = term.toLowerCase(); this.page.set(1);
    this.filtered.set(this.searchTerm
      ? this.all().filter(p => (p.projectNo || '').toLowerCase().includes(this.searchTerm) || (p.name || '').toLowerCase().includes(this.searchTerm) || (p.customerName || '').toLowerCase().includes(this.searchTerm))
      : this.all());
  }

  onSizeChange(s: number): void { this.size.set(s); this.page.set(1); }

  doExport(): void {
    exportToCsv(this.filtered(), 'projects', [
      { key: 'projectNo', label: 'No.' }, { key: 'name', label: 'Name' },
      { key: 'customerName', label: 'Customer' }, { key: 'budget', label: 'Budget' },
      { key: 'status', label: 'Status' }, { key: 'progress', label: 'Progress' }
    ]);
  }

  save(): void {
    if (!this.form.name.trim()) return;
    const body = { ...this.form, startDate: this.form.startDate ? new Date(this.form.startDate).toISOString() : null, endDate: this.form.endDate ? new Date(this.form.endDate).toISOString() : null, progress: Number(this.form.progress) || 0, budget: Number(this.form.budget) || 0 };
    if (this.editingId()) {
      this.api.put(`/projects/${this.editingId()}`, body).subscribe({ next: () => { this.msg.set('Project updated.'); this.cancel(); this.ngOnInit(); } });
    } else {
      this.api.post('/projects', body).subscribe({ next: () => { this.msg.set('Project created.'); this.cancel(); this.ngOnInit(); } });
    }
  }

  edit(p: Project): void {
    this.showForm.set(true); this.editingId.set(p.id);
    this.form = { name: p.name, customerId: p.customerId || '', description: p.description || '', startDate: p.startDate ? p.startDate.substring(0, 10) : '', endDate: p.endDate ? p.endDate.substring(0, 10) : '', status: p.status, progress: p.progress, budget: p.budget };
  }

  cancel(): void {
    this.showForm.set(false); this.editingId.set(null); this.msg.set('');
    this.form = { name: '', customerId: '', description: '', startDate: '', endDate: '', status: 0, progress: 0, budget: 0 };
  }

  remove(id: string): void {
    if (!confirm('Delete this project?')) return;
    this.api.delete(`/projects/${id}`).subscribe({ next: () => { this.msg.set('Deleted.'); this.ngOnInit(); } });
  }
}
