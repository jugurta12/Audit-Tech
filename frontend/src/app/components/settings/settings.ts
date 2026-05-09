import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuditService } from '../../services/audit';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss'
})
export class Settings implements OnInit {

  private auditService = inject(AuditService);
  private router = inject(Router);

  rowsPerPage: number = 10;
  lightMode: boolean = false;
  savedMessage: string = '';
  

  ngOnInit() {
    const saved = localStorage.getItem('audittech-settings');
    if (saved) {
      const s = JSON.parse(saved);
      this.rowsPerPage = s.rowsPerPage ?? 10;
      this.lightMode = s.lightMode ?? false;
    }
    this.applyTheme();
  }

  goBack() {
    this.router.navigate(['/']);
  }

  applyTheme() {
    document.body.classList.toggle('light-mode', this.lightMode);
  }

  saveSettings() {
    localStorage.setItem('audittech-settings', JSON.stringify({
      rowsPerPage: this.rowsPerPage,
      lightMode: this.lightMode,
    }));
    this.applyTheme();
    this.savedMessage = '✅ Settings saved!';
    setTimeout(() => this.savedMessage = '', 2500);
  }
clearHistory() {
  if (!confirm('Vider tout l\'historique ? Cette action est irréversible.')) return;
  this.auditService.clearAll().subscribe({
    next: () => {
      this.savedMessage = '🗑️ Historique vidé.';
      setTimeout(() => this.savedMessage = '', 2500);
    },
    error: () => {
      this.savedMessage = '❌ Erreur lors de la suppression.';
      setTimeout(() => this.savedMessage = '', 2500);
    }
  });
}
  
goToDetail() {
  this.auditService.getAudits().subscribe({
    next: (audits) => {
      if (!audits.length) return;
      const last = audits.reduce((a: any, b: any) =>
        new Date(a.createdAt) > new Date(b.createdAt) ? a : b
      );
      this.router.navigate(['/detail', last.id], { state: { audit: last } });
    }
  });
}
}