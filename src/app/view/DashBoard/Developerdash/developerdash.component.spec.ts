import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeveloperdashComponent } from './developerdash.component';

describe('DeveloperdashComponent', () => {
  let component: DeveloperdashComponent;
  let fixture: ComponentFixture<DeveloperdashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeveloperdashComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeveloperdashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
