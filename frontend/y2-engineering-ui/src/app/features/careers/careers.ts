import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ApiService } from '../../core/api.service';
import { Vacancy } from '../../core/models';
import { PageHeader } from '../../shared/components/page-header';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-careers',
  imports: [PageHeader, FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, TranslatePipe],
  template: `
    <app-page-header [title]="'CAREERS.TITLE' | t"
      [subtitle]="'CAREERS.SUBTITLE' | t" />

    <div class="grid">
      <section>
        <h2>{{ 'CAREERS.VACANCIES' | t }}</h2>
        @for (vacancy of vacancies(); track vacancy.id) {
          <article class="vacancy" [class.selected]="selectedId() === vacancy.id" (click)="select(vacancy.id)">
            <h3>{{ vacancy.title }}</h3>
            <p class="muted">{{ vacancy.department }} · {{ vacancy.location }}</p>
            <p>{{ vacancy.description }}</p>
            @if (vacancy.requirements) {
              <pre class="req">{{ vacancy.requirements }}</pre>
            }
            <button mat-stroked-button (click)="select(vacancy.id)">{{ 'CAREERS.APPLY' | t }}</button>
          </article>
        } @empty {
          <p class="muted">{{ 'CAREERS.NO_VACANCIES' | t }}</p>
        }
      </section>

      <section>
        <h2>{{ 'CAREERS.APPLY_NOW' | t }}</h2>
        <p class="muted">{{ 'CAREERS.APPLY_NOTE' | t }}</p>
        <form class="apply" (ngSubmit)="submit()">
          <mat-form-field appearance="outline" class="full">
            <mat-label>{{ 'CAREERS.FIRST_NAME' | t }}</mat-label>
            <input matInput [(ngModel)]="form.firstName" name="fn" required />
          </mat-form-field>
          <mat-form-field appearance="outline" class="full">
            <mat-label>{{ 'CAREERS.LAST_NAME' | t }}</mat-label>
            <input matInput [(ngModel)]="form.lastName" name="ln" required />
          </mat-form-field>
          <mat-form-field appearance="outline" class="full">
            <mat-label>{{ 'CAREERS.EMAIL' | t }}</mat-label>
            <input matInput type="email" [(ngModel)]="form.email" name="email" required />
          </mat-form-field>
          <mat-form-field appearance="outline" class="full">
            <mat-label>{{ 'CAREERS.PHONE' | t }}</mat-label>
            <input matInput [(ngModel)]="form.phone" name="phone" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="full">
            <mat-label>{{ 'CAREERS.PROFESSION' | t }}</mat-label>
            <input matInput [(ngModel)]="form.profession" name="profession" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="full">
            <mat-label>{{ 'CAREERS.EXPERIENCE' | t }}</mat-label>
            <input matInput type="number" [(ngModel)]="form.experienceYears" name="exp" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="full">
            <mat-label>{{ 'CAREERS.SKILLS' | t }}</mat-label>
            <input matInput [(ngModel)]="form.skills" name="skills" [placeholder]="'CAREERS.SKILLS_HINT' | t" />
          </mat-form-field>
          <button mat-flat-button color="primary" type="submit" [disabled]="busy() || !selectedId()">
            {{ busy() ? ('CAREERS.SUBMITTING' | t) : ('CAREERS.SUBMIT_APP' | t) }}
          </button>
          @if (message()) {
            <p class="ok">{{ message() }}</p>
          }
          @if (error()) {
            <p class="error">{{ error() }}</p>
          }
        </form>
      </section>
    </div>
  `,
  styles: `
    .grid { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 2.5rem; }
    @media (max-width: 850px) { .grid { grid-template-columns: 1fr; } }
    .vacancy { border: 1px solid var(--mat-sys-outline-variant); border-radius: 12px; padding: 1.3rem; margin-bottom: 1.2rem; cursor: pointer; }
    .vacancy.selected { border-color: #0b3d91; box-shadow: 0 0 0 2px rgba(11,61,145,.15); }
    .req { background: #f4f7fb; border-radius: 8px; padding: .7rem; white-space: pre-wrap; font-family: inherit; font-size: .85rem; }
    .apply { display: flex; flex-direction: column; gap: 1rem; }
    .full { width: 100%; }
    .muted { color: var(--mat-sys-on-surface-variant); }
    .ok { color: #1b5e20; }
    .error { color: #b71c1c; }
  `
})
export class CareersPage implements OnInit {
  readonly vacancies = signal<Vacancy[]>([]);
  readonly selectedId = signal<string | null>(null);
  readonly busy = signal(false);
  readonly message = signal('');
  readonly error = signal('');

  readonly form = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    profession: '',
    experienceYears: 0,
    skills: ''
  };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.get<Vacancy[]>('/staffing/vacancies').subscribe({
      next: v => this.vacancies.set(v)
    });
  }

  select(id: string): void {
    this.selectedId.set(id);
    this.message.set('');
    this.error.set('');
  }

  submit(): void {
    const id = this.selectedId();
    if (!id || !this.form.firstName || !this.form.lastName || !this.form.email) return;

    this.busy.set(true);
    this.message.set('');
    this.error.set('');

    this.api.post<{ message: string }>('/staffing/applications', {
      vacancyId: id,
      firstName: this.form.firstName,
      lastName: this.form.lastName,
      email: this.form.email,
      phone: this.form.phone,
      profession: this.form.profession,
      experienceYears: Number(this.form.experienceYears) || 0,
      skills: this.form.skills
    }).subscribe({
      next: res => {
        this.busy.set(false);
        this.message.set(res.message ?? 'Application submitted successfully.');
      },
      error: err => {
        this.busy.set(false);
        this.error.set(err.error?.error ?? 'Could not submit your application.');
      }
    });
  }
}
