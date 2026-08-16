import { Component, input } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading',
  imports: [MatProgressSpinner],
  template: `
    @if (overlay()) {
      <div class="loading-overlay">
        <div class="loading-content">
          <mat-spinner [diameter]="diameter()"></mat-spinner>
          @if (message()) {
            <p class="loading-msg">{{ message() }}</p>
          }
        </div>
      </div>
    } @else {
      <div class="loading-inline">
        <mat-spinner [diameter]="diameter()"></mat-spinner>
        @if (message()) {
          <p class="loading-msg">{{ message() }}</p>
        }
      </div>
    }
  `,
  styles: `
    .loading-overlay {
      position: fixed; inset: 0; z-index: 9999;
      background: rgba(255,255,255,0.85);
      display: flex; align-items: center; justify-content: center;
    }
    :host-context(.dark-theme) .loading-overlay {
      background: rgba(0,0,0,0.75);
    }
    .loading-content { display: flex; flex-direction: column; align-items: center; gap: 1rem; }
    .loading-inline { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; gap: .75rem; }
    .loading-msg { margin: 0; color: #666; font-size: .85rem; }
    :host-context(.dark-theme) .loading-msg { color: #aaa; }
  `
})
export class LoadingComponent {
  readonly overlay = input(false);
  readonly diameter = input(40);
  readonly message = input('');
}
