import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ApiService } from '../../core/api.service';
import { Product, StockItem, Warehouse } from '../../core/models';
import { SkeletonComponent } from '../../shared/components/skeleton';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-admin-inventory',
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatCardModule, MatSlideToggleModule, SkeletonComponent, TranslatePipe],
  template: `
    <h1>Inventory Management</h1>

    @if (msg()) { <p class="ok">{{ msg() }}</p> }
    @if (err()) { <p class="error">{{ err() }}</p> }

    @if (loading()) {
      <div class="stats">
        @for (i of [1,2,3,4]; track i) { <app-skeleton variant="stat" /> }
      </div>
      <div class="section-header"><h2>{{ 'ADMIN.PRODUCTS' | t }}</h2></div>
      <div class="skeleton-table">
        <div class="skel-thead" style="grid-template-columns:100px 1fr 120px 80px 110px 80px">
          <app-skeleton variant="text" width="70px" /><app-skeleton variant="text" width="100px" />
          <app-skeleton variant="text" width="90px" /><app-skeleton variant="text" width="60px" />
          <app-skeleton variant="text" width="80px" /><app-skeleton variant="text" width="60px" />
        </div>
        @for (i of [1,2,3]; track i) {
          <app-skeleton variant="table-row" [columns]="['80px','1fr','100px','60px','90px','70px']" />
        }
      </div>
      <div class="section-header"><h2>{{ 'ADMIN.WAREHOUSES' | t }}</h2></div>
      <div class="skeleton-table">
        <div class="skel-thead" style="grid-template-columns:100px 1fr 1fr 80px">
          <app-skeleton variant="text" width="70px" /><app-skeleton variant="text" width="100px" />
          <app-skeleton variant="text" width="120px" /><app-skeleton variant="text" width="60px" />
        </div>
        @for (i of [1,2]; track i) {
          <app-skeleton variant="table-row" [columns]="['80px','1fr','1fr','70px']" />
        }
      </div>
    } @else {
      <!-- Products Section -->
      <div class="section-header">
        <h2>{{ 'ADMIN.PRODUCTS' | t }}</h2>
        <button mat-flat-button color="primary" (click)="showProductForm.set(!showProductForm())">
          {{ showProductForm() ? 'Close' : '+ Add Product' }}
        </button>
      </div>

      @if (showProductForm()) {
        <mat-card class="form-card">
          <mat-card-content>
            <h3>{{ editingProductId() ? 'Edit Product' : 'New Product' }}</h3>
            <form (ngSubmit)="saveProduct()" class="form">
              <div class="row">
                <mat-form-field appearance="outline"><mat-label>Product Code</mat-label>
                  <input matInput [(ngModel)]="productForm.code" name="code" required placeholder="e.g. PP-500ML" /></mat-form-field>
                <mat-form-field appearance="outline"><mat-label>Product Name</mat-label>
                  <input matInput [(ngModel)]="productForm.name" name="name" required /></mat-form-field>
              </div>
              <mat-form-field appearance="outline" class="full"><mat-label>Description</mat-label>
                <textarea matInput rows="2" [(ngModel)]="productForm.description" name="desc"></textarea></mat-form-field>
              <div class="row">
                <mat-form-field appearance="outline"><mat-label>Category</mat-label>
                  <mat-select [(ngModel)]="productForm.category" name="category">
                    <mat-option value="Raw Material">Raw Material</mat-option>
                    <mat-option value="Spare Part">Spare Part</mat-option>
                    <mat-option value="Consumable">Consumable</mat-option>
                    <mat-option value="Finished Good">Finished Good</mat-option>
                    <mat-option value="Tool">Tool</mat-option>
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline"><mat-label>Unit</mat-label>
                  <mat-select [(ngModel)]="productForm.unit" name="unit">
                    <mat-option value="pcs">Pieces (pcs)</mat-option>
                    <mat-option value="kg">Kilograms (kg)</mat-option>
                    <mat-option value="ltr">Liters (ltr)</mat-option>
                    <mat-option value="m">Meters (m)</mat-option>
                    <mat-option value="box">Box</mat-option>
                    <mat-option value="roll">Roll</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
              <div class="row">
                <mat-form-field appearance="outline"><mat-label>SKU</mat-label>
                  <input matInput [(ngModel)]="productForm.sku" name="sku" /></mat-form-field>
                <mat-form-field appearance="outline"><mat-label>Unit Price (ETB)</mat-label>
                  <input matInput type="number" [(ngModel)]="productForm.unitPrice" name="price" min="0" /></mat-form-field>
              </div>
              <div class="actions">
                <button mat-flat-button color="primary" type="submit">{{ editingProductId() ? 'Update' : 'Create' }}</button>
                <button mat-stroked-button type="button" (click)="cancelProduct()">Cancel</button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      }

      <div class="table">
        <div class="thead" style="grid-template-columns:100px 1fr 120px 80px 110px 80px">
          <span>Code</span><span>Name</span><span>Category</span><span>Unit</span><span>Price</span><span>Actions</span>
        </div>
        @for (p of products(); track p.id) {
          <div class="trow" style="grid-template-columns:100px 1fr 120px 80px 110px 80px">
            <span class="code">{{ p.code }}</span>
            <span>{{ p.name }}</span>
            <span>{{ p.category || '—' }}</span>
            <span>{{ p.unit || '—' }}</span>
            <span>{{ p.unitPrice | currency: 'ETB ' }}</span>
            <span class="row-actions">
              <button mat-icon-button color="primary" (click)="editProduct(p)">edit</button>
              <button mat-icon-button color="warn" (click)="removeProduct(p.id)">delete</button>
            </span>
          </div>
        } @empty { <p class="muted">No products yet. Add your first product above.</p> }
      </div>

      <!-- Warehouses Section -->
      <div class="section-header">
        <h2>{{ 'ADMIN.WAREHOUSES' | t }}</h2>
        <button mat-flat-button color="primary" (click)="showWarehouseForm.set(!showWarehouseForm())">
          {{ showWarehouseForm() ? 'Close' : '+ Add Warehouse' }}
        </button>
      </div>

      @if (showWarehouseForm()) {
        <mat-card class="form-card">
          <mat-card-content>
            <h3>{{ editingWarehouseId() ? 'Edit Warehouse' : 'New Warehouse' }}</h3>
            <form (ngSubmit)="saveWarehouse()" class="form">
              <div class="row">
                <mat-form-field appearance="outline"><mat-label>Warehouse Code</mat-label>
                  <input matInput [(ngModel)]="warehouseForm.code" name="wcode" required placeholder="e.g. WH-01" /></mat-form-field>
                <mat-form-field appearance="outline"><mat-label>Warehouse Name</mat-label>
                  <input matInput [(ngModel)]="warehouseForm.name" name="wname" required /></mat-form-field>
              </div>
              <mat-form-field appearance="outline" class="full"><mat-label>Location</mat-label>
                <input matInput [(ngModel)]="warehouseForm.location" name="wloc" placeholder="e.g. Addis Ababa, Bole" /></mat-form-field>
              <div class="actions">
                <button mat-flat-button color="primary" type="submit">{{ editingWarehouseId() ? 'Update' : 'Create' }}</button>
                <button mat-stroked-button type="button" (click)="cancelWarehouse()">Cancel</button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      }

      <div class="table">
        <div class="thead" style="grid-template-columns:100px 1fr 1fr 80px">
          <span>Code</span><span>Name</span><span>Location</span><span>Actions</span>
        </div>
        @for (w of warehouses(); track w.id) {
          <div class="trow" style="grid-template-columns:100px 1fr 1fr 80px">
            <span class="code">{{ w.code }}</span>
            <span>{{ w.name }}</span>
            <span>{{ w.location || '—' }}</span>
            <span class="row-actions">
              <button mat-icon-button color="primary" (click)="editWarehouse(w)">edit</button>
              <button mat-icon-button color="warn" (click)="removeWarehouse(w.id)">delete</button>
            </span>
          </div>
        } @empty { <p class="muted">No warehouses yet. Add your first warehouse above.</p> }
      </div>

      <!-- Stock Levels Section -->
      <div class="section-header">
        <h2>{{ 'ADMIN.STOCK_LEVELS' | t }}</h2>
      </div>

      <mat-card class="form-card">
        <mat-card-content>
          <h3>Stock Movement</h3>
          <form (ngSubmit)="adjustStock()" class="form">
            <div class="row">
              <mat-form-field appearance="outline"><mat-label>Product</mat-label>
                <mat-select [(ngModel)]="adjust.productId" name="prod" required>
                  @for (p of products(); track p.id) { <mat-option [value]="p.id">{{ p.code }} — {{ p.name }}</mat-option> }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Warehouse</mat-label>
                <mat-select [(ngModel)]="adjust.warehouseId" name="wh" required>
                  @for (w of warehouses(); track w.id) { <mat-option [value]="w.id">{{ w.name }}</mat-option> }
                </mat-select>
              </mat-form-field>
            </div>
            <div class="row">
              <mat-form-field appearance="outline"><mat-label>Movement Type</mat-label>
                <mat-select [(ngModel)]="adjust.type" name="type">
                  <mat-option [value]="0">📥 Stock In</mat-option>
                  <mat-option [value]="1">📤 Stock Out</mat-option>
                  <mat-option [value]="3">🔧 Adjustment</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Quantity</mat-label>
                <input matInput type="number" [(ngModel)]="adjust.quantity" name="qty" min="1" required /></mat-form-field>
            </div>
            <button mat-flat-button color="primary" type="submit" [disabled]="!adjust.productId || !adjust.warehouseId || !adjust.quantity">
              Apply Movement
            </button>
          </form>
        </mat-card-content>
      </mat-card>

      @if (stockMsg()) { <p class="ok">{{ stockMsg() }}</p> }

      <div class="table">
        <div class="thead" style="grid-template-columns:1fr 1fr 100px 90px 90px 110px">
          <span>Product</span><span>Warehouse</span><span>On Hand</span><span>Reserved</span><span>Min Stock</span><span>Status</span>
        </div>
        @for (s of stock(); track s.id) {
          <div class="trow" style="grid-template-columns:1fr 1fr 100px 90px 90px 110px">
            <span class="code">{{ s.productName }}</span>
            <span>{{ s.warehouseName }}</span>
            <span><strong>{{ s.quantity }}</strong></span>
            <span class="muted">{{ s.reservedQuantity }}</span>
            <span class="muted">{{ s.minStock }}</span>
            <span>
              @if (s.quantity <= 0) {
                <span class="status-badge danger">Out of Stock</span>
              } @else if (s.quantity <= s.minStock) {
                <span class="status-badge warn">Low Stock</span>
              } @else {
                <span class="status-badge ok">In Stock</span>
              }
            </span>
          </div>
        } @empty { <p class="muted">No stock records yet. Use the movement form above to add stock.</p> }
      </div>
    }
  `,
  styles: `
    .section-header { display: flex; justify-content: space-between; align-items: center; margin: 2rem 0 1rem; }
    .section-header h2 { margin: 0; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
    .form-card { margin-bottom: 1.5rem; }
    .form { display: grid; gap: .8rem; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .full { width: 100%; }
    .actions { display: flex; gap: .8rem; }
    .skeleton-table { border: 1px solid var(--mat-sys-outline-variant); border-radius: 12px; overflow: hidden; margin-bottom: 1rem; }
    .skel-thead { display: grid; gap: .8rem; padding: .7rem 1rem; background: #f4f7fb; }
    .table { border: 1px solid var(--mat-sys-outline-variant); border-radius: 12px; overflow: hidden; margin-bottom: 1rem; }
    .thead, .trow { display: grid; gap: .8rem; padding: .7rem 1rem; align-items: center; }
    .thead { background: #f4f7fb; font-weight: 700; font-size: .8rem; text-transform: uppercase; color: var(--mat-sys-on-surface-variant); }
    .trow { border-top: 1px solid var(--mat-sys-outline-variant); }
    .code { color: #0b3d91; font-weight: 600; }
    .row-actions { display: flex; gap: .1rem; }
    .status-badge { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: .75rem; font-weight: 600; }
    .status-badge.ok { background: #e8f5e9; color: #1b5e20; }
    .status-badge.warn { background: #fff3e0; color: #e65100; }
    .status-badge.danger { background: #fdecea; color: #b71c1c; }
    .muted { color: var(--mat-sys-on-surface-variant); }
    .ok { color: #1b5e20; }
    .error { color: #b71c1c; }
  `
})
export class AdminInventoryPage implements OnInit {
  readonly products = signal<Product[]>([]);
  readonly warehouses = signal<Warehouse[]>([]);
  readonly stock = signal<StockItem[]>([]);
  readonly stockMsg = signal('');
  readonly msg = signal('');
  readonly err = signal('');
  readonly loading = signal(true);

  readonly showProductForm = signal(false);
  readonly showWarehouseForm = signal(false);
  readonly editingProductId = signal<string | null>(null);
  readonly editingWarehouseId = signal<string | null>(null);

  productForm: any = { code: '', name: '', description: '', category: '', unit: 'pcs', sku: '', unitPrice: 0 };
  warehouseForm: any = { code: '', name: '', location: '' };
  adjust = { productId: undefined as string | undefined, warehouseId: undefined as string | undefined, type: 0, quantity: 0 };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loading.set(true);
    this.api.get<Product[]>('/inventory/products').subscribe({ next: p => this.products.set(p) });
    this.api.get<Warehouse[]>('/inventory/warehouses').subscribe({ next: w => { this.warehouses.set(w); this.loading.set(false); } });
    this.api.get<StockItem[]>('/inventory/stock').subscribe({ next: s => this.stock.set(s) });
  }

  saveProduct(): void {
    if (!this.productForm.code || !this.productForm.name) return;
    const body = { ...this.productForm, unitPrice: Number(this.productForm.unitPrice) || 0, isActive: true };
    if (this.editingProductId()) {
      this.api.put(`/inventory/products/${this.editingProductId()}`, body).subscribe({ next: () => { this.msg.set('Product updated.'); this.cancelProduct(); this.ngOnInit(); }, error: e => this.err.set(e.error?.error || 'Update failed.') });
    } else {
      this.api.post('/inventory/products', body).subscribe({ next: () => { this.msg.set('Product created.'); this.cancelProduct(); this.ngOnInit(); }, error: e => this.err.set(e.error?.error || 'Create failed.') });
    }
  }

  editProduct(p: Product): void {
    this.showProductForm.set(true); this.editingProductId.set(p.id);
    this.productForm = { code: p.code, name: p.name, description: p.description || '', category: p.category || '', unit: p.unit || 'pcs', sku: (p as any).sku || '', unitPrice: p.unitPrice };
  }

  cancelProduct(): void {
    this.showProductForm.set(false); this.editingProductId.set(null);
    this.productForm = { code: '', name: '', description: '', category: '', unit: 'pcs', sku: '', unitPrice: 0 };
    this.msg.set(''); this.err.set('');
  }

  removeProduct(id: string): void {
    if (!confirm('Delete this product?')) return;
    this.api.delete(`/inventory/products/${id}`).subscribe({ next: () => { this.msg.set('Product deleted.'); this.ngOnInit(); } });
  }

  saveWarehouse(): void {
    if (!this.warehouseForm.code || !this.warehouseForm.name) return;
    if (this.editingWarehouseId()) {
      this.api.put(`/inventory/warehouses/${this.editingWarehouseId()}`, this.warehouseForm).subscribe({ next: () => { this.msg.set('Warehouse updated.'); this.cancelWarehouse(); this.ngOnInit(); }, error: e => this.err.set(e.error?.error || 'Update failed.') });
    } else {
      this.api.post('/inventory/warehouses', this.warehouseForm).subscribe({ next: () => { this.msg.set('Warehouse created.'); this.cancelWarehouse(); this.ngOnInit(); }, error: e => this.err.set(e.error?.error || 'Create failed.') });
    }
  }

  editWarehouse(w: Warehouse): void {
    this.showWarehouseForm.set(true); this.editingWarehouseId.set(w.id);
    this.warehouseForm = { code: w.code, name: w.name, location: w.location || '' };
  }

  cancelWarehouse(): void {
    this.showWarehouseForm.set(false); this.editingWarehouseId.set(null);
    this.warehouseForm = { code: '', name: '', location: '' };
    this.msg.set(''); this.err.set('');
  }

  removeWarehouse(id: string): void {
    if (!confirm('Delete this warehouse?')) return;
    this.api.delete(`/inventory/warehouses/${id}`).subscribe({ next: () => { this.msg.set('Warehouse deleted.'); this.ngOnInit(); } });
  }

  adjustStock(): void {
    if (!this.adjust.productId || !this.adjust.warehouseId) return;
    this.api.post<{ message: string }>('/inventory/stock', {
      productId: this.adjust.productId, warehouseId: this.adjust.warehouseId,
      type: this.adjust.type, quantity: Number(this.adjust.quantity) || 0
    }).subscribe({
      next: res => { this.stockMsg.set(res.message); this.adjust = { productId: undefined, warehouseId: undefined, type: 0, quantity: 0 }; this.ngOnInit(); },
      error: err => this.stockMsg.set(err.error?.error ?? 'Could not adjust stock.')
    });
  }
}
