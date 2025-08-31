import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParkingService } from '../services/parking.service';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
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

interface ParkingData {
  slots: ParkingSlot[];
  notifications: any[];
}


@Component({
  selector: 'app-parking-dashboard',
  standalone: true,
  imports: [CommonModule, DatetimePipe],
  templateUrl: './parking-dashboard.component.html',
  styleUrls: ['./parking-dashboard.component.scss']
})
export class ParkingDashboardComponent implements OnInit {

  // slots: any[] = [];
  slots: ParkingSlot[] = [];
  loading = true;
  totalSlots = 20;

  constructor(private parkingService: ParkingService, private http: HttpClient) {}

  ngOnInit(): void {
    // this.getParkingStatus();
     this.initializeParkingData();
  }


  // private initializeParkingData(): void {
  //   // Check if data exists in localStorage
  //   const storedData = localStorage.getItem('parkingData');
    
  //   if (storedData) {
  //     this.slots = JSON.parse(storedData);
  //     this.loading = false;
  //   } else {
  //     // Fetch from db.json and store in localStorage
  //     this.fetchParkingData().subscribe({
  //       next: (data: ParkingData) => {
  //         this.slots = this.ensureAllSlots(data.slots);
  //         localStorage.setItem('parkingData', JSON.stringify(this.slots));
  //         this.loading = false;
  //       },
  //       error: (err) => {
  //         console.error('Failed to fetch parking data', err);
  //         this.initializeEmptySlots();
  //         this.loading = false;
  //       }
  //     });
  //   }
  // }

  
  // getParkingStatus(): void {
  //   this.parkingService.getStatus().subscribe({
  //     next: data => {
  //       this.slots = data;
  //       this.loading = false;
  //     },
  //     error: err => {
  //       console.error('Failed to fetch parking status', err);
  //       this.loading = false;
  //     }
  //   });
  // }


  // vacateSlot(id: number): void {
  //   this.parkingService.postVacate(id).subscribe({
  //     next: () => {
  //       console.log(`Slot ${id} vacated successfully.`);
  //       this.getParkingStatus(); // Refresh the dashboard
  //     },
  //     error: err => {
  //       console.error('Failed to vacate slot', err);
  //     }
  //   });
  // }


private initializeParkingData(): void {
    // Check if data exists in localStorage
    const storedData = this.parkingService.getFromLocalStorage();
    
    if (storedData && storedData.length > 0) {
      console.log('Loading data from localStorage:', storedData);
      this.slots = storedData;
      this.loading = false;
    } else {
      // Fetch from db.json and store in localStorage
      console.log('Fetching data from db.json...');
      
      // First try to fetch from assets/db.json
      this.parkingService.getStatus().subscribe({
        next: (slotsData: ParkingSlot[]) => {
          console.log('Data fetched from db.json:', slotsData);
          this.slots = this.ensureAllSlots(slotsData);
          this.parkingService.saveToLocalStorage(this.slots);
          console.log('Data saved to localStorage');
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to fetch parking data from db.json:', err);
          console.log('Trying alternative path...');
          
          // Try alternative path or initialize with your provided data
          this.initializeWithProvidedData();
        }
      });
    }
  }

  private initializeWithProvidedData(): void {
    // Initialize with the data from your db.json content
    const initialSlots: ParkingSlot[] = [
      {
        id: 101,
        status: "occupied",
        carNumber: "KA-01-A-1001",
        employeeName: "John Doe",
        isReserved: false,
        arrivalDateTime: "2024-08-29T09:00:00.000Z",
        reservationEndDateTime: "2024-08-29T14:00:00.000Z"
      },
      {
        id: 102,
        status: "occupied",
        carNumber: "MH-02-B-1002",
        employeeName: "Jane Smith",
        isReserved: false,
        arrivalDateTime: "2024-08-29T09:00:00.000Z",
        reservationEndDateTime: "2024-08-29T14:00:00.000Z"
      },
      {
        id: 103,
        status: "occupied",
        carNumber: "UP-03-C-1003",
        employeeName: "Peter Jones",
        isReserved: false,
        arrivalDateTime: "2024-08-29T08:55:00.000Z",
        reservationEndDateTime: "2024-08-29T13:55:00.000Z"
      },
      {
        id: 104,
        status: "occupied",
        carNumber: "DL-04-D-1004",
        employeeName: "Mary Brown",
        isReserved: false,
        arrivalDateTime: "2024-08-29T08:50:00.000Z",
        reservationEndDateTime: "2024-08-29T13:50:00.000Z"
      },
      {
        id: 105,
        status: "occupied",
        carNumber: "TN-05-E-1005",
        employeeName: "David Miller",
        isReserved: false,
        arrivalDateTime: "2024-08-29T08:45:00.000Z",
        reservationEndDateTime: "2024-08-29T13:45:00.000Z"
      },
      {
        id: 106,
        status: "occupied",
        carNumber: "GJ-06-F-1006",
        employeeName: "Sam Wilson",
        isReserved: true,
        arrivalDateTime: "2024-08-29T08:40:00.000Z",
        reservationEndDateTime: "2024-08-29T13:40:00.000Z",
        isBlinking: true
      },
      {
        id: 107,
        status: "reserved",
        carNumber: "GJ-06-EA-1007",
        employeeName: "Sam Wilson",
        isReserved: true,
        arrivalDateTime: "2024-08-29T07:40:00.000Z",
        reservationEndDateTime: "2024-08-29T14:30:00.000Z"
      }
    ];

    this.slots = this.ensureAllSlots(initialSlots);
    this.parkingService.saveToLocalStorage(this.slots);
    console.log('Initialized with provided data and saved to localStorage');
    this.loading = false;
  }

  private fetchParkingData(): Observable<ParkingData> {
    // Fetch actual data from db.json file
    return this.http.get<ParkingData>('db.json');
  }

  private ensureAllSlots(existingSlots: ParkingSlot[]): ParkingSlot[] {
    const slots: ParkingSlot[] = [];
    
    for (let i = 101; i <= 120; i++) {
      const existingSlot = existingSlots.find(slot => slot.id === i);
      if (existingSlot) {
        slots.push(existingSlot);
      } else {
        slots.push({
          id: i,
          status: 'empty',
          isReserved: false,
          isBlinking: false
        });
      }
    }
    
    return slots;
  }

  private initializeEmptySlots(): void {
    this.slots = [];
    for (let i = 101; i <= 120; i++) {
      this.slots.push({
        id: i,
        status: 'empty',
        isReserved: false,
        isBlinking: false
      });
    }
    localStorage.setItem('parkingData', JSON.stringify(this.slots));
  }

  // Getters for dashboard cards
  get totalVehicles(): number {
    return this.slots.filter(slot => slot.status === 'occupied').length;
  }

  get totalOccupiedSlots(): number {
    return this.slots.filter(slot => slot.status === 'occupied').length;
  }

  get totalReservedSlots(): number {
    return this.slots.filter(slot => slot.status === 'reserved' || slot.isReserved).length;
  }

  get emptySlots(): number {
    return this.slots.filter(slot => slot.status === 'empty' && !slot.isReserved).length;
  }

  // Utility methods
  getSlotClass(slot: ParkingSlot): string {
    if (slot.status === 'occupied') {
      return 'slot-occupied';
    } else if (slot.status === 'reserved') {
      return 'slot-reserved';
    } else {
      return 'slot-empty';
    }
  }

  vacateSlot(slotId: number): void {
    this.parkingService.postVacate(slotId).subscribe({
      next: () => {
        // Update the slot in local array
        const slotIndex = this.slots.findIndex(slot => slot.id === slotId);
        if (slotIndex !== -1) {
          this.slots[slotIndex] = {
            id: slotId,
            status: 'empty',
            isReserved: false,
            isBlinking: false
          };
          
          // Update localStorage
          this.parkingService.saveToLocalStorage(this.slots);
          console.log(`Slot ${slotId} vacated successfully.`);
        }
      },
      error: (err) => {
        console.error('Failed to vacate slot', err);
      }
    });
  }

  refreshData(): void {
    this.loading = true;
    // Clear localStorage and fetch fresh data from db.json
    this.parkingService.clearLocalStorage();
    
    this.parkingService.getStatus().subscribe({
      next: (slotsData: ParkingSlot[]) => {
        this.slots = this.ensureAllSlots(slotsData);
        this.parkingService.saveToLocalStorage(this.slots);
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to refresh parking data', err);
        // Fallback to stored data
        const storedData = this.parkingService.getFromLocalStorage();
        if (storedData) {
          this.slots = storedData;
        }
        this.loading = false;
      }
    });
  }
}
