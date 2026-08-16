import { Component } from '@angular/core';
import { PageHeader } from '../../shared/components/page-header';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-about',
  imports: [PageHeader, TranslatePipe],
  template: `
    <app-page-header [title]="'ABOUT.TITLE' | t"
      [subtitle]="'ABOUT.SUBTITLE' | t" />
    <div class="prose">
      <p>{{ 'ABOUT.P1' | t }}</p>
      <p>{{ 'ABOUT.P2' | t }}</p>
    </div>
  `,
  styles: `
    .prose { max-width: 760px; margin: 0 auto; line-height: 1.7; }
    .prose p { margin: 1rem 0; }
  `
})
export class AboutPage {}
