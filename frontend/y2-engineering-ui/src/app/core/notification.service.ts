import { Injectable, inject, signal, OnDestroy } from '@angular/core';
import { ApiService } from './api.service';
import { DashboardData } from './models';

@Injectable({ providedIn: 'root' })
export class NotificationService implements OnDestroy {
  private readonly api = inject(ApiService);
  private intervalId: ReturnType<typeof setInterval> | null = null;

  readonly pendingRequests = signal(0);
  readonly pendingQuotations = signal(0);
  readonly totalCustomers = signal(0);
  readonly activeProjects = signal(0);

  start(): void {
    this.refresh();
    this.intervalId = setInterval(() => this.refresh(), 30_000);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  refresh(): void {
    this.api.get<DashboardData>('/admin/dashboard').subscribe({
      next: d => {
        this.pendingRequests.set(d.pendingRequests);
        this.pendingQuotations.set(d.pendingQuotations);
        this.totalCustomers.set(d.customers);
        this.activeProjects.set(d.activeProjects);
      }
    });
  }

  ngOnDestroy(): void {
    this.stop();
  }
}
