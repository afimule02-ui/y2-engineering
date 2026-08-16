import { Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  template: `
    @switch (variant()) {
      @case ('text') {
        <div class="skel-text" [style.width]="width()" [style.height]="height()"></div>
      }
      @case ('title') {
        <div class="skel-title" [style.width]="width()"></div>
      }
      @case ('avatar') {
        <div class="skel-avatar" [style.width]="size()" [style.height]="size()"></div>
      }
      @case ('image') {
        <div class="skel-image" [style.width]="width()" [style.height]="height()"></div>
      }
      @case ('card') {
        <div class="skel-card" [style.height]="height()">
          <div class="skel-image" style="width:100%;height:120px"></div>
          <div style="padding:1rem;display:flex;flex-direction:column;gap:.5rem">
            <div class="skel-title" style="width:70%"></div>
            <div class="skel-text" style="width:100%"></div>
            <div class="skel-text" style="width:85%"></div>
            <div class="skel-text" style="width:40%"></div>
          </div>
        </div>
      }
      @case ('table-row') {
        <div class="skel-table-row">
          @for (col of columns(); track col) {
            <div class="skel-text" [style.width]="col"></div>
          }
        </div>
      }
      @case ('stat') {
        <div class="skel-stat">
          <div class="skel-text" style="width:40%;height:12px"></div>
          <div class="skel-title" style="width:60%;height:28px;margin-top:.5rem"></div>
          <div class="skel-text" style="width:50%;height:10px;margin-top:.4rem"></div>
        </div>
      }
      @default {
        <div class="skel-text" [style.width]="width()" [style.height]="height()"></div>
      }
    }
  `,
  styles: `
    :host { display: block; }

    @keyframes shimmer {
      0% { background-position: -400px 0; }
      100% { background-position: 400px 0; }
    }

    .skel-text, .skel-title, .skel-avatar, .skel-image, .skel-stat, .skel-table-row, .skel-card {
      background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
      background-size: 800px 100%;
      animation: shimmer 1.5s infinite linear;
      border-radius: 4px;
    }

    :host-context(.dark-theme) .skel-text,
    :host-context(.dark-theme) .skel-title,
    :host-context(.dark-theme) .skel-avatar,
    :host-context(.dark-theme) .skel-image,
    :host-context(.dark-theme) .skel-stat,
    :host-context(.dark-theme) .skel-table-row,
    :host-context(.dark-theme) .skel-card {
      background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
      background-size: 800px 100%;
    }

    .skel-text { height: 14px; border-radius: 4px; }
    .skel-title { height: 20px; border-radius: 4px; }
    .skel-avatar { border-radius: 50%; }
    .skel-image { height: 180px; border-radius: 8px; }
    .skel-card { border-radius: 12px; overflow: hidden; border: 1px solid #e0e0e0; }
    :host-context(.dark-theme) .skel-card { border-color: #333; }

    .skel-table-row {
      display: grid;
      grid-template-columns: 80px 1.5fr 1fr 1fr 80px;
      gap: 1rem;
      padding: 1rem;
      border-bottom: 1px solid #eee;
      align-items: center;
    }
    :host-context(.dark-theme) .skel-table-row { border-color: #333; }

    .skel-stat {
      padding: 1.2rem;
      border-radius: 12px;
      border: 1px solid #e0e0e0;
      display: flex;
      flex-direction: column;
    }
    :host-context(.dark-theme) .skel-stat { border-color: #333; }
  `
})
export class SkeletonComponent {
  readonly variant = input<'text' | 'title' | 'avatar' | 'image' | 'card' | 'table-row' | 'stat'>('text');
  readonly width = input('100%');
  readonly height = input('14px');
  readonly size = input('40px');
  readonly columns = input<string[]>(['60px', '1fr', '1fr', '1fr', '80px']);
}
