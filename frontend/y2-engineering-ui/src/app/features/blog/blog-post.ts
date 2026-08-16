import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { BlogPost } from '../../core/models';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-blog-post',
  imports: [CommonModule, RouterLink, TranslatePipe],
  template: `
    <article class="post">
      <a routerLink="/blog" class="back">{{ 'BLOG.BACK' | t }}</a>
      @if (post(); as p) {
        <span class="tag">{{ p.category || 'Article' }}</span>
        <h1>{{ p.title }}</h1>
        <p class="date">{{ p.publishedAt | date: 'longDate' }}</p>
        <div class="body">{{ p.content }}</div>
      } @else {
        <p class="muted">{{ 'BLOG.LOADING' | t }}</p>
      }
    </article>
  `,
  styles: `
    .post { max-width: 760px; margin: 0 auto; }
    .back { color: #0b3d91; text-decoration: none; font-weight: 600; }
    .tag { background: #e3edfb; color: #0b3d91; font-size: .75rem; font-weight: 700; padding: 2px 10px; border-radius: 999px; text-transform: uppercase; }
    .date { color: var(--mat-sys-on-surface-variant); }
    .body { line-height: 1.8; white-space: pre-wrap; margin-top: 1.5rem; }
    .muted { color: var(--mat-sys-on-surface-variant); }
  `
})
export class BlogPostPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);
  readonly post = signal<BlogPost | null>(null);

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.api.get<BlogPost>(`/cms/blog/${slug}`).subscribe({
        next: p => this.post.set(p)
      });
    }
  }
}
