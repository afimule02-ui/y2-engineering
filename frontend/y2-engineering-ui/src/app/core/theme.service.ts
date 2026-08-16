import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly currentTheme = signal<Theme>(this.loadTheme());

  constructor() {
    this.apply(this.currentTheme());
  }

  toggle(): void {
    const next = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.currentTheme.set(next);
    this.apply(next);
    localStorage.setItem('y2-theme', next);
  }

  private apply(theme: Theme): void {
    document.documentElement.classList.toggle('dark-theme', theme === 'dark');
  }

  private loadTheme(): Theme {
    const saved = localStorage.getItem('y2-theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
