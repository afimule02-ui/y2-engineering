import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { Certificate } from '../../core/models';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-verify-certificate',
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, TranslatePipe],
  template: `
    <div class="wrap">
      <h1>{{ 'VERIFY.TITLE' | t }}</h1>
      <p class="muted">{{ 'VERIFY.SUBTITLE' | t }} <code>Y2-2026-00001</code>.</p>
      <div class="row">
        <mat-form-field appearance="outline">
          <mat-label>{{ 'VERIFY.CERT_NO' | t }}</mat-label>
          <input matInput [(ngModel)]="query" (keyup.enter)="verify()" />
        </mat-form-field>
        <button mat-flat-button color="primary" (click)="verify()">{{ 'VERIFY.BTN' | t }}</button>
      </div>

      @if (result(); as c) {
        <div class="result">
          <div class="seal">✔</div>
          <h2>{{ 'VERIFY.VALID' | t }}</h2>
          <p><strong>{{ c.studentName }}</strong> {{ 'VERIFY.COMPLETED' | t }}
            <strong>{{ c.courseTitle }}</strong> {{ 'VERIFY.ON' | t }} {{ c.issueDate | date: 'longDate' }}.</p>
          <p class="no">{{ 'VERIFY.CERT_NO_LABEL' | t }} {{ c.certificateNo }}</p>
        </div>
      } @else if (checked()) {
        <p class="invalid">{{ 'VERIFY.NOT_FOUND' | t }}</p>
      }
    </div>
  `,
  styles: `
    .wrap { max-width: 560px; margin: 3rem auto; text-align: center; }
    .row { display: flex; gap: .8rem; align-items: center; justify-content: center; }
    .result { margin-top: 2rem; border: 1px solid #e8f5e9; background: #f0faf1; border-radius: 12px; padding: 2rem; }
    .seal { width: 52px; height: 52px; border-radius: 50%; background: #2e7d32; color: #fff; display: grid; place-items: center; margin: 0 auto 1rem; font-size: 1.6rem; }
    .no { color: var(--mat-sys-on-surface-variant); font-size: .9rem; }
    .invalid { color: #b71c1c; margin-top: 1.5rem; }
    .muted { color: var(--mat-sys-on-surface-variant); }
  `
})
export class VerifyCertificatePage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  query = '';
  readonly result = signal<Certificate | null>(null);
  readonly checked = signal(false);

  ngOnInit(): void {
    this.query = this.route.snapshot.paramMap.get('no') ?? '';
    if (this.query) {
      this.verify();
    }
  }

  verify(): void {
    if (!this.query.trim()) return;
    this.checked.set(false);
    this.result.set(null);
    this.api.get<Certificate>(`/training/certificates/${encodeURIComponent(this.query.trim())}`).subscribe({
      next: c => { this.result.set(c); this.checked.set(true); },
      error: () => this.checked.set(true)
    });
  }
}
