import { Component, OnInit, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ServiceSummary } from '../../core/models';
import { PageHeader } from '../../shared/components/page-header';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-services-list',
  imports: [PageHeader, RouterLink, MatIcon, TranslatePipe],
  template: `
    <app-page-header [title]="'SERVICES.LIST_TITLE' | t"
      [subtitle]="'SERVICES.LIST_SUBTITLE' | t" />
    <div class="cards">
      @for (service of services(); track service.id) {
        <a class="card" [routerLink]="['/services', service.slug]">
          <mat-icon>{{ service.icon || 'settings' }}</mat-icon>
          <h3>{{ service.name }}</h3>
          <p>{{ service.shortDescription }}</p>
          <span class="more">{{ 'SERVICES.LEARN_MORE' | t }}</span>
        </a>
      }
    </div>
  `,
  styles: `
    .cards { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
    .card { border: 1px solid var(--mat-sys-outline-variant); border-radius: 12px; padding: 1.8rem; text-decoration: none; color: inherit; }
    .card:hover { box-shadow: 0 8px 24px rgba(11,61,145,.12); }
    .card mat-icon { font-size: 2.4rem; width: 2.4rem; height: 2.4rem; color: #0b3d91; }
    .card p { color: var(--mat-sys-on-surface-variant); }
    .more { color: #0b3d91; font-weight: 600; }
  `
})
export class ServicesListPage implements OnInit {
  readonly services = signal<ServiceSummary[]>([]);

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.get<ServiceSummary[]>('/services').subscribe({
      next: s => this.services.set(s)
    });
  }
}
