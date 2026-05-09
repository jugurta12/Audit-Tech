import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-audit-detail',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './audit-detail.html',
  styleUrl: './audit-detail.scss'
})
export class AuditDetail implements OnInit {

  audit: any = null;

  private router = new Router();

  constructor() {}



  ngOnInit() {
  const saved = localStorage.getItem('audittech-settings');
  if (saved) {
    const s = JSON.parse(saved);
    if (s.lightMode) document.body.classList.add('light-mode');
    else document.body.classList.remove('light-mode');
  }
   const nav = window.history.state;
    if (nav?.audit) {
      this.audit = nav.audit;
    } else {
      this.router.navigate(['/']);
    }
  }


  goBack() {
    this.router.navigate(['/']);
  }

  getScoreColor(score: number): string {
    if (score >= 70) return '#4ade80';
    if (score >= 50) return '#fbbf24';
    return '#f87171';
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

  getMetrics(score: number) {
    return [
      { label: 'First Contentful Paint', val: Math.min(100, Math.max(0, score - 5)) },
      { label: 'Speed Index',             val: Math.min(100, Math.max(0, score + 3)) },
      { label: 'Largest Contentful Paint',val: Math.min(100, Math.max(0, score - 10)) },
      { label: 'Time to Interactive',     val: Math.min(100, Math.max(0, score - 8)) },
      { label: 'Total Blocking Time',     val: Math.min(100, Math.max(0, score + 5)) },
      { label: 'Cumulative Layout Shift', val: Math.min(100, Math.max(0, score - 3)) },
    ];
  }


goToSettings() {
  this.router.navigate(['/settings']);
}
}