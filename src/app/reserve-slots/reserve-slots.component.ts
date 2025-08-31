import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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
  selector: 'app-reserve-slots',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DatetimePipe,
    NgIf
  ],
  templateUrl: './reserve-slots.component.html',
  styleUrls: ['./reserve-slots.component.scss']
})
export class ReserveSlotsComponent implements OnInit {

  reserveForm!: FormGroup;
  // reservedSpot: any;
  reservedSpot: ParkingSlot | null = null;
  departureTime?: string;
  slots: number[] = [101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120];
  availableSlots: number[] = [];

  constructor(private fb: FormBuilder, private parkingService: ParkingService) {}

  ngOnInit(): void {
    this.loadAvailableSlots();
    this.initializeForm();
  }


  // ngOnInit(): void {
  //   this.reserveForm = this.fb.group({
  //     employeeName: ['', Validators.required],
  //     vehicleNo: ['', [Validators.required, this.vehicleNoValidator]],
  //     arrivalTime: ['', Validators.required],
  //     departureTime: [{ value: '', disabled: true }],
  //     reservedSpot: ['', Validators.required]
  //   });

  //   // Subscribe to value changes to update departure time

  //   this.reserveForm.get('arrivalTime')?.valueChanges.subscribe(time => {
  //     if (time) {
  //       const arrivalDate = new Date();
  //       const [hours, minutes] = time.split(':');
  //       arrivalDate.setHours(Number(hours), Number(minutes), 0);

  //       const departureDate = new Date(arrivalDate);
  //       departureDate.setHours(departureDate.getHours() + 5);
  //       this.departureTime = departureDate;
  //     }
  //     else {
  //       this.departureTime = undefined;
  //     }
  //   });

  // }


  // vehicleNoValidator(control: any) {
  //   const pattern = /^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/;
  //   // Example for Indian car: MH12AB1234
    
  //   if (control.value && !pattern.test(control.value)) {
  //     return { invalidVehicleNo: true };
  //   }
  //   return null;
  // }


  // onSubmit() {
  //   if (this.reserveForm?.valid) {

  //     // Logic to reserve the slot
  //     this.parkingService.postReserve(this.reserveForm.value).subscribe({
  //       next: (response) => {
  //         this.reservedSpot = response;
  //         console.log('Reservation successful:', response);
  //         alert("Reservation successful");
  //         this.reserveForm?.reset();
  //       },
  //       error: (err) => {
  //         console.error('Reservation failed:', err);
  //         alert("Reservation failed");
  //       }
  //     });

  //     console.log('Form submitted:', this.reserveForm?.value);
  //     alert("Form submitted");
  //   }
  // }


  private loadAvailableSlots(): void {
    // Get data from localStorage
    const storedData = this.parkingService.getFromLocalStorage();
    
    if (storedData) {
      // Filter only empty slots that are not reserved
      this.availableSlots = storedData
        .filter(slot => slot.status === 'empty' && !slot.isReserved)
        .map(slot => slot.id)
        .sort((a, b) => a - b);
    } else {
      console.warn('No parking data found in localStorage');
    }
  }

  private initializeForm(): void {
    this.reserveForm = this.fb.group({
      employeeName: ['', Validators.required],
      vehicleNo: ['', [Validators.required, this.vehicleNoValidator]],
      arrivalTime: ['', Validators.required],
      reservedSpot: ['', Validators.required]
    });

    // Subscribe to arrival time changes to calculate departure time
    this.reserveForm.get('arrivalTime')?.valueChanges.subscribe(time => {
      if (time) {
        this.calculateDepartureTime(time);
      } else {
        this.departureTime = undefined;
      }
    });
  }

  private calculateDepartureTime(arrivalTime: string): void {
    const today = new Date();
    const [hours, minutes] = arrivalTime.split(':');
    
    const arrivalDate = new Date(today);
    arrivalDate.setHours(Number(hours), Number(minutes), 0, 0);
    
    // Add 5 hours for departure time
    const departureDate = new Date(arrivalDate);
    departureDate.setHours(departureDate.getHours() + 5);
    
    this.departureTime = departureDate.toISOString();
  }

  vehicleNoValidator(control: any) {
    const pattern = /^[A-Z]{2}-\d{2}-[A-Z]{1,2}-\d{4}$/;
    // Pattern for Indian car numbers: XX-00-XX-0000 or XX-00-X-0000
    
    if (control.value && !pattern.test(control.value)) {
      return { invalidVehicleNo: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.reserveForm.valid) {
      const formData = this.reserveForm.value;
      const selectedSlotId = Number(formData.reservedSpot);
      
      // Get current slots from localStorage
      const currentSlots = this.parkingService.getFromLocalStorage();
      
      if (currentSlots) {
        // Find the smallest available slot (already selected by user)
        const slotIndex = currentSlots.findIndex(slot => slot.id === selectedSlotId);
        
        if (slotIndex !== -1) {
          // Calculate arrival and departure date times
          const today = new Date();
          const [hours, minutes] = formData.arrivalTime.split(':');
          
          const arrivalDateTime = new Date(today);
          arrivalDateTime.setHours(Number(hours), Number(minutes), 0, 0);
          
          const departureDateTime = new Date(arrivalDateTime);
          departureDateTime.setHours(departureDateTime.getHours() + 5);
          
          // Update the slot
          currentSlots[slotIndex] = {
            id: selectedSlotId,
            status: 'reserved',
            carNumber: formData.vehicleNo,
            employeeName: formData.employeeName,
            isReserved: true,
            arrivalDateTime: arrivalDateTime.toISOString(),
            reservationEndDateTime: departureDateTime.toISOString(),
            isBlinking: false
          };
          
          // Save updated data to localStorage
          this.parkingService.saveToLocalStorage(currentSlots);
          
          // Set reserved spot for success message
          this.reservedSpot = currentSlots[slotIndex];
          
          // Refresh available slots
          this.loadAvailableSlots();
          
          // Reset form
          this.reserveForm.reset();
          this.departureTime = undefined;
          
          console.log('Reservation successful:', this.reservedSpot);
        }
      }
    }
  }

  // Refresh available slots (useful when called from parent component)
  refreshAvailableSlots(): void {
    this.loadAvailableSlots();
  }

}
