import { Component, input } from '@angular/core';

@Component({
  selector: 'app-logo',
  template: `
    <img 
      [src]="'logo.png'" 
      [attr.width]="size()" 
      [attr.height]="size()" 
      alt="Y2 Engineering" 
      class="logo-img"
    />
  `,
  styles: `
    :host { display: inline-flex; line-height: 0; }
    .logo-img { 
      object-fit: contain; 
      border-radius: 4px;
    }
  `
})
export class LogoComponent {
  readonly size = input<string | number>(44);
}
