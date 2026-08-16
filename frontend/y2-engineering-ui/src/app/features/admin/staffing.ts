import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ApiService } from '../../core/api.service';
import { Candidate, JobApplication, Vacancy } from '../../core/models';
import { SkeletonComponent } from '../../shared/components/skeleton';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

const CANDIDATE_STATUSES = [
  { value: 0, label: 'New' }, { value: 1, label: 'Reviewed' }, { value: 2, label: 'Interviewed' },
  { value: 3, label: 'Offered' }, { value: 4, label: 'Hired' }, { value: 5, label: 'Rejected' }
];
const APPLICATION_STATUSES = [
  { value: 0, label: 'Submitted' }, { value: 1, label: 'Under Review' }, { value: 2, label: 'Interview' },
  { value: 3, label: 'Offered' }, { value: 4, label: 'Hired' }, { value: 5, label: 'Rejected' }
];

@Component({
  selector: 'app-admin-staffing',
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatCardModule, SkeletonComponent, TranslatePipe],
  template: `
    <div class="head">
      <h1>{{ 'ADMIN.CANDIDATES' | t }}</h1>
      <button mat-flat-button color="primary" (click)="showForm.set(!showForm())">
        {{ showForm() ? 'Close' : ('ADMIN.NEW_VACANCY' | t) }}
      </button>
    </div>

    @if (showForm()) {
      <mat-card class="form-card">
        <mat-card-content>
          <h3>{{ editingId() ? 'Edit Vacancy' : 'New Vacancy' }}</h3>
          <form (ngSubmit)="saveVacancy()" class="form">
            <div class="row">
              <mat-form-field appearance="outline"><mat-label>Title</mat-label>
                <input matInput [(ngModel)]="vacancyForm.title" name="title" required /></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Department</mat-label>
                <input matInput [(ngModel)]="vacancyForm.department" name="dept" /></mat-form-field>
            </div>
            <div class="row">
              <mat-form-field appearance="outline"><mat-label>Location</mat-label>
                <input matInput [(ngModel)]="vacancyForm.location" name="loc" /></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Status</mat-label>
                <mat-select [(ngModel)]="vacancyForm.status" name="status">
                  <mat-option [value]="0">Open</mat-option>
                  <mat-option [value]="1">On Hold</mat-option>
                  <mat-option [value]="2">Filled</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
            <mat-form-field appearance="outline" class="full"><mat-label>Description</mat-label>
              <textarea matInput rows="3" [(ngModel)]="vacancyForm.description" name="desc"></textarea></mat-form-field>
            <mat-form-field appearance="outline" class="full"><mat-label>Requirements</mat-label>
              <textarea matInput rows="3" [(ngModel)]="vacancyForm.requirements" name="reqs" placeholder="Experience, skills, qualifications..."></textarea></mat-form-field>
            <div class="actions">
              <button mat-flat-button color="primary" type="submit">{{ editingId() ? 'Update' : 'Post' }}</button>
              <button mat-stroked-button type="button" (click)="cancelVacancy()">Cancel</button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    }

    @if (msg()) { <p class="ok">{{ msg() }}</p> }

    @if (loading()) {
      <div class="section-header"><h2>{{ 'ADMIN.VACANCIES' | t }}</h2></div>
      <div class="skeleton-table">
        <div class="skel-thead" style="grid-template-columns:1fr 1fr 1fr 100px 60px">
          <app-skeleton variant="text" width="120px" /><app-skeleton variant="text" width="100px" />
          <app-skeleton variant="text" width="100px" /><app-skeleton variant="text" width="70px" />
          <app-skeleton variant="text" width="50px" />
        </div>
        @for (i of [1,2,3]; track i) { <app-skeleton variant="table-row" [columns]="['1fr','1fr','1fr','80px','50px']" /> }
      </div>
      <div class="section-header"><h2>{{ 'ADMIN.APPLICATIONS' | t }}</h2></div>
      <div class="skeleton-table">
        <div class="skel-thead" style="grid-template-columns:1fr 1fr 120px 100px">
          <app-skeleton variant="text" width="100px" /><app-skeleton variant="text" width="100px" />
          <app-skeleton variant="text" width="80px" /><app-skeleton variant="text" width="80px" />
        </div>
        @for (i of [1,2]; track i) { <app-skeleton variant="table-row" [columns]="['1fr','1fr','100px','80px']" /> }
      </div>
    } @else {
      <!-- Vacancies -->
      <div class="section-header"><h2>{{ 'ADMIN.VACANCIES' | t }}</h2></div>
      <div class="table">
        <div class="thead" style="grid-template-columns:1fr 1fr 1fr 100px 60px"><span>Title</span><span>Department</span><span>Location</span><span>Status</span><span></span></div>
        @for (v of vacancies(); track v.id) {
          <div class="trow" style="grid-template-columns:1fr 1fr 1fr 100px 60px">
            <span class="code">{{ v.title }}</span>
            <span>{{ v.department || '—' }}</span>
            <span>{{ v.location || '—' }}</span>
            <span>
              @if (v.status === 0) { <span class="badge open">Open</span> }
              @else if (v.status === 2) { <span class="badge filled">Filled</span> }
              @else { <span class="badge closed">Closed</span> }
            </span>
            <span class="row-actions">
              <button mat-icon-button color="primary" (click)="editVacancy(v)">edit</button>
            </span>
          </div>
        } @empty { <p class="muted">No vacancies yet.</p> }
      </div>

      <!-- Applications -->
      <div class="section-header"><h2>{{ 'ADMIN.APPLICATIONS' | t }}</h2></div>
      <div class="table">
        <div class="thead" style="grid-template-columns:1fr 1fr 120px 100px"><span>Candidate</span><span>Vacancy</span><span>Status</span><span>Applied</span></div>
        @for (a of applications(); track a.id) {
          <div class="trow" style="grid-template-columns:1fr 1fr 120px 100px">
            <span class="code">{{ a.candidateName }}</span>
            <span>{{ a.vacancyTitle }}</span>
            <span><span class="badge">{{ appLabel(a.status) }}</span></span>
            <span>{{ a.appliedDate | date: 'mediumDate' }}</span>
          </div>
        } @empty { <p class="muted">No applications yet.</p> }
      </div>

      <!-- Candidates -->
      <div class="section-header"><h2>{{ 'ADMIN.CANDIDATES' | t }}</h2></div>
      <div class="table">
        <div class="thead" style="grid-template-columns:1fr 1fr 80px 1fr 140px"><span>Name</span><span>Profession</span><span>Exp</span><span>Skills</span><span>Status</span></div>
        @for (c of candidates(); track c.id) {
          <div class="trow" style="grid-template-columns:1fr 1fr 80px 1fr 140px">
            <span class="code">{{ c.fullName }}</span>
            <span>{{ c.profession || '—' }}</span>
            <span>{{ c.experienceYears }} yrs</span>
            <span class="muted skills">{{ c.skills || '—' }}</span>
            <span>
              <mat-form-field appearance="outline" class="small-field">
                <mat-select [value]="c.status" (selectionChange)="updateStatus(c, $event.value)">
                  @for (s of candidateStatuses; track s.value) { <mat-option [value]="s.value">{{ s.label }}</mat-option> }
                </mat-select>
              </mat-form-field>
            </span>
          </div>
        } @empty { <p class="muted">No candidates yet.</p> }
      </div>
    }
  `,
  styles: `
    .head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .form-card { margin-bottom: 1.5rem; }
    .form { display: grid; gap: .8rem; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .full { width: 100%; }
    .actions { display: flex; gap: .8rem; }
    .section-header { margin: 1.5rem 0 .8rem; }
    .section-header h2 { margin: 0; }
    .skeleton-table { border: 1px solid var(--mat-sys-outline-variant); border-radius: 12px; overflow: hidden; margin-bottom: 1rem; }
    .skel-thead { display: grid; gap: .8rem; padding: .65rem .9rem; background: #f4f7fb; }
    .table { border: 1px solid var(--mat-sys-outline-variant); border-radius: 12px; overflow: hidden; margin-bottom: 1rem; }
    .thead, .trow { display: grid; gap: .8rem; padding: .65rem .9rem; align-items: center; }
    .thead { background: #f4f7fb; font-weight: 700; font-size: .75rem; text-transform: uppercase; color: var(--mat-sys-on-surface-variant); }
    .trow { border-top: 1px solid var(--mat-sys-outline-variant); }
    .code { color: #0b3d91; font-weight: 600; }
    .skills { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }
    .row-actions { display: flex; gap: .1rem; }
    .badge { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: .75rem; font-weight: 600; background: #f4f7fb; color: #37474f; }
    .badge.open { background: #e8f5e9; color: #1b5e20; }
    .badge.filled { background: #e3f2fd; color: #0d47a1; }
    .badge.closed { background: #fdecea; color: #b71c1c; }
    .small-field { width: 140px; }
    .ok { color: #1b5e20; }
    .muted { color: var(--mat-sys-on-surface-variant); padding: 1rem; }
  `
})
export class AdminStaffingPage implements OnInit {
  readonly candidateStatuses = CANDIDATE_STATUSES;
  readonly vacancies = signal<Vacancy[]>([]);
  readonly candidates = signal<Candidate[]>([]);
  readonly applications = signal<JobApplication[]>([]);
  readonly showForm = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly msg = signal('');
  readonly loading = signal(true);

  vacancyForm: any = { title: '', department: '', location: '', description: '', requirements: '', status: 0 };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loading.set(true);
    this.api.get<Vacancy[]>('/staffing/vacancies').subscribe({ next: v => this.vacancies.set(v) });
    this.api.get<Candidate[]>('/staffing/candidates').subscribe({ next: c => this.candidates.set(c) });
    this.api.get<JobApplication[]>('/staffing/applications').subscribe({ next: a => { this.applications.set(a); this.loading.set(false); } });
  }

  appLabel(s: number): string {
    return APPLICATION_STATUSES.find(x => x.value === s)?.label ?? '—';
  }

  saveVacancy(): void {
    if (!this.vacancyForm.title) return;
    const body = { ...this.vacancyForm, postedDate: new Date().toISOString(), closingDate: null };
    if (this.editingId()) {
      this.api.put(`/staffing/vacancies/${this.editingId()}`, body).subscribe({ next: () => { this.msg.set('Vacancy updated.'); this.cancelVacancy(); this.ngOnInit(); } });
    } else {
      this.api.post('/staffing/vacancies', body).subscribe({ next: () => { this.msg.set('Vacancy posted.'); this.cancelVacancy(); this.ngOnInit(); } });
    }
  }

  editVacancy(v: Vacancy): void {
    this.showForm.set(true); this.editingId.set(v.id);
    this.vacancyForm = { title: v.title, department: v.department || '', location: v.location || '', description: v.description || '', requirements: v.requirements || '', status: v.status };
  }

  cancelVacancy(): void {
    this.showForm.set(false); this.editingId.set(null); this.msg.set('');
    this.vacancyForm = { title: '', department: '', location: '', description: '', requirements: '', status: 0 };
  }

  updateStatus(c: Candidate, status: number): void {
    const appStatus = [0, 1, 2, 3, 4, 5].includes(status) ? status : 0;
    this.api.put(`/staffing/candidates/${c.id}`, { status, applicationStatus: appStatus }).subscribe({ next: () => this.ngOnInit() });
  }
}
