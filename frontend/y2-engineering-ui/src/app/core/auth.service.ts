import { computed, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { TokenResponse, UserProfile } from './models';

const TOKEN_KEY = 'y2_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly user = signal<UserProfile | null>(null);
  readonly user$ = this.user.asReadonly();
  readonly isAdmin = computed(
    () => this.user()?.roles.some(r => ['SuperAdmin', 'Admin', 'Manager'].includes(r)) ?? false
  );

  constructor(private api: ApiService) {}

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  get isAuthenticated(): boolean {
    return !!this.token;
  }

  login(email: string, password: string) {
    return this.api.post<TokenResponse>('/auth/login', { email, password }).pipe(
      tap(res => this.applyToken(res))
    );
  }

  register(payload: { fullName: string; email: string; password: string; companyName?: string; phone?: string }) {
    return this.api.post<TokenResponse>('/auth/register', payload).pipe(
      tap(res => this.applyToken(res))
    );
  }

  loadMe() {
    return this.api.get<UserProfile>('/auth/me').pipe(
      tap(user => this.user.set(user))
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.user.set(null);
  }

  hasPermission(permission: string): boolean {
    return this.user()?.permissions.includes(permission) ?? false;
  }

  private applyToken(res: TokenResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    this.user.set(res.user);
  }
}
