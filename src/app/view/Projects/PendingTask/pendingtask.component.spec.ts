import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingtaskComponent } from './pendingtask.component';

describe('PendingtaskComponent', () => {
  let component: PendingtaskComponent;
  let fixture: ComponentFixture<PendingtaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PendingtaskComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingtaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
