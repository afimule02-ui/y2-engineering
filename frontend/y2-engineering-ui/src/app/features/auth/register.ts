import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-register',
  imports: [FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, RouterLink, TranslatePipe],
  template: `
    <div class="wrap">
      <mat-card class="card">
        <mat-card-header><mat-card-title>{{ 'AUTH.CREATE_TITLE' | t }}</mat-card-title></mat-card-header>
        <mat-card-content>
          <form (ngSubmit)="register()" class="form">
            <mat-form-field appearance="outline" class="full">
              <mat-label>{{ 'AUTH.FULL_NAME' | t }}</mat-label>
              <input matInput [(ngModel)]="form.fullName" name="fullName" required />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full">
              <mat-label>{{ 'AUTH.COMPANY_NAME' | t }}</mat-label>
              <input matInput [(ngModel)]="form.companyName" name="companyName" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full">
              <mat-label>{{ 'AUTH.EMAIL' | t }}</mat-label>
              <input matInput type="email" [(ngModel)]="form.email" name="email" required />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full">
              <mat-label>{{ 'AUTH.PHONE' | t }}</mat-label>
              <input matInput [(ngModel)]="form.phone" name="phone" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full">
              <mat-label>{{ 'AUTH.PASSWORD_MIN' | t }}</mat-label>
              <input matInput type="password" [(ngModel)]="form.password" name="password" required />
            </mat-form-field>
            <button mat-flat-button color="primary" type="submit" [disabled]="busy()">
              {{ busy() ? ('AUTH.CREATING' | t) : ('AUTH.CREATE_BTN' | t) }}
            </button>
          </form>
          @if (error()) {
            <p class="error">{{ error() }}</p>
          }
          <p class="muted">{{ 'AUTH.ALREADY_REGISTERED' | t }} <a routerLink="/auth/login">{{ 'AUTH.SIGN_IN_LINK' | t }}</a></p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: `
    .wrap { display: grid; place-items: center; padding: 3rem 1rem; }
    .card { width: 100%; max-width: 440px; padding: 1rem; }
    .form { display: grid; gap: 1rem; margin-top: 1rem; }
    .full { width: 100%; }
    .error { color: #b71c1c; }
    .muted { color: var(--mat-sys-on-surface-variant); font-size: .9rem; }
  `
})
export class RegisterPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = { fullName: '', companyName: '', email: '', phone: '', password: '' };
  readonly busy = signal(false);
  readonly error = signal('');

  register(): void {
    this.busy.set(true);
    this.error.set('');
    this.auth.register({
      fullName: this.form.fullName,
      companyName: this.form.companyName,
      email: this.form.email,
      phone: this.form.phone,
      password: this.form.password
    }).subscribe({
      next: () => {
        this.busy.set(false);
        this.router.navigateByUrl('/customer');
      },
      error: err => {
        this.busy.set(false);
        this.error.set(err.error?.errors?.join(', ') ?? err.error?.error ?? 'Registration failed.');
      }
    });
  }
}
