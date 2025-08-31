import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { ParkingService } from '../services/parking.service';
import { LoggingService } from '../services/logging.service';
import { DatetimePipe } from '../pipes/datetime.pipe';
import { NotificationsDataService } from '../services/notifications-data.service';


interface NotificationLog {
  id: string;
  timestamp: string;
  slotId: number;
  message: string;
  type: 'parking' | 'reservation' | 'violation' | 'expired';
  employeeName?: string;
  carNumber?: string;
  date: Date;
  time: Date;
  exceededTime: string;
  severity: 'low' | 'medium' | 'high';
}

interface NavigationEvent {
  id: string;
  timestamp: string;
  eventType: string;
  slotId: number;
  details: any;
}


@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    DatetimePipe,
    TitleCasePipe
  ],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['date', 'time', 'slotId', 'message', 'exceededTime'];
  // dataSource = new MatTableDataSource<any>();
  dataSource = new MatTableDataSource<NotificationLog>();

  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;

  totalNotifications = 0;
  violationCount = 0;
  expiredReservations = 0;

  constructor(
    private parkingService: ParkingService,
    private loggingService: LoggingService,
    private notificationsDataService: NotificationsDataService
  ) { }

  ngOnInit(): void {
    // this.loadLogs();
    this.loadNotifications();
  

  setInterval(() => {
      this.loadNotifications();
    }, 30000); // Refresh every 30 seconds
  }

  ngAfterViewInit(): void {

    // Check if paginator is available before assigning it
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  loadNotifications(): void {
    const rawData = this.notificationsDataService.getNotifications();
    const allNotifications = this.processNotifications(rawData);

    this.dataSource.data = allNotifications;
    this.updateStatistics(allNotifications);
  }

  private processNotifications(rawData: any[]): NotificationLog[] {
    return rawData.map((item, index) => {
      const timestamp = item.timestamp || new Date().toISOString();
      const date = new Date(timestamp);

      
      
      return {
        id: item.id || `notification_${index}`,
        timestamp: timestamp,
        slotId: item.slotId || item.slot_id || 0,
        message: this.formatMessage(item),
        type: this.determineNotificationType(item),
        employeeName: item.employeeName || item.employee_name || 'N/A',
        carNumber: item.carNumber || item.car_number || 'N/A',
        date: date,
        time: date,
        exceededTime: this.calculateExceededTime(item),
        severity: this.determineSeverity(item)
      };
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  private formatMessage(item: any): string {
    if (item.message) {
      return item.message;
    }
    
    // Generate message based on event type
    switch (item.eventType || item.type) {
      case 'parking':
        return `Vehicle ${item.carNumber || 'Unknown'} parked in slot`;
      case 'reservation':
        return `Slot reserved by ${item.employeeName || 'Unknown'}`;
      case 'violation':
        return `Parking violation detected in slot`;
      case 'expired':
        return `Reservation expired for slot`;
      default:
        return item.details || 'Parking event occurred';
    }
  }

  private determineNotificationType(item: any): 'parking' | 'reservation' | 'violation' | 'expired' {
    if (item.type) return item.type;
    if (item.eventType) return item.eventType;
    if (item.message?.includes('expired')) return 'expired';
    if (item.message?.includes('violation')) return 'violation';
    if (item.message?.includes('reserved')) return 'reservation';
    return 'parking';
  }

  private calculateExceededTime(item: any): string {
    if (item.exceededTime) return item.exceededTime;
    
    const type = this.determineNotificationType(item);
    if (type === 'expired' || type === 'violation') {
      const eventTime = new Date(item.timestamp);
      const currentTime = new Date();
      const timeDifference = currentTime.getTime() - eventTime.getTime();
      const minutesExceeded = Math.floor(timeDifference / (1000 * 60));
      
      if (minutesExceeded > 0) {
        const hours = Math.floor(minutesExceeded / 60);
        const minutes = minutesExceeded % 60;
        
        if (hours > 0) {
          return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
      }
    }
    return '';
  }

  private determineSeverity(item: any): 'low' | 'medium' | 'high' {
    const type = this.determineNotificationType(item);
    const exceededTime = this.calculateExceededTime(item);
    
    switch (type) {
      case 'violation':
        return 'high';
      case 'expired':
        if (exceededTime && this.parseExceededMinutes(exceededTime) > 60) {
          return 'high';
        } else if (exceededTime && this.parseExceededMinutes(exceededTime) > 30) {
          return 'medium';
        }
        return 'medium';
      case 'reservation':
        return 'low';
      case 'parking':
      default:
        return 'low';
    }
  }

  private parseExceededMinutes(exceededTime: string): number {
    const matches = exceededTime.match(/(\d+)h?\s*(\d+)?m?/);
    if (matches) {
      const hours = parseInt(matches[1]) || 0;
      const minutes = parseInt(matches[2]) || 0;
      return hours * 60 + minutes;
    }
    return 0;
  }

  private updateStatistics(notifications: NotificationLog[]): void {
    this.totalNotifications = notifications.length;
    this.violationCount = notifications.filter(n => n.type === 'violation').length;
    this.expiredReservations = notifications.filter(n => n.type === 'expired').length;
  }

  private loadNavigationEvents(): NavigationEvent[] {
    const events = localStorage.getItem('navigationEvents');
    return events ? JSON.parse(events) : [];
  }

  addNavigationEvent(eventType: string, slotId: number, details: any): void {
    const newEvent: NavigationEvent = {
      id: `nav_${Date.now()}`,
      timestamp: new Date().toISOString(),
      eventType: eventType,
      slotId: slotId,
      details: details
    };

    const existingEvents = this.loadNavigationEvents();
    existingEvents.push(newEvent);
    localStorage.setItem('navigationEvents', JSON.stringify(existingEvents));

    this.loggingService.logEvent(eventType, slotId, details);
    this.loadNotifications();
  }

  // Method to add new navigation event
  // addNavigationEvent(eventType: string, slotId: number, details: any): void {
  //   const newEvent: NavigationEvent = {
  //     id: `nav_${Date.now()}`,
  //     timestamp: new Date().toISOString(),
  //     eventType: eventType,
  //     slotId: slotId,
  //     details: details
  //   };

  //   // Add to localStorage
  //   const existingEvents = this.loadNavigationEvents();
  //   existingEvents.push(newEvent);
  //   localStorage.setItem('navigationEvents', JSON.stringify(existingEvents));

  //   // Also log using LoggingService
  //   this.loggingService.logEvent(eventType, slotId, details);

  //   // Refresh the table
  //   this.loadNotifications();
  // }

  // Method to clear old notifications
  clearOldNotifications(): void {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const recentLogs = this.loggingService.getLogs().filter(log => 
      new Date(log.timestamp) > oneDayAgo
    );
    
    // Update localStorage with filtered logs
    localStorage.setItem('parkingLogs', JSON.stringify(recentLogs));
    
    // Reload notifications
    this.loadNotifications();
  }

  // Method to refresh data manually
  refreshData(): void {
    this.loadNotifications();
  }

  // Method to get severity color class
  getSeverityClass(severity: string): string {
    switch (severity) {
      case 'high': return 'severity-high';
      case 'medium': return 'severity-medium';
      case 'low': return 'severity-low';
      default: return 'severity-low';
    }
  }

  // Method to get type icon
  getTypeIcon(type: string): string {
    switch (type) {
      case 'parking': return 'local_parking';
      case 'reservation': return 'event_available';
      case 'violation': return 'warning';
      case 'expired': return 'schedule';
      default: return 'info';
    }
  }

  // ---------------------------------------------------------
  // loadLogs(): void {
  //   const logs = this.loggingService.getLogs();
  //   this.dataSource.data = logs.map(log => ({
  //     ...log,
  //     date: new Date(log.timestamp),
  //     time: new Date(log.timestamp),
  //     exceededTime: this.checkExceededTime(log)
  //   }));
  //   // this.dataSource.paginator = this.paginator;
  // }

  // checkExceededTime(log: any): string {

  //   // This logic would need more detailed information from the API
  //   // For now, it's a placeholder based on the `db.json` data.

  //   if (log.message.includes('reservation has expired')) {
  //     const expirationTime = new Date(log.timestamp);
  //     const currentTime = new Date();
  //     const timeDifference = currentTime.getTime() - expirationTime.getTime();
  //     const minutesExceeded = Math.floor(timeDifference / (1000 * 60));
  //     return `${minutesExceeded} minutes`;
  //   }
  //   return '';
  // }
}
