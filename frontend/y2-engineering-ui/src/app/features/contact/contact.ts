import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { Faq } from '../../core/models';
import { PageHeader } from '../../shared/components/page-header';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-contact',
  imports: [PageHeader, RouterLink, TranslatePipe],
  template: `
    <app-page-header [title]="'CONTACT.TITLE' | t" [subtitle]="'CONTACT.SUBTITLE' | t" />
    <div class="grid">
      <div class="card">
        <h3>{{ 'CONTACT.GET_IN_TOUCH' | t }}</h3>
        <p><strong>{{ 'CONTACT.LOCATION' | t }}</strong> {{ 'CONTACT.CITY' | t }}</p>
        <p><strong>{{ 'CONTACT.EMAIL' | t }}</strong> {{ 'FOOTER.EMAIL' | t }}</p>
        <p><strong>{{ 'CONTACT.PHONE' | t }}</strong> +251 9 00 000 000</p>
        <a routerLink="/request-service" class="btn">{{ 'CONTACT.REQUEST_SERVICE' | t }}</a>
      </div>
      <div class="card">
        <h3>{{ 'CONTACT.FAQ_TITLE' | t }}</h3>
        @for (faq of faqs(); track faq.id) {
          <details class="faq">
            <summary>{{ faq.question }}</summary>
            <p>{{ faq.answer }}</p>
          </details>
        }
      </div>
    </div>
  `,
  styles: `
    .grid { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
    @media (max-width: 800px) { .grid { grid-template-columns: 1fr; } }
    .card { border: 1px solid var(--mat-sys-outline-variant); border-radius: 12px; padding: 1.8rem; }
    .btn { display: inline-block; margin-top: 1rem; background: #0b3d91; color: #fff; padding: .7rem 1.2rem; border-radius: 8px; text-decoration: none; font-weight: 600; }
    .faq { border-bottom: 1px solid var(--mat-sys-outline-variant); padding: .8rem 0; }
    .faq summary { cursor: pointer; font-weight: 600; }
    .faq p { color: var(--mat-sys-on-surface-variant); }
  `
})
export class ContactPage implements OnInit {
  readonly faqs = signal<Faq[]>([]);

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.get<Faq[]>('/cms/faqs').subscribe({
      next: f => this.faqs.set(f)
    });
  }
}
