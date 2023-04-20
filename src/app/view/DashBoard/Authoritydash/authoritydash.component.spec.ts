import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthoritydashComponent } from './authoritydash.component';

describe('AuthoritydashComponent', () => {
  let component: AuthoritydashComponent;
  let fixture: ComponentFixture<AuthoritydashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuthoritydashComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthoritydashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
