import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ServiceRequest, ServiceSummary } from '../../core/models';
import { PageHeader } from '../../shared/components/page-header';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-request-service',
  imports: [PageHeader, FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, TranslatePipe],
  template: `
    <app-page-header [title]="'REQUEST.TITLE' | t"
      [subtitle]="'REQUEST.SUBTITLE' | t" />

    @if (submitted(); as done) {
      <div class="success">
        <h2>{{ 'REQUEST.SUCCESS_TITLE' | t }}</h2>
        <p>{{ 'REQUEST.SUCCESS_NO' | t }} <strong>{{ done.requestNo }}</strong>.</p>
        <p class="muted">{{ 'REQUEST.SUCCESS_NOTE' | t }}</p>
      </div>
    } @else {
      <form class="form" (ngSubmit)="submit()">
        <fieldset>
          <legend>{{ 'REQUEST.SECTION_1' | t }}</legend>
          <div class="row">
            <mat-form-field appearance="outline"><mat-label>{{ 'REQUEST.FULL_NAME' | t }}</mat-label>
              <input matInput [(ngModel)]="form.contactPerson" name="contact" required /></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>{{ 'REQUEST.EMAIL' | t }}</mat-label>
              <input matInput type="email" [(ngModel)]="form.contactEmail" name="email" required /></mat-form-field>
          </div>
          <div class="row">
            <mat-form-field appearance="outline"><mat-label>{{ 'REQUEST.PHONE' | t }}</mat-label>
              <input matInput [(ngModel)]="form.contactPhone" name="phone" /></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>{{ 'REQUEST.CITY' | t }}</mat-label>
              <input matInput [(ngModel)]="form.city" name="city" /></mat-form-field>
          </div>
        </fieldset>

        <fieldset>
          <legend>{{ 'REQUEST.SECTION_2' | t }}</legend>
          <mat-form-field appearance="outline" class="full">
            <mat-label>{{ 'REQUEST.SERVICE' | t }}</mat-label>
            <mat-select [(ngModel)]="form.serviceId" name="service">
              @for (s of services(); track s.id) {
                <mat-option [value]="s.id">{{ s.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </fieldset>

        <fieldset>
          <legend>{{ 'REQUEST.SECTION_3' | t }}</legend>
          <div class="row">
            <mat-form-field appearance="outline"><mat-label>{{ 'REQUEST.MACHINE_NAME' | t }}</mat-label>
              <input matInput [(ngModel)]="form.machineName" name="machineName" /></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>{{ 'REQUEST.MANUFACTURER' | t }}</mat-label>
              <input matInput [(ngModel)]="form.machineManufacturer" name="manufacturer" /></mat-form-field>
          </div>
          <div class="row">
            <mat-form-field appearance="outline"><mat-label>{{ 'REQUEST.MODEL' | t }}</mat-label>
              <input matInput [(ngModel)]="form.machineModel" name="model" /></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>{{ 'REQUEST.SERIAL' | t }}</mat-label>
              <input matInput [(ngModel)]="form.serialNumber" name="serial" /></mat-form-field>
          </div>
        </fieldset>

        <fieldset>
          <legend>{{ 'REQUEST.SECTION_4' | t }}</legend>
          <mat-form-field appearance="outline" class="full">
            <mat-label>{{ 'REQUEST.DESCRIBE' | t }}</mat-label>
            <textarea matInput rows="4" [(ngModel)]="form.problemDescription" name="problem" required></textarea>
          </mat-form-field>
          <div class="row">
            <mat-form-field appearance="outline">
              <mat-label>{{ 'REQUEST.PRIORITY' | t }}</mat-label>
              <mat-select [(ngModel)]="form.priority" name="priority">
                <mat-option [value]="0">{{ 'REQUEST.PRIORITY_LOW' | t }}</mat-option>
                <mat-option [value]="1">{{ 'REQUEST.PRIORITY_MEDIUM' | t }}</mat-option>
                <mat-option [value]="2">{{ 'REQUEST.PRIORITY_HIGH' | t }}</mat-option>
                <mat-option [value]="3">{{ 'REQUEST.PRIORITY_CRITICAL' | t }}</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>{{ 'REQUEST.PREFERRED_DATE' | t }}</mat-label>
              <input matInput type="date" [(ngModel)]="form.preferredDate" name="date" />
            </mat-form-field>
          </div>
        </fieldset>

        <button mat-flat-button color="primary" type="submit" [disabled]="busy()">
          {{ busy() ? ('REQUEST.SUBMITTING' | t) : ('REQUEST.SUBMIT' | t) }}
        </button>
        @if (error()) {
          <p class="error">{{ error() }}</p>
        }
      </form>
    }
  `,
  styles: `
    .form { max-width: 820px; margin: 0 auto; display: grid; gap: 1.5rem; }
    fieldset { border: 1px solid var(--mat-sys-outline-variant); border-radius: 12px; padding: 1.5rem; display: grid; gap: 1rem; }
    legend { font-weight: 700; color: #0b3d91; padding: 0 .4rem; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .full { width: 100%; }
    @media (max-width: 700px) { .row { grid-template-columns: 1fr; } }
    .error { color: #b71c1c; }
    .success { max-width: 640px; margin: 2rem auto; text-align: center; border: 1px solid #e8f5e9; background: #f0faf1; border-radius: 12px; padding: 2.5rem; }
    .muted { color: var(--mat-sys-on-surface-variant); }
  `
})
export class RequestServicePage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);

  readonly services = signal<ServiceSummary[]>([]);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly submitted = signal<ServiceRequest | null>(null);

  readonly form = {
    serviceId: undefined as string | undefined,
    machineName: '',
    machineManufacturer: '',
    machineModel: '',
    serialNumber: '',
    problemDescription: '',
    priority: 1,
    preferredDate: '',
    city: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: ''
  };

  ngOnInit(): void {
    this.api.get<ServiceSummary[]>('/services').subscribe({
      next: s => {
        this.services.set(s);
        const preselected = this.route.snapshot.queryParamMap.get('service');
        if (preselected) {
          this.form.serviceId = preselected;
        }
      }
    });
  }

  submit(): void {
    if (!this.form.problemDescription || !this.form.contactPerson || !this.form.contactEmail) {
      this.error.set('Please fill in your contact information and describe the problem.');
      return;
    }

    this.busy.set(true);
    this.error.set('');

    this.api.post<ServiceRequest>('/service-requests', {
      serviceId: this.form.serviceId,
      machineName: this.form.machineName,
      machineManufacturer: this.form.machineManufacturer,
      machineModel: this.form.machineModel,
      serialNumber: this.form.serialNumber,
      problemDescription: this.form.problemDescription,
      priority: this.form.priority,
      preferredDate: this.form.preferredDate ? new Date(this.form.preferredDate).toISOString() : null,
      city: this.form.city,
      contactPerson: this.form.contactPerson,
      contactEmail: this.form.contactEmail,
      contactPhone: this.form.contactPhone
    }).subscribe({
      next: res => {
        this.busy.set(false);
        this.submitted.set(res);
      },
      error: err => {
        this.busy.set(false);
        this.error.set(err.error?.errors?.join(', ') ?? err.error?.error ?? 'Could not submit your request. Please try again.');
      }
    });
  }
}
