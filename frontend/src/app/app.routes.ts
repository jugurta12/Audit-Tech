import { Routes } from '@angular/router';
import { AuditForm } from './components/audit-form/audit-form';
import { AuditDetail } from './components/audit-detail/audit-detail';
import { Settings } from './components/settings/settings';


export const routes: Routes = [
  { path: '', component: AuditForm },
  { path: 'detail/:id', component: AuditDetail },
  { path: 'settings', component: Settings },
  { path: '**', redirectTo: '' }
];