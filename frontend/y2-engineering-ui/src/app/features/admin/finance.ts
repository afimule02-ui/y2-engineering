import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ApiService } from '../../core/api.service';
import { Customer, Invoice, Payment } from '../../core/models';
import { StatusBadge } from '../../shared/components/status-badge';
import { SkeletonComponent } from '../../shared/components/skeleton';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-admin-finance',
  imports: [CommonModule, StatusBadge, FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, SkeletonComponent, TranslatePipe],
  template: `
    <h1>{{ 'ADMIN.REVENUE' | t }}</h1>

    @if (loading()) {
      <div class="stats">
        @for (i of [1,2,3,4]; track i) { <app-skeleton variant="stat" /> }
      </div>
      <div class="grid">
        <section class="panel"><h2>{{ 'ADMIN.INVOICES' | t }}</h2>
          <div class="skeleton-table">
            <div class="skel-thead"><app-skeleton variant="text" width="80px" /><app-skeleton variant="text" width="100px" /><app-skeleton variant="text" width="80px" /><app-skeleton variant="text" width="70px" /><app-skeleton variant="text" width="80px" /><app-skeleton variant="text" width="70px" /></div>
            @for (i of [1,2,3]; track i) { <app-skeleton variant="table-row" [columns]="['100px','1fr','90px','80px','90px','80px']" /> }
          </div>
        </section>
        <section class="panel"><h2>{{ 'ADMIN.PAYMENTS' | t }}</h2>
          <div class="skeleton-table">
            <div class="skel-thead"><app-skeleton variant="text" width="80px" /><app-skeleton variant="text" width="80px" /><app-skeleton variant="text" width="100px" /><app-skeleton variant="text" width="70px" /></div>
            @for (i of [1,2]; track i) { <app-skeleton variant="table-row" [columns]="['90px','90px','100px','80px']" /> }
          </div>
        </section>
      </div>
    } @else {
      <section class="panel">
        <h2>{{ 'ADMIN.CREATE_INVOICE' | t }}</h2>
        <form class="form" (ngSubmit)="createInvoice()">
          <mat-form-field appearance="outline" class="full">
            <mat-label>Customer</mat-label>
            <mat-select [(ngModel)]="invoiceForm.customerId" name="customer">
              @for (c of customers(); track c.id) { <mat-option [value]="c.id">{{ c.contactPerson }} ({{ c.companyName || c.customerCode }})</mat-option> }
            </mat-select>
          </mat-form-field>
          <div class="row">
            <mat-form-field appearance="outline"><mat-label>Subtotal (ETB)</mat-label>
              <input matInput type="number" [(ngModel)]="invoiceForm.subtotal" name="sub" /></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Tax rate (%)</mat-label>
              <input matInput type="number" [(ngModel)]="invoiceForm.taxRate" name="tax" /></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Due in (days)</mat-label>
              <input matInput type="number" [(ngModel)]="invoiceForm.dueDays" name="due" /></mat-form-field>
          </div>
          <button mat-flat-button color="primary" type="submit">{{ 'ADMIN.CREATE_INVOICE_BTN' | t }}</button>
          @if (invMsg()) { <p class="ok">{{ invMsg() }}</p> }
        </form>
      </section>

      <div class="grid">
        <section class="panel">
          <h2>{{ 'ADMIN.INVOICES' | t }}</h2>
          <div class="table">
            <div class="thead"><span>No.</span><span>Customer</span><span>Total</span><span>Paid</span><span>Balance</span><span>Status</span></div>
            @for (i of invoices(); track i.id) {
              <div class="trow">
                <span class="no">{{ i.invoiceNo }}</span>
                <span>{{ i.customerName || '—' }}</span>
                <span>{{ i.total | currency: 'ETB ' }}</span>
                <span>{{ i.paidAmount | currency: 'ETB ' }}</span>
                <span [class.overdue]="i.balance > 0">{{ i.balance | currency: 'ETB ' }}</span>
                <span><app-status-badge kind="invoice" [value]="i.status" /></span>
              </div>
            } @empty { <p class="muted">No invoices yet.</p> }
          </div>
        </section>

        <section class="panel">
          <h2>{{ 'ADMIN.RECORD_PAYMENT' | t }}</h2>
          <form class="form" (ngSubmit)="pay()">
            <mat-form-field appearance="outline" class="full">
              <mat-label>Invoice</mat-label>
              <mat-select [(ngModel)]="payForm.invoiceId" name="invoice">
                @for (i of invoices(); track i.id) {
                  <mat-option [value]="i.id" [disabled]="i.balance <= 0">{{ i.invoiceNo }} — balance {{ i.balance | currency: 'ETB ' }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full">
              <mat-label>Amount (ETB)</mat-label>
              <input matInput type="number" [(ngModel)]="payForm.amount" name="amount" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full">
              <mat-label>Method</mat-label>
              <mat-select [(ngModel)]="payForm.method" name="method">
                <mat-option [value]="0">Cash</mat-option>
                <mat-option [value]="1">Bank Transfer</mat-option>
                <mat-option [value]="2">Mobile Money</mat-option>
                <mat-option [value]="3">Cheque</mat-option>
                <mat-option [value]="4">Card</mat-option>
              </mat-select>
            </mat-form-field>
            <button mat-flat-button color="primary" type="submit">{{ 'ADMIN.RECORD_BTN' | t }}</button>
            @if (payMsg()) { <p class="ok">{{ payMsg() }}</p> }
          </form>
        </section>
      </div>

      <section class="panel">
        <h2>{{ 'ADMIN.PAYMENTS' | t }}</h2>
        <div class="table">
          <div class="thead"><span>No.</span><span>Invoice</span><span>Customer</span><span>Amount</span><span>Method</span><span>Date</span></div>
          @for (p of payments(); track p.id) {
            <div class="trow">
              <span class="no">{{ p.paymentNo }}</span>
              <span>{{ p.invoiceNo || '—' }}</span>
              <span>{{ p.customerName || '—' }}</span>
              <span>{{ p.amount | currency: 'ETB ' }}</span>
              <span>{{ methodLabel(p.method) }}</span>
              <span>{{ p.paymentDate | date: 'mediumDate' }}</span>
            </div>
          } @empty { <p class="muted">No payments recorded.</p> }
        </div>
      </section>
    }
  `,
  styles: `
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
    .panel { border: 1px solid var(--mat-sys-outline-variant); border-radius: 12px; padding: 1.3rem; margin-bottom: 1.2rem; }
    .grid { display: grid; grid-template-columns: 3fr 2fr; gap: 1.2rem; }
    @media (max-width: 1000px) { .grid { grid-template-columns: 1fr; } }
    .form { display: flex; flex-direction: column; gap: .8rem; }
    .row { display: grid; grid-template-columns: repeat(3, 1fr); gap: .8rem; }
    .full { width: 100%; }
    .skeleton-table { border: 1px solid var(--mat-sys-outline-variant); border-radius: 10px; overflow: hidden; }
    .skel-thead { display: grid; grid-template-columns: 120px 1fr 110px 100px 110px 110px; gap: .8rem; padding: .55rem .9rem; background: #f4f7fb; }
    .table { border: 1px solid var(--mat-sys-outline-variant); border-radius: 10px; overflow: hidden; }
    .thead, .trow { display: grid; grid-template-columns: 120px 1fr 110px 100px 110px 110px; gap: .8rem; padding: .55rem .9rem; align-items: center; }
    .thead { background: #f4f7fb; font-weight: 700; font-size: .75rem; text-transform: uppercase; color: var(--mat-sys-on-surface-variant); }
    .trow { border-top: 1px solid var(--mat-sys-outline-variant); font-size: .9rem; }
    .no { color: #0b3d91; font-weight: 700; }
    .overdue { color: #b71c1c; font-weight: 600; }
    .ok { color: #1b5e20; }
    .muted { color: var(--mat-sys-on-surface-variant); padding: .8rem; }
  `
})
export class AdminFinancePage implements OnInit {
  readonly customers = signal<Customer[]>([]);
  readonly invoices = signal<Invoice[]>([]);
  readonly payments = signal<Payment[]>([]);
  readonly invMsg = signal('');
  readonly payMsg = signal('');
  readonly loading = signal(true);

  readonly invoiceForm = { customerId: undefined as string | undefined, subtotal: 0, taxRate: 15, dueDays: 30 };
  readonly payForm = { invoiceId: undefined as string | undefined, amount: 0, method: 1 };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loading.set(true);
    this.api.get<Customer[]>('/customers').subscribe({ next: c => this.customers.set(c) });
    this.api.get<Invoice[]>('/finance/invoices').subscribe({ next: i => this.invoices.set(i) });
    this.api.get<Payment[]>('/finance/payments').subscribe({ next: p => { this.payments.set(p); this.loading.set(false); } });
  }

  methodLabel(m: number): string {
    return ['Cash', 'Bank Transfer', 'Mobile Money', 'Cheque', 'Card'][m] ?? '—';
  }

  createInvoice(): void {
    if (!this.invoiceForm.customerId) return;
    const subtotal = Number(this.invoiceForm.subtotal) || 0;
    const taxRate = Number(this.invoiceForm.taxRate) || 0;
    const now = new Date();
    const due = new Date(now.getTime() + (Number(this.invoiceForm.dueDays) || 30) * 86400000);
    this.api.post<Invoice>('/finance/invoices', {
      customerId: this.invoiceForm.customerId, issueDate: now.toISOString(),
      dueDate: due.toISOString(), subtotal, taxRate, notes: null
    }).subscribe({ next: i => { this.invMsg.set(`Invoice ${i.invoiceNo} created.`); this.ngOnInit(); } });
  }

  pay(): void {
    if (!this.payForm.invoiceId || !this.payForm.amount) return;
    this.api.post<{ paymentNo: string }>('/finance/payments', {
      invoiceId: this.payForm.invoiceId, amount: Number(this.payForm.amount),
      method: this.payForm.method, reference: null
    }).subscribe({
      next: res => { this.payMsg.set(`Payment ${res.paymentNo} recorded.`); this.payForm.amount = 0; this.ngOnInit(); },
      error: err => this.payMsg.set(err.error?.error ?? 'Payment failed.')
    });
  }
}
