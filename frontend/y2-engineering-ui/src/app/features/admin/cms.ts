import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ApiService } from '../../core/api.service';
import { BlogPost, Faq, Page } from '../../core/models';
import { SkeletonComponent } from '../../shared/components/skeleton';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-admin-cms',
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatCardModule, SkeletonComponent, TranslatePipe],
  template: `
    <h1>{{ 'ADMIN.CMS_TITLE' | t }}</h1>

    <div class="tabs">
      <button [class.on]="tab() === 'pages'" (click)="tab.set('pages')">{{ 'ADMIN.TAB_PAGES' | t }}</button>
      <button [class.on]="tab() === 'blog'" (click)="tab.set('blog')">{{ 'ADMIN.TAB_BLOG' | t }}</button>
      <button [class.on]="tab() === 'faqs'" (click)="tab.set('faqs')">{{ 'ADMIN.TAB_FAQS' | t }}</button>
    </div>

    @if (msg()) { <p class="ok">{{ msg() }}</p> }

    @if (loading()) {
      <div class="list">
        @for (i of [1,2,3,4]; track i) {
          <div class="skel-row">
            <app-skeleton variant="text" width="180px" />
            <app-skeleton variant="text" width="100px" />
            <app-skeleton variant="text" width="60px" />
          </div>
        }
      </div>
    } @else {
      @switch (tab()) {
        @case ('pages') {
          <div class="list">
            @for (p of pages(); track p.id) {
              <div class="item">
                <strong>{{ p.title }}</strong>
                <span class="slug">/{{ p.slug }}</span>
                <span class="badge" [class.pub]="p.isPublished">{{ p.isPublished ? ('ADMIN.PUBLISHED' | t) : ('ADMIN.DRAFT' | t) }}</span>
              </div>
            } @empty { <p class="muted">{{ 'ADMIN.NO_PAGES' | t }}</p> }
          </div>
        }

        @case ('blog') {
          <mat-card class="form-card">
            <mat-card-content>
              <h3>{{ editingId() ? 'Edit Post' : 'New Post' }}</h3>
              <form (ngSubmit)="savePost()" class="form">
                <mat-form-field appearance="outline" class="full">
                  <mat-label>{{ 'ADMIN.POST_TITLE' | t }}</mat-label>
                  <input matInput [(ngModel)]="postForm.title" name="title" required />
                </mat-form-field>
                <mat-form-field appearance="outline" class="full">
                  <mat-label>{{ 'ADMIN.EXCERPT' | t }}</mat-label>
                  <input matInput [(ngModel)]="postForm.excerpt" name="excerpt" />
                </mat-form-field>
                <div class="row">
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'ADMIN.CATEGORY' | t }}</mat-label>
                    <input matInput [(ngModel)]="postForm.category" name="category" />
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Image URL</mat-label>
                    <input matInput [(ngModel)]="postForm.imageUrl" name="imageUrl" placeholder="https://..." />
                  </mat-form-field>
                </div>
                <mat-form-field appearance="outline" class="full">
                  <mat-label>Image Upload</mat-label>
                  <input matInput readonly [value]="postForm.imageFile ? postForm.imageFile.name : ''" />
                  <input type="file" matInput hidden #fileInput (change)="onFileSelected($event, 'post')" accept="image/*" />
                  <button matSuffix mat-icon-button type="button" (click)="fileInput.click()">upload</button>
                </mat-form-field>
                @if (postForm.imagePreview) {
                  <div class="preview"><img [src]="postForm.imagePreview" alt="Preview" /></div>
                }
                <mat-form-field appearance="outline" class="full">
                  <mat-label>{{ 'ADMIN.CONTENT' | t }}</mat-label>
                  <textarea matInput rows="8" [(ngModel)]="postForm.content" name="content"></textarea>
                </mat-form-field>
                <div class="actions">
                  <button mat-flat-button color="primary" type="submit">{{ editingId() ? 'Update' : ('ADMIN.PUBLISH_BTN' | t) }}</button>
                  <button mat-stroked-button type="button" (click)="cancelPost()">Cancel</button>
                </div>
              </form>
            </mat-card-content>
          </mat-card>

          <div class="list">
            @for (p of posts(); track p.id) {
              <div class="item">
                <div class="item-info">
                  <strong>{{ p.title }}</strong>
                  <span class="slug">/{{ p.slug }}</span>
                  <span class="badge" [class.pub]="p.isPublished">{{ p.isPublished ? ('ADMIN.PUBLISHED' | t) : ('ADMIN.DRAFT' | t) }}</span>
                </div>
                <div class="item-actions">
                  <button mat-icon-button color="primary" (click)="editPost(p)">edit</button>
                  <button mat-icon-button (click)="togglePost(p)">{{ p.isPublished ? 'unpublish' : 'publish' }}</button>
                  <button mat-icon-button color="warn" (click)="deletePost(p)">delete</button>
                </div>
              </div>
            } @empty { <p class="muted">{{ 'ADMIN.NO_POSTS' | t }}</p> }
          </div>
        }

        @case ('faqs') {
          <mat-card class="form-card">
            <mat-card-content>
              <h3>{{ editingFaqId() ? 'Edit FAQ' : 'New FAQ' }}</h3>
              <form (ngSubmit)="saveFaq()" class="form">
                <mat-form-field appearance="outline" class="full">
                  <mat-label>{{ 'ADMIN.QUESTION' | t }}</mat-label>
                  <input matInput [(ngModel)]="faqForm.question" name="question" required />
                </mat-form-field>
                <mat-form-field appearance="outline" class="full">
                  <mat-label>{{ 'ADMIN.ANSWER' | t }}</mat-label>
                  <textarea matInput rows="3" [(ngModel)]="faqForm.answer" name="answer" required></textarea>
                </mat-form-field>
                <div class="actions">
                  <button mat-flat-button color="primary" type="submit">{{ editingFaqId() ? 'Update' : ('ADMIN.ADD_FAQ' | t) }}</button>
                  <button mat-stroked-button type="button" (click)="cancelFaq()">Cancel</button>
                </div>
              </form>
            </mat-card-content>
          </mat-card>

          <div class="list">
            @for (f of faqs(); track f.id) {
              <div class="item">
                <div class="item-info">
                  <strong>{{ f.question }}</strong>
                  <span class="badge" [class.pub]="f.isActive">{{ f.isActive ? ('ADMIN.ACTIVE_LABEL' | t) : ('ADMIN.HIDDEN' | t) }}</span>
                </div>
                <div class="item-actions">
                  <button mat-icon-button color="primary" (click)="editFaq(f)">edit</button>
                  <button mat-icon-button (click)="toggleFaq(f)">{{ f.isActive ? 'hide' : 'show' }}</button>
                  <button mat-icon-button color="warn" (click)="deleteFaq(f)">delete</button>
                </div>
              </div>
            } @empty { <p class="muted">{{ 'ADMIN.NO_FAQS' | t }}</p> }
          </div>
        }
      }
    }
  `,
  styles: `
    .tabs { display: flex; gap: .5rem; margin: 1rem 0; }
    .tabs button { padding: .5rem 1.1rem; border: 1px solid var(--mat-sys-outline-variant); background: var(--mat-sys-surface); border-radius: 8px; cursor: pointer; font-weight: 600; transition: all .15s; }
    .tabs button.on { background: #0b3d91; color: #fff; border-color: #0b3d91; }
    .form-card { margin-bottom: 1.5rem; }
    .form { display: grid; gap: .8rem; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .full { width: 100%; }
    .actions { display: flex; gap: .8rem; }
    .list { display: grid; gap: .5rem; }
    .skel-row { display: flex; gap: 1rem; align-items: center; padding: .8rem 1rem; border: 1px solid var(--mat-sys-outline-variant); border-radius: 10px; }
    .item { display: flex; align-items: center; gap: 1rem; padding: .8rem 1rem; border: 1px solid var(--mat-sys-outline-variant); border-radius: 10px; }
    .item-info { flex: 1; display: flex; align-items: center; gap: .6rem; min-width: 0; }
    .item-info strong { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .slug { color: #0b3d91; font-size: .8rem; }
    .badge { font-size: .7rem; padding: 2px 8px; border-radius: 999px; background: #fdecea; color: #b71c1c; font-weight: 600; }
    .badge.pub { background: #e8f5e9; color: #1b5e20; }
    .item-actions { display: flex; gap: .2rem; }
    .preview { margin: .5rem 0; }
    .preview img { max-width: 200px; border-radius: 8px; border: 1px solid #ddd; }
    .ok { color: #1b5e20; }
    .muted { color: var(--mat-sys-on-surface-variant); padding: 1rem; text-align: center; }
  `
})
export class AdminCmsPage implements OnInit {
  readonly tab = signal('pages');
  readonly pages = signal<Page[]>([]);
  readonly posts = signal<BlogPost[]>([]);
  readonly faqs = signal<Faq[]>([]);
  readonly editingId = signal<string | null>(null);
  readonly editingFaqId = signal<string | null>(null);
  readonly msg = signal('');
  readonly loading = signal(true);

  postForm: any = { title: '', excerpt: '', category: '', content: '', imageUrl: '', imageFile: null as File | null, imagePreview: '' };
  faqForm = { question: '', answer: '' };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loading.set(true);
    this.api.get<Page[]>('/cms/pages').subscribe({ next: p => this.pages.set(p) });
    this.api.get<BlogPost[]>('/cms/blog/manage').subscribe({ next: p => this.posts.set(p) });
    this.api.get<Faq[]>('/cms/faqs/manage').subscribe({ next: f => { this.faqs.set(f); this.loading.set(false); } });
  }

  onFileSelected(event: Event, type: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.postForm.imageFile = file;
      const reader = new FileReader();
      reader.onload = () => this.postForm.imagePreview = reader.result as string;
      reader.readAsDataURL(file);
    }
  }

  async uploadImage(): Promise<string | null> {
    if (!this.postForm.imageFile) return this.postForm.imageUrl || null;
    try {
      const result = await this.api.upload('/media/upload', this.postForm.imageFile, 'blog').toPromise();
      return result?.url || result?.storagePath || null;
    } catch { return this.postForm.imageUrl || null; }
  }

  async savePost(): Promise<void> {
    if (!this.postForm.title.trim()) return;
    const imageUrl = await this.uploadImage();
    const body = { title: this.postForm.title, excerpt: this.postForm.excerpt, category: this.postForm.category, content: this.postForm.content, tags: imageUrl, isPublished: true, publishedAt: new Date().toISOString() };
    if (this.editingId()) {
      this.api.put(`/cms/blog/${this.editingId()}`, body).subscribe({ next: () => { this.msg.set('Post updated.'); this.cancelPost(); this.ngOnInit(); } });
    } else {
      this.api.post('/cms/blog', body).subscribe({ next: () => { this.msg.set('Post published.'); this.cancelPost(); this.ngOnInit(); } });
    }
  }

  editPost(p: BlogPost): void {
    this.editingId.set(p.id);
    this.postForm = { title: p.title, excerpt: p.excerpt || '', category: p.category || '', content: p.content || '', imageUrl: '', imageFile: null, imagePreview: '' };
  }

  cancelPost(): void {
    this.editingId.set(null);
    this.postForm = { title: '', excerpt: '', category: '', content: '', imageUrl: '', imageFile: null, imagePreview: '' };
  }

  togglePost(p: BlogPost): void {
    this.api.put(`/cms/blog/${p.id}`, { ...p, isPublished: !p.isPublished, content: p.content ?? '', publishedAt: p.publishedAt ?? new Date().toISOString() }).subscribe({ next: () => this.ngOnInit() });
  }

  deletePost(p: BlogPost): void {
    if (!confirm('Delete this post?')) return;
    this.api.delete(`/cms/blog/${p.id}`).subscribe({ next: () => { this.msg.set('Deleted.'); this.ngOnInit(); } });
  }

  saveFaq(): void {
    if (!this.faqForm.question || !this.faqForm.answer) return;
    if (this.editingFaqId()) {
      this.api.put(`/cms/faqs/${this.editingFaqId()}`, { ...this.faqForm, category: 'General', sortOrder: 99, isActive: true }).subscribe({ next: () => { this.msg.set('FAQ updated.'); this.cancelFaq(); this.ngOnInit(); } });
    } else {
      this.api.post('/cms/faqs', { ...this.faqForm, category: 'General', sortOrder: 99, isActive: true }).subscribe({ next: () => { this.msg.set('FAQ added.'); this.cancelFaq(); this.ngOnInit(); } });
    }
  }

  editFaq(f: Faq): void {
    this.editingFaqId.set(f.id);
    this.faqForm = { question: f.question, answer: f.answer };
  }

  cancelFaq(): void {
    this.editingFaqId.set(null);
    this.faqForm = { question: '', answer: '' };
  }

  toggleFaq(f: Faq): void {
    this.api.put(`/cms/faqs/${f.id}`, { ...f, isActive: !f.isActive }).subscribe({ next: () => this.ngOnInit() });
  }

  deleteFaq(f: Faq): void {
    if (!confirm('Delete this FAQ?')) return;
    this.api.delete(`/cms/faqs/${f.id}`).subscribe({ next: () => { this.msg.set('Deleted.'); this.ngOnInit(); } });
  }
}
