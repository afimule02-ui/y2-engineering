import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { Course } from '../../core/models';
import { EtbPipe } from '../../shared/pipes/etb.pipe';
import { PageHeader } from '../../shared/components/page-header';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-training',
  imports: [PageHeader, EtbPipe, RouterLink, TranslatePipe],
  template: `
    <app-page-header [title]="'TRAINING.TITLE' | t"
      [subtitle]="'TRAINING.SUBTITLE' | t" />
    <div class="grid">
      @for (course of courses(); track course.id) {
        <article class="course">
          <span class="tag">{{ course.category || 'Technical' }}</span>
          <h3>{{ course.title }}</h3>
          <p>{{ course.description }}</p>
          <div class="meta">
            <span>⏱ {{ course.durationDays }} {{ 'TRAINING.DAYS' | t }}</span>
            <span>💳 {{ course.price | etb }}</span>
          </div>
          @if (course.modules) {
            <pre class="modules">{{ course.modules }}</pre>
          }
        </article>
      } @empty {
        <p class="muted">{{ 'TRAINING.EMPTY' | t }}</p>
      }
    </div>
    <div class="verify">
      <p>{{ 'TRAINING.VERIFY_TEXT' | t }}</p>
      <a class="btn" [routerLink]="['/verify-certificate', 'Y2-2026-00001']">{{ 'TRAINING.VERIFY_BTN' | t }}</a>
    </div>
  `,
  styles: `
    .grid { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; }
    .course { border: 1px solid var(--mat-sys-outline-variant); border-radius: 12px; padding: 1.5rem; }
    .tag { background: #e3edfb; color: #0b3d91; font-size: .75rem; font-weight: 700; padding: 2px 10px; border-radius: 999px; text-transform: uppercase; }
    .meta { display: flex; gap: 1rem; color: var(--mat-sys-on-surface-variant); font-size: .9rem; margin-top: .8rem; }
    .modules { background: #f4f7fb; border-radius: 8px; padding: .8rem; white-space: pre-wrap; font-family: inherit; font-size: .85rem; }
    .muted { color: var(--mat-sys-on-surface-variant); }
    .verify { text-align: center; margin: 3rem 0; }
    .btn { background: #0b3d91; color: #fff; padding: .7rem 1.3rem; border-radius: 8px; text-decoration: none; font-weight: 600; }
  `
})
export class TrainingPage implements OnInit {
  readonly courses = signal<Course[]>([]);

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.get<Course[]>('/training/courses').subscribe({
      next: c => this.courses.set(c)
    });
  }
}
