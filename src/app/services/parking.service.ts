import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { LoggingService } from './logging.service';

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



@Injectable({
  providedIn: 'root'
})

export class ParkingService {
  // private apiUrl = 'http://localhost:3000';


  private apiUrl = '../../assets/db.json';
  // Path to your db.json file in root directory
  private storageKey = 'parkingData';

  constructor(private http: HttpClient, private loggingService: LoggingService) { }

  // Methods to be implemented once db.json is available
  // postEnter(carDetails: any): Observable<any> {}
  // postVacate(id: number): Observable<any> {}
  // postReserve(reservationDetails: any): Observable<any> {}
  // getStatus(): Observable<any> {}

  // API 1: GET /api/parking/status
  // getStatus(): Observable<any[]> {
  //   return this.http.get<any[]>(`${this.apiUrl}/api/parking/status`);
  // }

  // // API 2: POST /api/parking/enter
  // postEnter(carDetails: any): Observable<any> {
  //   return this.getStatus().pipe(
  //     map(slots => slots.find(slot => slot.status === 'empty')),
  //     switchMap(emptySlot => {
  //       if (emptySlot) {

  //         const newSlotData = {
  //           ...emptySlot,
  //           status: 'occupied',
  //           carNumber: carDetails.vehicleNo,
  //           employeeName: carDetails.employeeName,
  //           isReserved: false,
  //           arrivalDateTime: new Date().toISOString,
  //           reserationEndDateTime: null
  //         };

  //         this.loggingService.addLog({
  //           timestamp: new Date(),
  //           slotId: emptySlot.id,
  //           message: `new Car with number ${carDetails.vehicleNo} has entered slot ${emptySlot.id}.`
  //         });
  //         return this.http.put(`${this.apiUrl}/slots/${emptySlot.id}`, newSlotData);
  //       }
  //       else {

  //         return new Observable(observer => {
  //           observer.error("No empty slots available")
  //           this.loggingService.addLog({
  //             timestamp: new Date(),
  //             message: `Could not enter Car with number ${carDetails.vehicleNo}. As no empty slota are available`
  //           });
  //         });
  //       }
  //     })
  //   );
  // }


  // // API 3: POST /api/parking/vacate/:id
  // postVacate(id: number): Observable<any> {
  //   return this.http.get(`${this.apiUrl}/slots/${id}`).pipe(
  //     switchMap((slot: any) => {
  //       if (slot.status === 'occupied' || slot.status === 'reserved') {
  //         const vacatedSlotData = {
  //           id: slot.id,
  //           status: 'empty'
  //         };
  //         this.loggingService.addLog({
  //           timestamp: new Date(),
  //           slotId: id,
  //           message: `Slot ${id} has been vacated.`
  //         });
  //         return this.http.put(`${this.apiUrl}/slots/${id}`, vacatedSlotData);
  //       }
  //       else {
  //         return new Observable(observer => observer.error('Cannot vacate an empty slot.'));
  //       }
  //     })
  //   );
  // }

  // // API 4: POST /api/parking/reserve
  postReserve(reservationDetails: any): Observable<any> {
    return this.getStatus().pipe(
      map(slots => {
        const emptySlots = slots.filter(slot => slot.status === 'empty');

        if (emptySlots.length > 0) {
          return emptySlots[0];
          // Take the first available empty slot for reservation
        }
        
        return null;
      }),
      switchMap(emptySlot => {
        if (emptySlot) {
          const newSlotData = {
            ...emptySlot,
            status: 'reserved',
            carNumber: reservationDetails.vehicleNo,
            employeeName: reservationDetails.employeeName,
            isReserved: true,
            arrivalDateTime: new Date(reservationDetails.arrivalTime).toISOString(),
            reservationEndDateTime: new Date(new Date(reservationDetails.arrivalTime).getTime() + 5 * 60 * 60 * 1000).toISOString()
          };
          this.loggingService.addLog({
            timestamp: new Date(),
            slotId: emptySlot.id,
            message: `Slot ${emptySlot.id} has been reserved for ${reservationDetails.employeeName}.`
          });

          return this.http.put(`${this.apiUrl}/slots/${emptySlot.id}`, newSlotData);

        }
        else {
          return new Observable(observer => {
            observer.error('No empty slots available for reservation.');
            this.loggingService.addLog({
              timestamp: new Date(),
              message: `Could not reserve a slot for ${reservationDetails.employeeName}. No empty slots available.`
            });
          });
        }
      })
    );
  }

  // getNotifications(): Observable<any[]> {
  //   return this.http.get<any[]>(`${this.apiUrl}/notifications`);
  // }


  getStatus(): Observable<ParkingSlot[]> {
    return this.http.get<ParkingData>(this.apiUrl).pipe(
      map(data => data.slots)
    );
  }

  // Get full parking data including notifications
  getParkingData(): Observable<ParkingData> {
    return this.http.get<ParkingData>(this.apiUrl);
  }

  // Simulate vacating a slot (in real app, this would call backend API)
  postVacate(slotId: number): Observable<any> {
    // Since we're using localStorage, we'll handle this in the component
    // In a real app, this would make an HTTP POST/PUT request to update the backend
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({ success: true, message: `Slot ${slotId} vacated` });
        observer.complete();
      }, 500);
    });
  }

  // Save data to localStorage
  saveToLocalStorage(slots: ParkingSlot[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(slots));
  }

  // Get data from localStorage
  getFromLocalStorage(): ParkingSlot[] | null {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : null;
  }

  // Clear localStorage data
  clearLocalStorage(): void {
    localStorage.removeItem(this.storageKey);
  }

}
