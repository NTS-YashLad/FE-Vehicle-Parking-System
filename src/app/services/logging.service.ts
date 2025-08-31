import { Injectable } from '@angular/core';

interface LogEntry {
  id: string;
  timestamp: string;
  slotId: number;
  message: string;
  type: 'parking' | 'reservation' | 'violation' | 'expired';
  employeeName?: string;
  carNumber?: string;
  details?: any;
}

interface NavigationEvent {
  id: string;
  timestamp: string;
  eventType: string;
  slotId: number;
  details: any;
}


@Injectable({
  providedIn: 'root'
})

export class LoggingService {
  private readonly LOGS_STORAGE_KEY = 'parkingLogs';
  private readonly NAVIGATION_STORAGE_KEY = 'navigationEvents';

  private logKey = 'parkingLogs';

  constructor() { }

  // getLogs(): any[] {
  //   const logs = localStorage.getItem(this.logKey);
  //   return logs ? JSON.parse(logs) : [];
  // }

  addLog(logEntry: any): void {
    const logs = this.getLogs();
    logs.push(logEntry);
    localStorage.setItem(this.logKey, JSON.stringify(logs));
  }

  // Log a new event
  logEvent(eventType: string, slotId: number, details: any): void {
    const logEntry: LogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      slotId: slotId,
      message: this.generateMessage(eventType, details),
      type: this.mapEventTypeToLogType(eventType),
      employeeName: details.employeeName || details.employee_name,
      carNumber: details.carNumber || details.car_number,
      details: details
    };

    // Add to local storage logs
    this.addLogToStorage(logEntry);
    
    // Also add to navigation events for db.json sync
    this.addNavigationEvent(eventType, slotId, details);
  }

  // Get all logs
  getLogs(): LogEntry[] {
    const logsJson = localStorage.getItem(this.LOGS_STORAGE_KEY);
    if (logsJson) {
      return JSON.parse(logsJson);
    }
    return [];
  }

  // Get navigation events (for db.json sync)
  getNavigationEvents(): NavigationEvent[] {
    const eventsJson = localStorage.getItem(this.NAVIGATION_STORAGE_KEY);
    if (eventsJson) {
      return JSON.parse(eventsJson);
    }
    return [];
  }

  // Add log to storage
  private addLogToStorage(logEntry: LogEntry): void {
    const existingLogs = this.getLogs();
    existingLogs.push(logEntry);
    
    // Keep only last 1000 logs to prevent storage overflow
    if (existingLogs.length > 1000) {
      existingLogs.splice(0, existingLogs.length - 1000);
    }
    
    localStorage.setItem(this.LOGS_STORAGE_KEY, JSON.stringify(existingLogs));
  }

  // Add navigation event
  private addNavigationEvent(eventType: string, slotId: number, details: any): void {
    const navigationEvent: NavigationEvent = {
      id: `nav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      eventType: eventType,
      slotId: slotId,
      details: details
    };

    const existingEvents = this.getNavigationEvents();
    existingEvents.push(navigationEvent);
    
    // Keep only last 500 navigation events
    if (existingEvents.length > 500) {
      existingEvents.splice(0, existingEvents.length - 500);
    }
    
    localStorage.setItem(this.NAVIGATION_STORAGE_KEY, JSON.stringify(existingEvents));
  }

  // Generate human-readable message
  private generateMessage(eventType: string, details: any): string {
    const employeeName = details.employeeName || details.employee_name || 'Unknown';
    const carNumber = details.carNumber || details.car_number || 'Unknown';

    switch (eventType) {
      case 'slot_occupied':
        return `Slot occupied by ${employeeName} (${carNumber})`;
      case 'slot_vacated':
        return `Slot vacated by ${employeeName} (${carNumber})`;
      case 'slot_reserved':
        return `Slot reserved by ${employeeName} for ${carNumber}`;
      case 'reservation_cancelled':
        return `Reservation cancelled by ${employeeName}`;
      case 'reservation_expired':
        return `Reservation expired for ${employeeName} (${carNumber})`;
      case 'parking_violation':
        return `Parking violation detected - unauthorized vehicle ${carNumber}`;
      case 'overtime_parking':
        return `Overtime parking detected for ${employeeName} (${carNumber})`;
      case 'reservation_extended':
        return `Reservation extended by ${employeeName}`;
      default:
        return details.message || `Parking event: ${eventType}`;
    }
  }

  // Map event types to log types
  private mapEventTypeToLogType(eventType: string): 'parking' | 'reservation' | 'violation' | 'expired' {
    switch (eventType) {
      case 'slot_occupied':
      case 'slot_vacated':
      case 'overtime_parking':
        return 'parking';
      case 'slot_reserved':
      case 'reservation_cancelled':
      case 'reservation_extended':
        return 'reservation';
      case 'parking_violation':
        return 'violation';
      case 'reservation_expired':
        return 'expired';
      default:
        return 'parking';
    }
  }

  // Log parking action (called from other components)
  logParkingAction(action: string, slotId: number, employeeName: string, carNumber: string): void {
    this.logEvent(action, slotId, {
      employeeName: employeeName,
      carNumber: carNumber,
      action: action
    });
  }
  
}
