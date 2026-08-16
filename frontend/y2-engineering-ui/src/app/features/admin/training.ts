import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { Certificate, Course } from '../../core/models';
import { EtbPipe } from '../../shared/pipes/etb.pipe';
import { SkeletonComponent } from '../../shared/components/skeleton';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-admin-training',
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSlideToggleModule, RouterLink, EtbPipe, MatCardModule, SkeletonComponent, TranslatePipe],
  template: `
    <div class="head">
      <h1>{{ 'NAV.TRAINING' | t }}</h1>
      <button mat-flat-button color="primary" (click)="showForm.set(!showForm())">
        {{ showForm() ? ('ADMIN.DELETE' | t) : ('ADMIN.ADD_COURSE' | t) }}
      </button>
    </div>

    @if (showForm()) {
      <mat-card class="form-card">
        <mat-card-content>
          <h3>{{ editingId() ? 'Edit Course' : 'New Course' }}</h3>
          <form (ngSubmit)="saveCourse()" class="form">
            <div class="row">
              <mat-form-field appearance="outline"><mat-label>{{ 'ADMIN.COURSE_TITLE' | t }}</mat-label>
                <input matInput [(ngModel)]="courseForm.title" name="title" required /></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>{{ 'ADMIN.CATEGORY' | t }}</mat-label>
                <input matInput [(ngModel)]="courseForm.category" name="category" /></mat-form-field>
            </div>
            <div class="row">
              <mat-form-field appearance="outline"><mat-label>{{ 'ADMIN.DURATION' | t }}</mat-label>
                <input matInput type="number" [(ngModel)]="courseForm.durationDays" name="days" /></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>{{ 'ADMIN.PRICE_ETB' | t }}</mat-label>
                <input matInput type="number" [(ngModel)]="courseForm.price" name="price" /></mat-form-field>
            </div>
            <mat-form-field appearance="outline" class="full"><mat-label>Course Description</mat-label>
              <textarea matInput rows="3" [(ngModel)]="courseForm.description" name="desc"></textarea></mat-form-field>
            <mat-form-field appearance="outline" class="full"><mat-label>Modules / Syllabus</mat-label>
              <textarea matInput rows="4" [(ngModel)]="courseForm.modules" name="modules" placeholder="Module 1: ...&#10;Module 2: ..."></textarea></mat-form-field>
            <div class="actions">
              <button mat-flat-button color="primary" type="submit">{{ editingId() ? 'Update' : 'Create' }}</button>
              <button mat-stroked-button type="button" (click)="cancelCourse()">Cancel</button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    }

    @if (msg()) { <p class="ok">{{ msg() }}</p> }

    @if (loading()) {
      <div class="grid">
        <section class="panel"><h2>{{ 'ADMIN.COURSES' | t }}</h2>
          @for (i of [1,2,3]; track i) {
            <div class="skel-row"><app-skeleton variant="text" width="200px" /><app-skeleton variant="text" width="150px" /><app-skeleton variant="text" width="60px" /></div>
          }
        </section>
        <section class="panel"><h2>{{ 'ADMIN.CERTIFICATES' | t }}</h2>
          @for (i of [1,2]; track i) {
            <div class="skel-row"><app-skeleton variant="text" width="150px" /><app-skeleton variant="text" width="180px" /></div>
          }
        </section>
      </div>
    } @else {
      <div class="grid">
        <section class="panel">
          <h2>{{ 'ADMIN.COURSES' | t }}</h2>
          <div class="rows">
            @for (c of courses(); track c.id) {
              <div class="item">
                <div class="item-info">
                  <strong>{{ c.title }}</strong>
                  <span class="meta">{{ c.category || '—' }} · {{ c.durationDays }} {{ 'ADMIN.DAYS' | t }} · {{ c.price | etb }}</span>
                </div>
                <div class="item-actions">
                  <button mat-icon-button color="primary" (click)="editCourse(c)">edit</button>
                  <button mat-icon-button color="warn" (click)="removeCourse(c.id)">delete</button>
                </div>
              </div>
            } @empty { <p class="muted">{{ 'ADMIN.NO_COURSES' | t }}</p> }
          </div>
        </section>

        <section class="panel">
          <h2>{{ 'ADMIN.CERTIFICATES' | t }}</h2>
          <div class="rows">
            @for (c of certificates(); track c.id) {
              <div class="item">
                <div class="item-info">
                  <strong>{{ c.certificateNo }}</strong>
                  <span class="meta">{{ c.studentName }} — {{ c.courseTitle }}</span>
                </div>
                <a [routerLink]="['/verify-certificate', c.certificateNo]" mat-icon-button color="primary">open_in_new</a>
              </div>
            } @empty { <p class="muted">{{ 'ADMIN.NO_CERTIFICATES' | t }}</p> }
          </div>
        </section>
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
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem; }
    @media (max-width: 900px) { .grid { grid-template-columns: 1fr; } }
    .panel { border: 1px solid var(--mat-sys-outline-variant); border-radius: 12px; padding: 1.3rem; margin-bottom: 1.2rem; }
    .rows { display: grid; gap: .4rem; }
    .item { display: flex; align-items: center; gap: .8rem; padding: .6rem 0; border-bottom: 1px solid var(--mat-sys-outline-variant); }
    .item-info { flex: 1; min-width: 0; }
    .item-info strong { display: block; }
    .meta { color: var(--mat-sys-on-surface-variant); font-size: .8rem; }
    .item-actions { display: flex; gap: .2rem; }
    .skel-row { display: flex; gap: 1rem; align-items: center; padding: .6rem 0; border-bottom: 1px solid var(--mat-sys-outline-variant); }
    .ok { color: #1b5e20; }
    .muted { color: var(--mat-sys-on-surface-variant); padding: 1rem; text-align: center; }
  `
})
export class AdminTrainingPage implements OnInit {
  readonly courses = signal<Course[]>([]);
  readonly certificates = signal<Certificate[]>([]);
  readonly showForm = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly msg = signal('');
  readonly loading = signal(true);

  courseForm: any = { title: '', category: '', description: '', durationDays: 5, price: 0, modules: '' };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loading.set(true);
    this.api.get<Course[]>('/training/courses').subscribe({ next: c => this.courses.set(c) });
    this.api.get<Certificate[]>('/training/certificates').subscribe({ next: c => { this.certificates.set(c); this.loading.set(false); } });
  }

  saveCourse(): void {
    if (!this.courseForm.title) return;
    const body = { ...this.courseForm, durationDays: Number(this.courseForm.durationDays) || 5, price: Number(this.courseForm.price) || 0, isActive: true };
    if (this.editingId()) {
      this.api.put(`/training/courses/${this.editingId()}`, body).subscribe({ next: () => { this.msg.set('Course updated.'); this.cancelCourse(); this.ngOnInit(); } });
    } else {
      this.api.post('/training/courses', body).subscribe({ next: () => { this.msg.set('Course created.'); this.cancelCourse(); this.ngOnInit(); } });
    }
  }

  editCourse(c: Course): void {
    this.showForm.set(true); this.editingId.set(c.id);
    this.courseForm = { title: c.title, category: c.category || '', description: c.description || '', durationDays: c.durationDays, price: c.price, modules: c.modules || '' };
  }

  cancelCourse(): void {
    this.showForm.set(false); this.editingId.set(null); this.msg.set('');
    this.courseForm = { title: '', category: '', description: '', durationDays: 5, price: 0, modules: '' };
  }

  removeCourse(id: string): void {
    if (!confirm('Delete this course?')) return;
    this.api.delete(`/training/courses/${id}`).subscribe({ next: () => { this.msg.set('Deleted.'); this.ngOnInit(); } });
  }
}
