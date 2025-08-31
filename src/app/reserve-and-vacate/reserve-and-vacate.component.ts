import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReserveSlotsComponent } from '../reserve-slots/reserve-slots.component';
import { VacantSlotsComponent } from '../vacant-slots/vacant-slots.component';
import { ParkingService } from '../services/parking.service';
import { DatetimePipe } from '../pipes/datetime.pipe';

interface ParkingSlot {
  id: number;
  status: 'occupied' | 'reserved' | 'empty';
  carNumber?: string;
  employeeName?: string;
  isReserved: boolean;
  arrivalDateTime?: string;
  reservationEndDateTime?: string;
  isBlinking?: boolean;
}

@Component({
  selector: 'app-reserve-and-vacate',
  standalone: true,
  imports: [CommonModule, ReserveSlotsComponent, VacantSlotsComponent, DatetimePipe],
  templateUrl: './reserve-and-vacate.component.html',
  styleUrls: ['./reserve-and-vacate.component.scss']
})

export class ReserveAndVacateComponent implements OnInit, AfterViewInit {
  
  @ViewChild(ReserveSlotsComponent) reserveComponent!: ReserveSlotsComponent;
  @ViewChild(VacantSlotsComponent) vacantComponent!: VacantSlotsComponent;
  
  occupiedAndReservedSlots: ParkingSlot[] = [];
  
  constructor(private parkingService: ParkingService) {}

  ngOnInit(): void {
    this.loadOccupiedAndReservedSlots();
    
    // Set up periodic refresh to keep data in sync
    setInterval(() => {
      this.refreshAllData();
    }, 5000); // Refresh every 5 seconds
  }

  ngAfterViewInit(): void {
    // Ensure child components are loaded
    setTimeout(() => {
      this.refreshChildComponents();
    }, 100);
  }

  private loadOccupiedAndReservedSlots(): void {
    const storedData = this.parkingService.getFromLocalStorage();
    
    if (storedData) {
      this.occupiedAndReservedSlots = storedData
        .filter(slot => slot.status === 'occupied' || slot.status === 'reserved')
        .sort((a, b) => a.id - b.id);
    } else {
      this.occupiedAndReservedSlots = [];
    }
  }

  // Method called by the refresh button in template
  refreshData(): void {
    this.loadOccupiedAndReservedSlots();
    this.refreshChildComponents();
  }

  // Method for periodic refresh
  private refreshAllData(): void {
    this.loadOccupiedAndReservedSlots();
    this.refreshChildComponents();
  }

  // Method to refresh child components
  private refreshChildComponents(): void {
    // if (this.reserveComponent && typeof this.reserveComponent.refreshData === 'function') {
    //   this.reserveComponent.refreshData();
    // }
    // if (this.vacantComponent && typeof this.vacantComponent.refreshData === 'function') {
    //   this.vacantComponent.refreshData();
    // }
  }

  // Getter for total occupied slots count
  get totalOccupiedSlots(): number {
    return this.occupiedAndReservedSlots.filter(slot => slot.status === 'occupied').length;
  }

  // Getter for total reserved slots count
  get totalReservedSlots(): number {
    return this.occupiedAndReservedSlots.filter(slot => slot.status === 'reserved').length;
  }

}