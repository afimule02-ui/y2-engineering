import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-admin-toolbar',
  imports: [FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  template: `
    <div class="toolbar">
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>{{ placeholder() }}</mat-label>
        <input matInput [ngModel]="searchTerm()" (ngModelChange)="onSearch($event)" />
        @if (searchTerm()) {
          <button matSuffix mat-icon-button type="button" (click)="onSearch('')">
            <span style="font-family: Material Icons; font-size: 18px;">close</span>
          </button>
        }
      </mat-form-field>

      @if (filters().length > 0) {
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Filter</mat-label>
          <mat-select [ngModel]="selectedFilter()" (ngModelChange)="onFilterChange($event)">
            <mat-option [value]="null">All</mat-option>
            @for (f of filters(); track f.value) {
              <mat-option [value]="f.value">{{ f.label }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      }

      <span class="spacer"></span>

      @if (totalCount() > 0) {
        <span class="count">{{ filteredCount() }} / {{ totalCount() }}</span>
      }

      @if (showExport()) {
        <button mat-stroked-button (click)="exportCsv.emit()">
          <span style="font-family: Material Icons; font-size: 16px; vertical-align: middle; margin-right: 4px;">download</span>
          CSV
        </button>
      }

      <ng-content />
    </div>
  `,
  styles: `
    .toolbar {
      display: flex; align-items: center; gap: .8rem; margin-bottom: 1rem; flex-wrap: wrap;
    }
    .search-field { width: 280px; }
    .filter-field { width: 180px; }
    .spacer { flex: 1; }
    .count { font-size: .85rem; color: var(--mat-sys-on-surface-variant); font-weight: 500; }
  `
})
export class AdminToolbarComponent {
  readonly placeholder = input<string>('Search...');
  readonly filters = input<{ value: any; label: string }[]>([]);
  readonly totalCount = input(0);
  readonly filteredCount = input(0);
  readonly showExport = input(true);

  readonly searchTerm = signal('');
  readonly selectedFilter = signal<any>(null);

  readonly searchChange = output<string>();
  readonly filterChange = output<any>();
  readonly exportCsv = output<void>();

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.searchChange.emit(term);
  }

  onFilterChange(value: any): void {
    this.selectedFilter.set(value);
    this.filterChange.emit(value);
  }
}
