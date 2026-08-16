import { Component, inject, OnInit, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ServiceDetail } from '../../core/models';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-service-detail',
  imports: [RouterLink, MatIcon, TranslatePipe],
  template: `
    @if (service(); as s) {
      <article class="detail">
        <a routerLink="/services" class="back">{{ 'SERVICES.BACK' | t }}</a>
        <div class="head">
          <mat-icon>{{ s.icon || 'settings' }}</mat-icon>
          <h1>{{ s.name }}</h1>
          <p>{{ s.shortDescription }}</p>
          <a routerLink="/request-service" [queryParams]="{ service: s.id }" class="btn">{{ 'SERVICES.REQUEST_THIS' | t }}</a>
        </div>

        <section>
          <h2>{{ 'SERVICES.OVERVIEW' | t }}</h2>
          <p>{{ s.description }}</p>
        </section>

        @if (s.process) {
          <section>
            <h2>{{ 'SERVICES.PROCESS' | t }}</h2>
            <pre class="process">{{ s.process }}</pre>
          </section>
        }

        @if (s.industriesServed) {
          <section>
            <h2>{{ 'SERVICES.INDUSTRIES' | t }}</h2>
            <p>{{ s.industriesServed }}</p>
          </section>
        }
      </article>
    } @else {
      <p class="muted">{{ 'SERVICES.LOADING' | t }}</p>
    }
  `,
  styles: `
    .detail { max-width: 820px; margin: 0 auto; }
    .back { color: #0b3d91; text-decoration: none; font-weight: 600; }
    .head { text-align: center; margin: 2rem 0 3rem; }
    .head mat-icon { font-size: 3.5rem; width: 3.5rem; height: 3.5rem; color: #0b3d91; }
    .head h1 { margin: .5rem 0; }
    .head p { color: var(--mat-sys-on-surface-variant); }
    .btn { display: inline-block; margin-top: 1rem; background: #0b3d91; color: #fff; padding: .7rem 1.3rem; border-radius: 8px; text-decoration: none; font-weight: 600; }
    section { margin-bottom: 2.5rem; line-height: 1.7; }
    .process { background: #f4f7fb; border-radius: 10px; padding: 1.2rem; white-space: pre-wrap; font-family: inherit; }
    .muted { color: var(--mat-sys-on-surface-variant); }
  `
})
export class ServiceDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);
  readonly service = signal<ServiceDetail | null>(null);

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.api.get<ServiceDetail>(`/services/${slug}`).subscribe({
        next: s => this.service.set(s)
      });
    }
  }
}
