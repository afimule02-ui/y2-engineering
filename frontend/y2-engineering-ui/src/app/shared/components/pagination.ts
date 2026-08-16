import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pagination',
  imports: [CommonModule, FormsModule],
  template: `
    @if (totalPages() > 1) {
      <div class="pagination">
        <button class="page-btn" [disabled]="currentPage() === 1" (click)="pageChange.emit(1)" title="First">«</button>
        <button class="page-btn" [disabled]="currentPage() === 1" (click)="pageChange.emit(currentPage() - 1)" title="Previous">‹</button>

        @for (p of visiblePages(); track p) {
          @if (p === -1) {
            <span class="ellipsis">…</span>
          } @else {
            <button class="page-btn" [class.active]="p === currentPage()" (click)="pageChange.emit(p)">{{ p }}</button>
          }
        }

        <button class="page-btn" [disabled]="currentPage() === totalPages()" (click)="pageChange.emit(currentPage() + 1)" title="Next">›</button>
        <button class="page-btn" [disabled]="currentPage() === totalPages()" (click)="pageChange.emit(totalPages())" title="Last">»</button>

        <span class="page-info">
          {{ (currentPage() - 1) * pageSize() + 1 }}–{{ Math.min(currentPage() * pageSize(), totalItems()) }} of {{ totalItems() }}
        </span>

        <select class="size-select" [ngModel]="pageSize()" (ngModelChange)="pageSizeChange.emit($event)">
          @for (s of pageSizeOptions; track s) {
            <option [value]="s">{{ s }}/page</option>
          }
        </select>
      </div>
    }
  `,
  styles: `
    .pagination {
      display: flex; align-items: center; gap: .3rem; padding: 1rem 0; flex-wrap: wrap;
    }
    .page-btn {
      min-width: 32px; height: 32px; border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 6px; background: var(--mat-sys-surface); cursor: pointer;
      font-size: .8rem; font-weight: 500; display: grid; place-items: center;
      transition: all .15s; color: var(--mat-sys-on-surface);
    }
    .page-btn:hover:not(:disabled):not(.active) { border-color: #0b3d91; color: #0b3d91; }
    .page-btn:disabled { opacity: .35; cursor: not-allowed; }
    .page-btn.active { background: #0b3d91; color: #fff; border-color: #0b3d91; }
    .ellipsis { padding: 0 .3rem; color: var(--mat-sys-on-surface-variant); }
    .page-info { font-size: .8rem; color: var(--mat-sys-on-surface-variant); margin-left: .5rem; white-space: nowrap; }
    .size-select {
      margin-left: .5rem; padding: .25rem .5rem; border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 6px; background: var(--mat-sys-surface); font-size: .8rem;
      color: var(--mat-sys-on-surface); cursor: pointer;
    }
  `
})
export class PaginationComponent {
  readonly currentPage = input(1);
  readonly totalItems = input(0);
  readonly pageSize = input(10);
  readonly pageSizeOptions = [5, 10, 20, 50, 100];

  readonly pageChange = output<number>();
  readonly pageSizeChange = output<number>();

  readonly Math = Math;

  readonly totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()) || 1);

  readonly visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const pages: number[] = [1];
    if (current > 3) pages.push(-1);

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (current < total - 2) pages.push(-1);
    pages.push(total);
    return pages;
  });
}
