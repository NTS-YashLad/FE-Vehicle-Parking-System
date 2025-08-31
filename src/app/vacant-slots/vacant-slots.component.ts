import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  selector: 'app-vacant-slots',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatetimePipe],
  templateUrl: './vacant-slots.component.html',
  styleUrls: ['./vacant-slots.component.scss']
})
export class VacantSlotsComponent implements OnInit {
  
  vacateForm!: FormGroup;
  occupiedSlots: ParkingSlot[] = [];
  selectedSlotDetails: ParkingSlot | null = null;
  successMessage: string = '';

  constructor(private fb: FormBuilder, private parkingService: ParkingService) {}

  ngOnInit(): void {
    this.loadOccupiedSlots();
    this.initializeForm();
  }

  private loadOccupiedSlots(): void {
    // Get data from localStorage
    const storedData = this.parkingService.getFromLocalStorage();
    
    if (storedData) {
      // Filter only occupied and reserved slots
      this.occupiedSlots = storedData
        .filter(slot => slot.status === 'occupied' || slot.status === 'reserved')
        .sort((a, b) => a.id - b.id);
    } else {
      this.occupiedSlots = [];
    }
  }

  private initializeForm(): void {
    this.vacateForm = this.fb.group({
      slotNumber: ['', Validators.required]
    });

    // Subscribe to slot number changes to show slot details
    this.vacateForm.get('slotNumber')?.valueChanges.subscribe(slotId => {
      if (slotId) {
        this.selectedSlotDetails = this.occupiedSlots.find(slot => slot.id === Number(slotId)) || null;
      } else {
        this.selectedSlotDetails = null;
      }
    });
  }

  onSubmit(): void {
    if (this.vacateForm.valid) {
      const slotId = Number(this.vacateForm.value.slotNumber);
      
      this.parkingService.postVacate(slotId).subscribe({
        next: () => {
          this.vacateSlot(slotId);
        },
        error: (err) => {
          console.error('Failed to vacate slot:', err);
        }
      });
    }
  }

  private vacateSlot(slotId: number): void {
    // Get current slots from localStorage
    const currentSlots = this.parkingService.getFromLocalStorage();
    
    if (currentSlots) {
      const slotIndex = currentSlots.findIndex(slot => slot.id === slotId);
      
      if (slotIndex !== -1) {
        // Update slot to empty
        currentSlots[slotIndex] = {
          id: slotId,
          status: 'empty',
          isReserved: false,
          isBlinking: false
        };
        
        // Save updated data to localStorage
        this.parkingService.saveToLocalStorage(currentSlots);
        
        // Show success message
        this.successMessage = `Slot ${slotId} has been successfully vacated.`;
        
        // Refresh occupied slots list
        this.loadOccupiedSlots();
        
        // Reset form and clear selected slot details
        this.vacateForm.reset();
        this.selectedSlotDetails = null;
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
        
        console.log(`Slot ${slotId} vacated successfully.`);
      }
    }
  }

  // Get all occupied slots count
  get totalOccupiedSlots(): number {
    return this.occupiedSlots.length;
  }

  // Check if all slots are empty
  get allSlotsEmpty(): boolean {
    return this.occupiedSlots.length === 0;
  }

  // Refresh occupied slots (useful when called from parent component)
  refreshOccupiedSlots(): void {
    this.loadOccupiedSlots();
  }
}