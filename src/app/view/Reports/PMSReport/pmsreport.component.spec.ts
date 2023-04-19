import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PmsreportComponent } from './pmsreport.component';

describe('PmsreportComponent', () => {
  let component: PmsreportComponent;
  let fixture: ComponentFixture<PmsreportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PmsreportComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PmsreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
