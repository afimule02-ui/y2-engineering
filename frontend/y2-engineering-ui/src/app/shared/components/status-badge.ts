import { Component, input } from '@angular/core';

export const STATUS_LABELS: Record<string, Record<number, string>> = {
  request: {
    0: 'Pending', 1: 'Under Review', 2: 'Quoted', 3: 'Scheduled', 4: 'In Progress', 5: 'Completed', 6: 'Cancelled'
  },
  quotation: {
    0: 'Draft', 1: 'Sent', 2: 'Accepted', 3: 'Rejected', 4: 'Expired', 5: 'Converted'
  },
  machine: {
    0: 'Operational', 1: 'Under Maintenance', 2: 'Out of Service', 3: 'Decommissioned'
  },
  project: {
    0: 'Not Started', 1: 'In Progress', 2: 'On Hold', 3: 'Completed', 4: 'Cancelled'
  },
  workOrder: {
    0: 'Open', 1: 'Assigned', 2: 'In Progress', 3: 'Completed', 4: 'Cancelled'
  },
  invoice: {
    0: 'Draft', 1: 'Sent', 2: 'Partially Paid', 3: 'Paid', 4: 'Overdue', 5: 'Cancelled'
  },
  priority: {
    0: 'Low', 1: 'Medium', 2: 'High', 3: 'Critical'
  }
};

@Component({
  selector: 'app-status-badge',
  template: `<span class="badge" [class]="tone">{{ label }}</span>`,
  styles: `
    .badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: .03em;
    }
    .neutral { background: #eceff1; color: #37474f; }
    .info    { background: #e3f2fd; color: #0d47a1; }
    .warn    { background: #fff3e0; color: #e65100; }
    .danger  { background: #fdecea; color: #b71c1c; }
    .success { background: #e8f5e9; color: #1b5e20; }
  `
})
export class StatusBadge {
  readonly kind = input<keyof typeof STATUS_LABELS>('request');
  readonly value = input.required<number>();

  get label(): string {
    return STATUS_LABELS[this.kind()]?.[this.value()] ?? String(this.value());
  }

  get tone(): string {
    const v = this.value();
    const k = this.kind();
    if (k === 'priority') return v >= 3 ? 'danger' : v === 2 ? 'warn' : 'neutral';
    if (v === 0 || v === 6 || v === 3 || v === 4) return 'neutral';
    if (v === 2 || v === 5) return 'success';
    if (v === 1 || v === 4) return 'info';
    return 'warn';
  }
}
