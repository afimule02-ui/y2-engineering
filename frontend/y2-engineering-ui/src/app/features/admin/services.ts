import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ApiService } from '../../core/api.service';
import { ServiceDetail } from '../../core/models';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-admin-services',
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSlideToggleModule, MatSelectModule, MatCardModule, TranslatePipe],
  template: `
    <div class="head">
      <h1>{{ 'NAV.SERVICES' | t }}</h1>
      <button mat-flat-button color="primary" (click)="showForm.set(!showForm())">
        {{ showForm() ? ('ADMIN.DELETE' | t) : ('ADMIN.ADD_SERVICE' | t) }}
      </button>
    </div>

    @if (showForm()) {
      <mat-card class="form-card">
        <mat-card-content>
          <h3>{{ editingId() ? 'Edit Service' : 'New Service' }}</h3>
          <form (ngSubmit)="save()" class="form">
            <div class="row">
              <mat-form-field appearance="outline">
                <mat-label>{{ 'ADMIN.SERVICE_NAME' | t }}</mat-label>
                <input matInput [(ngModel)]="form.name" name="name" required />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Material Icon</mat-label>
                <mat-select [(ngModel)]="form.icon" name="icon">
                  @for (icon of iconOptions; track icon) {
                    <mat-option [value]="icon">{{ icon }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>
            <mat-form-field appearance="outline" class="full">
              <mat-label>{{ 'ADMIN.SHORT_DESC' | t }}</mat-label>
              <input matInput [(ngModel)]="form.shortDescription" name="short" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full">
              <mat-label>Full Description</mat-label>
              <textarea matInput rows="4" [(ngModel)]="form.description" name="desc"></textarea>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full">
              <mat-label>Process / How it works</mat-label>
              <textarea matInput rows="3" [(ngModel)]="form.process" name="process"></textarea>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full">
              <mat-label>Industries Served</mat-label>
              <input matInput [(ngModel)]="form.industriesServed" name="industries" />
            </mat-form-field>
            <div class="row">
              <mat-form-field appearance="outline">
                <mat-label>Sort Order</mat-label>
                <input matInput type="number" [(ngModel)]="form.sortOrder" name="sort" />
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
    @if (err()) { <p class="error">{{ err() }}</p> }

    <div class="list">
      @for (s of services(); track s.id) {
        <div class="item">
          <div class="item-icon">
            <span class="mat-icon-wrap">{{ s.icon || 'settings' }}</span>
          </div>
          <div class="item-info">
            <div class="item-top">
              <strong>{{ s.name }}</strong>
              <span class="slug">/{{ s.slug }}</span>
            </div>
            <p>{{ s.shortDescription }}</p>
          </div>
          <div class="item-actions">
            <mat-slide-toggle [checked]="s.isActive" (change)="toggleActive(s)">{{ s.isActive ? ('ADMIN.ACTIVE' | t) : 'Inactive' }}</mat-slide-toggle>
            <button mat-icon-button color="primary" (click)="edit(s)">edit</button>
            <button mat-icon-button color="warn" (click)="remove(s.id)">delete</button>
          </div>
        </div>
      } @empty {
        <p class="muted">{{ 'ADMIN.NO_SERVICE_REQUESTS' | t }}</p>
      }
    </div>
  `,
  styles: `
    .head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .form-card { margin-bottom: 1.5rem; }
    .form { display: grid; gap: .8rem; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .full { width: 100%; }
    .actions { display: flex; gap: .8rem; }
    .list { display: grid; gap: .6rem; }
    .item {
      display: flex; align-items: center; gap: 1rem; padding: 1rem;
      border: 1px solid var(--mat-sys-outline-variant); border-radius: 10px;
    }
    .item-icon { width: 44px; height: 44px; border-radius: 10px; background: #e3edfb; display: grid; place-items: center; }
    .mat-icon-wrap { font-family: 'Material Icons'; color: #0b3d91; font-size: 24px; }
    .item-info { flex: 1; min-width: 0; }
    .item-top { display: flex; gap: .5rem; align-items: center; }
    .slug { color: #0b3d91; font-size: .8rem; }
    .item-info p { color: var(--mat-sys-on-surface-variant); font-size: .85rem; margin: .2rem 0 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .item-actions { display: flex; align-items: center; gap: .3rem; }
    .ok { color: #1b5e20; }
    .error { color: #b71c1c; }
    .muted { color: var(--mat-sys-on-surface-variant); padding: 1rem; text-align: center; }
  `
})
export class AdminServicesPage implements OnInit {
  readonly services = signal<ServiceDetail[]>([]);
  readonly showForm = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly msg = signal('');
  readonly err = signal('');

  readonly iconOptions = [
    'settings', 'build', 'engineering', 'handyman', 'precision_manufacturing',
    'construction', 'plumbing', 'electrical_services', 'power', 'bolt',
    'factory', 'inventory_2', 'school', 'groups', 'school'
  ];

  form = { name: '', shortDescription: '', description: '', icon: 'settings', process: '', industriesServed: '', sortOrder: 0 };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.get<ServiceDetail[]>('/services/manage').subscribe({
      next: s => this.services.set(s)
    });
  }

  save(): void {
    if (!this.form.name.trim()) return;
    const body = { ...this.form, shortDescription: this.form.shortDescription || this.form.description?.substring(0, 120) || '', description: this.form.description || this.form.shortDescription };

    if (this.editingId()) {
      this.api.put(`/services/${this.editingId()}`, body).subscribe({
        next: () => { this.msg.set('Service updated.'); this.cancel(); this.ngOnInit(); },
        error: e => this.err.set(e.error?.error || 'Update failed.')
      });
    } else {
      this.api.post('/services', body).subscribe({
        next: () => { this.msg.set('Service created.'); this.cancel(); this.ngOnInit(); },
        error: e => this.err.set(e.error?.error || 'Create failed.')
      });
    }
  }

  edit(s: ServiceDetail): void {
    this.showForm.set(true);
    this.editingId.set(s.id);
    this.form = { name: s.name, shortDescription: s.shortDescription, description: s.description, icon: s.icon || 'settings', process: s.process || '', industriesServed: s.industriesServed || '', sortOrder: s.sortOrder };
    this.msg.set(''); this.err.set('');
  }

  cancel(): void {
    this.showForm.set(false);
    this.editingId.set(null);
    this.form = { name: '', shortDescription: '', description: '', icon: 'settings', process: '', industriesServed: '', sortOrder: 0 };
    this.msg.set(''); this.err.set('');
  }

  toggleActive(s: ServiceDetail): void {
    this.api.put(`/services/${s.id}`, { isActive: !s.isActive }).subscribe({ next: () => this.ngOnInit() });
  }

  remove(id: string): void {
    if (!confirm('Delete this service?')) return;
    this.api.delete(`/services/${id}`).subscribe({ next: () => { this.msg.set('Deleted.'); this.ngOnInit(); } });
  }
}
