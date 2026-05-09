import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  // L'URL de ton futur backend Next.js
  private apiUrl = 'http://localhost:3000/api/audit'; 

  constructor(private http: HttpClient) { }

  lancerAnalyse(url: string): Observable<any> {
    // On envoie l'URL au format JSON au backend
    return this.http.post(this.apiUrl, { siteUrl: url });
  }

  getAudits(take: number = 10): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}?take=${take}`);
}

supprimerAudit(id: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}?id=${id}`);
}
clearAll(): Observable<any> {
  return this.http.delete(`${this.apiUrl}?clearAll=true`);
}
}

