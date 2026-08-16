import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export const API_BASE = '/api';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  get<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, String(value));
        }
      }
    }
    return this.http.get<T>(`${API_BASE}${path}`, { params: httpParams });
  }

  post<T>(path: string, body?: unknown): Observable<T> {
    return this.http.post<T>(`${API_BASE}${path}`, body ?? {});
  }

  put<T>(path: string, body?: unknown): Observable<T> {
    return this.http.put<T>(`${API_BASE}${path}`, body ?? {});
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${API_BASE}${path}`);
  }

  upload(path: string, file: File, folder?: string): Observable<{ id: string; fileName: string; fileType: string; size: number; storagePath: string; url?: string }> {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) {
      formData.append('folder', folder);
    }
    return this.http.post<{ id: string; fileName: string; fileType: string; size: number; storagePath: string; url?: string }>(
      `${API_BASE}${path}`, formData
    );
  }
}
