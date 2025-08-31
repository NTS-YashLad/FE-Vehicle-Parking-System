import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReserveAndVacateComponent } from './reserve-and-vacate.component';

describe('ReserveAndVacateComponent', () => {
  let component: ReserveAndVacateComponent;
  let fixture: ComponentFixture<ReserveAndVacateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReserveAndVacateComponent]
    });
    fixture = TestBed.createComponent(ReserveAndVacateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
