import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationsDataService {

  // This is the data that would be in your db.json file
  private initialNotifications = [
    {
      "id": "1",
      "timestamp": "2025-08-25T09:00:00Z",
      "slot_id": 101,
      "message": "Vehicle MH 12 AB 1234 parked in slot 101",
      "type": "parking",
      "employee_name": "John Doe",
      "car_number": "MH 12 AB 1234"
    },
    {
      "id": "2",
      "timestamp": "2025-08-25T09:05:00Z",
      "slot_id": 102,
      "message": "Slot 102 reserved by Jane Smith",
      "type": "reservation",
      "employee_name": "Jane Smith"
    },
    {
      "id": "3",
      "timestamp": "2025-08-26T09:15:00Z",
      "slot_id": 103,
      "message": "Parking violation detected in slot 103",
      "type": "violation"
    },
    {
      "id": "4",
      "timestamp": "2025-08-26T10:00:00Z",
      "slot_id": 102,
      "message": "Reservation has expired for slot 102",
      "type": "expired"
    },
    {
      "id": "5",
      "timestamp": "2025-08-16T11:30:00Z",
      "slot_id": 105,
      "message": "Vehicle DL 9C 9876 parked in slot 105",
      "type": "parking",
      "employee_name": "Peter Jones",
      "car_number": "DL 9C 9876"
    },
    {
      "id": "6",
      "timestamp": "2025-08-16T12:45:00Z",
      "slot_id": 101,
      "message": "Vehicle MH 12 AB 1234 vacated from slot 101",
      "type": "vacated",
      "employee_name": "John Doe",
      "car_number": "MH 12 AB 1234"
    }
  ];

  constructor() {

        // Initialize local storage on first load if it's empty
    if (!localStorage.getItem('notificationsData')) {
      localStorage.setItem('notificationsData', JSON.stringify(this.initialNotifications));
    }
  }

  // Gets all notifications from local storage
  getNotifications(): any[] {
    const data = localStorage.getItem('notificationsData');
    return data ? JSON.parse(data) : [];
  }

  // Adds a new notification to local storage
  addNotification(notification: any): void {
    const notifications = this.getNotifications();
    notifications.unshift(notification); // Add to the beginning to show new notifications first
    localStorage.setItem('notificationsData', JSON.stringify(notifications));

  }
}
