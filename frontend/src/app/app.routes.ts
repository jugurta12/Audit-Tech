import { Routes } from '@angular/router';
import { AuditForm } from './components/audit-form/audit-form';
import { AuditDetail } from './components/audit-detail/audit-detail';

export const routes: Routes = [
  { path: '', component: AuditForm },
  { path: 'detail/:id', component: AuditDetail },
  { path: '**', redirectTo: '' }
];