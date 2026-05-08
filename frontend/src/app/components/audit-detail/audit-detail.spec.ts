import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditDetail } from './audit-detail';

describe('AuditDetail', () => {
  let component: AuditDetail;
  let fixture: ComponentFixture<AuditDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(AuditDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
