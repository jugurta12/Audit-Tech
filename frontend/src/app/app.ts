import { Component } from '@angular/core';
// Enlève l'import du RouterOutlet ici si tu ne t'en sers pas
import { AuditForm } from './components/audit-form/audit-form';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AuditForm], // On laisse juste AuditForm
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  title = 'frontend';
}