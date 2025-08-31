import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParkingDashboardComponent } from './parking-dashboard.component';

describe('ParkingDashboardComponent', () => {
  let component: ParkingDashboardComponent;
  let fixture: ComponentFixture<ParkingDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ParkingDashboardComponent]
    });
    fixture = TestBed.createComponent(ParkingDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
