import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ApiService } from '../../core/api.service';
import { Project } from '../../core/models';
import { PageHeader } from '../../shared/components/page-header';
import { StatusBadge } from '../../shared/components/status-badge';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-projects',
  imports: [CommonModule, PageHeader, StatusBadge, MatProgressBarModule, TranslatePipe],
  template: `
    <app-page-header [title]="'PROJECTS.TITLE' | t" [subtitle]="'PROJECTS.SUBTITLE' | t" />
    <div class="list">
      @for (project of projects(); track project.id) {
        <article class="project">
          <div class="meta">
            <span class="no">{{ project.projectNo }}</span>
            <app-status-badge kind="project" [value]="project.status" />
          </div>
          <h3>{{ project.name }}</h3>
          <p>{{ project.description || ('PROJECTS.NO_DESC' | t) }}</p>
          <div class="foot">
            <span>{{ project.customerName || ('PROJECTS.CONFIDENTIAL' | t) }}</span>
            <span>{{ project.startDate | date: 'MMM yyyy' }} → {{ project.endDate | date: 'MMM yyyy' }}</span>
          </div>
          <mat-progress-bar mode="determinate" [value]="project.progress" />
        </article>
      } @empty {
        <p class="muted">{{ 'PROJECTS.EMPTY' | t }}</p>
      }
    </div>
  `,
  styles: `
    .list { max-width: 900px; margin: 0 auto; display: grid; gap: 1.5rem; }
    .project { border: 1px solid var(--mat-sys-outline-variant); border-radius: 12px; padding: 1.5rem; }
    .meta { display: flex; justify-content: space-between; align-items: center; }
    .no { color: #0b3d91; font-weight: 700; }
    .foot { display: flex; justify-content: space-between; color: var(--mat-sys-on-surface-variant); margin: .8rem 0; font-size: .9rem; }
    .muted { color: var(--mat-sys-on-surface-variant); text-align: center; }
  `
})
export class ProjectsPage implements OnInit {
  readonly projects = signal<Project[]>([]);

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.get<Project[]>('/projects/public').subscribe({
      next: p => this.projects.set(p)
    });
  }
}
