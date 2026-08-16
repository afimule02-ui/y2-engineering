import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  template: `
    <header class="page-header">
      <h1>{{ title() }}</h1>
      @if (subtitle()) {
        <p>{{ subtitle() }}</p>
      }
      <ng-content />
    </header>
  `,
  styles: `
    .page-header {
      padding: 3rem 0 2rem;
      text-align: center;
      h1 { margin: 0 0 .5rem; font-size: 2.2rem; font-weight: 700; }
      p { margin: 0 auto; max-width: 640px; color: var(--mat-sys-on-surface-variant); }
    }
  `
})
export class PageHeader {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
}
