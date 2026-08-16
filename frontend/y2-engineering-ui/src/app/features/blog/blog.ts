import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { BlogPost } from '../../core/models';
import { PageHeader } from '../../shared/components/page-header';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-blog',
  imports: [CommonModule, PageHeader, RouterLink, TranslatePipe],
  template: `
    <app-page-header [title]="'BLOG.TITLE' | t"
      [subtitle]="'BLOG.SUBTITLE' | t" />
    <div class="list">
      @for (post of posts(); track post.id) {
        <a class="post" [routerLink]="['/blog', post.slug]">
          <span class="tag">{{ post.category || 'Article' }}</span>
          <h3>{{ post.title }}</h3>
          <p>{{ post.excerpt }}</p>
          <span class="date">{{ post.publishedAt | date: 'longDate' }}</span>
        </a>
      } @empty {
        <p class="muted">{{ 'BLOG.EMPTY' | t }}</p>
      }
    </div>
  `,
  styles: `
    .list { max-width: 820px; margin: 0 auto; display: grid; gap: 1.2rem; }
    .post { border: 1px solid var(--mat-sys-outline-variant); border-radius: 12px; padding: 1.5rem; text-decoration: none; color: inherit; display: block; }
    .post:hover { box-shadow: 0 6px 18px rgba(11,61,145,.1); }
    .tag { background: #e3edfb; color: #0b3d91; font-size: .75rem; font-weight: 700; padding: 2px 10px; border-radius: 999px; text-transform: uppercase; }
    .post p { color: var(--mat-sys-on-surface-variant); }
    .date { color: var(--mat-sys-on-surface-variant); font-size: .85rem; }
    .muted { color: var(--mat-sys-on-surface-variant); text-align: center; }
  `
})
export class BlogPage implements OnInit {
  readonly posts = signal<BlogPost[]>([]);

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.get<BlogPost[]>('/cms/blog').subscribe({
      next: p => this.posts.set(p)
    });
  }
}
