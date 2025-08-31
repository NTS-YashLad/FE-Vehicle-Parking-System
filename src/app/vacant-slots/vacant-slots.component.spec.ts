import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VacantSlotsComponent } from './vacant-slots.component';

describe('VacantSlotsComponent', () => {
  let component: VacantSlotsComponent;
  let fixture: ComponentFixture<VacantSlotsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [VacantSlotsComponent]
    });
    fixture = TestBed.createComponent(VacantSlotsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
