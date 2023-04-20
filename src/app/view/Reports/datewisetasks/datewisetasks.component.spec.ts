import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatewisetasksComponent } from './datewisetasks.component';

describe('DatewisetasksComponent', () => {
  let component: DatewisetasksComponent;
  let fixture: ComponentFixture<DatewisetasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DatewisetasksComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DatewisetasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
