import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReserveSlotsComponent } from './reserve-slots.component';

describe('ReserveSlotsComponent', () => {
  let component: ReserveSlotsComponent;
  let fixture: ComponentFixture<ReserveSlotsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReserveSlotsComponent]
    });
    fixture = TestBed.createComponent(ReserveSlotsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
