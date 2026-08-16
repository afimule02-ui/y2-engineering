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
  selector: 'app-login',
  imports: [FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, RouterLink, TranslatePipe],
  template: `
    <div class="wrap">
      <mat-card class="card">
        <mat-card-header><mat-card-title>{{ 'AUTH.SIGN_IN' | t }}</mat-card-title></mat-card-header>
        <mat-card-content>
          <p class="muted">{{ 'AUTH.SIGN_IN_SUBTITLE' | t }}</p>
          <form (ngSubmit)="login()" class="form">
            <mat-form-field appearance="outline" class="full">
              <mat-label>{{ 'AUTH.EMAIL' | t }}</mat-label>
              <input matInput type="email" [(ngModel)]="email" name="email" required />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full">
              <mat-label>{{ 'AUTH.PASSWORD' | t }}</mat-label>
              <input matInput type="password" [(ngModel)]="password" name="password" required />
            </mat-form-field>
            <button mat-flat-button color="primary" type="submit" [disabled]="busy()">
              {{ busy() ? ('AUTH.SIGNING_IN' | t) : ('AUTH.SIGN_IN' | t) }}
            </button>
          </form>
          @if (error()) {
            <p class="error">{{ error() }}</p>
          }
          <p class="hint">Demo accounts: <code>admin@y2engineering.com / Admin@123!</code> or <code>customer@y2engineering.com / Customer@123!</code></p>
          <p class="muted">{{ 'AUTH.NEW_CUSTOMER' | t }} <a routerLink="/auth/register">{{ 'AUTH.CREATE_ACCOUNT_LINK' | t }}</a></p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: `
    .wrap { display: grid; place-items: center; padding: 4rem 1rem; }
    .card { width: 100%; max-width: 420px; padding: 1rem; }
    .form { display: grid; gap: 1rem; margin-top: 1rem; }
    .full { width: 100%; }
    .error { color: #b71c1c; }
    .muted { color: var(--mat-sys-on-surface-variant); font-size: .9rem; }
    .hint { font-size: .8rem; color: var(--mat-sys-on-surface-variant); background: #f4f7fb; padding: .6rem; border-radius: 8px; }
    code { font-size: .8rem; }
  `
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  readonly busy = signal(false);
  readonly error = signal('');

  login(): void {
    this.busy.set(true);
    this.error.set('');
    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.busy.set(false);
        this.router.navigateByUrl(this.auth.isAdmin() ? '/admin' : '/customer');
      },
      error: err => {
        this.busy.set(false);
        this.error.set(err.error?.error ?? 'Invalid email or password.');
      }
    });
  }
}
