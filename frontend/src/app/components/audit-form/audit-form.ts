import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { AuditService } from '../../services/audit';
import { Router } from '@angular/router';


@Component({
  selector: 'app-audit-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSelectModule,
  ],
  templateUrl: './audit-form.html',
  styleUrl: './audit-form.scss'
})
export class AuditForm implements OnInit {

  siteUrl: string = '';
  audits: any[] = [];
  isLoading: boolean = false;
  sortOrder: string = 'date_desc';
  selectAll: boolean = false;
  searchQuery: string = '';
  allAudits: any[] = []; // stocke la liste complète
  private router = inject(Router);

  displayedColumns: string[] = ['select', 'url', 'score', 'trend', 'date', 'actions'];

  private auditService = inject(AuditService);

  ngOnInit() {
    this.chargerHistorique();
  }

  chargerHistorique() {
  this.auditService.getAudits().subscribe({
    next: (data) => {
      this.allAudits = data.map((a: any) => ({ ...a, selected: false }));
      this.audits = [...this.allAudits];
      this.sortAudits();
    },
    error: (err) => console.error('Erreur historique :', err)
  });
}

  lancerAudit() {
    if (!this.siteUrl || this.isLoading) return;
    this.isLoading = true;
    this.auditService.lancerAnalyse(this.siteUrl).subscribe({
      next: () => {
        this.chargerHistorique();
        this.siteUrl = '';
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur analyse :', err);
        this.isLoading = false;
        alert("Erreur lors de l'analyse.");
      }
    });
  }

  supprimer(id: number) {
    if (!confirm('Voulez-vous vraiment supprimer cet audit ?')) return;
    this.auditService.supprimerAudit(id).subscribe({
      next: () => this.chargerHistorique(),
      error: (err) => console.error('Erreur suppression', err)
    });
  }

  toggleAll(checked: boolean) {
    this.audits = this.audits.map(a => ({ ...a, selected: checked }));
  }

  bulkDelete() {
    const toDelete = this.audits.filter(a => a.selected);
    if (!toDelete.length) return;
    if (!confirm(`Supprimer ${toDelete.length} audit(s) ?`)) return;

    let remaining = toDelete.length;
    toDelete.forEach(a => {
      this.auditService.supprimerAudit(a.id).subscribe({
        next: () => {
          remaining--;
          if (remaining === 0) this.chargerHistorique();
        },
        error: (err) => console.error('Erreur bulk delete', err)
      });
    });
  }

  sortAudits() {
    const sorted = [...this.audits];
    switch (this.sortOrder) {
      case 'score_desc': sorted.sort((a, b) => b.score - a.score); break;
      case 'score_asc':  sorted.sort((a, b) => a.score - b.score); break;
      case 'date_desc':  sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
      case 'date_asc':   sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); break;
    }
    this.audits = sorted;
  }

  getScoreClass(score: number): string {
    if (score >= 70) return 'green';
    if (score >= 50) return 'yellow';
    return 'red';
  }

  getTrendBars(audit: any): number[] {
    // Génère 5 barres relatives au score pour simuler une tendance
    const base = audit.score;
    return [
      Math.max(4, base - 15),
      Math.max(4, base - 8),
      Math.max(4, base - 12),
      Math.max(4, base - 4),
      Math.max(4, base),
    ];
  }

  getTrendBarHeight(val: number): string {
    return Math.round((val / 100) * 24) + 'px';
  }

  get selectedCount(): number {
    return this.audits.filter(a => a.selected).length;
  }

  rerun(url: string) {
  this.siteUrl = url;
}

filterAudits() {
  const q = this.searchQuery.toLowerCase().trim();
  if (!q) {
    this.audits = [...this.allAudits];
  } else {
    this.audits = this.allAudits.filter(a =>
      a.url.toLowerCase().includes(q)
    );
  }
  this.sortAudits();
}

selectedAudit: any = null;
showPanel: boolean = false;

openDetail(audit: any) {
  this.router.navigate(['/detail', audit.id], { state: { audit } });
}

closePanel() {
  this.showPanel = false;
  this.selectedAudit = null;
}

getScoreColor(score: number): string {
  if (score >= 70) return '#4ade80';
  if (score >= 50) return '#fbbf24';
  return '#f87171';
}

getScoreGlow(score: number): string {
  if (score >= 70) return '#4ade8044';
  if (score >= 50) return '#fbbf2444';
  return '#f8717144';
}

getScoreLabel(score: number): string {
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Needs Work';
  return 'Poor';
}

getCircleDash(score: number): string {
  const circumference = 2 * Math.PI * 54;
  const filled = (score / 100) * circumference;
  return `${filled} ${circumference}`;
}

openLastDetail() {
  if (this.audits.length === 0) return;
  const last = this.allAudits.reduce((a, b) => 
    new Date(a.createdAt) > new Date(b.createdAt) ? a : b
  );
  this.router.navigate(['/detail', last.id], { state: { audit: last } });
}

goToSettings() {
  this.router.navigate(['/settings']);
}
}

