import { Routes } from '@angular/router';
import { ParkingDashboardComponent } from './parking-dashboard/parking-dashboard.component';
import { ReserveSlotsComponent } from './reserve-slots/reserve-slots.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { ReserveAndVacateComponent } from './reserve-and-vacate/reserve-and-vacate.component';

export const routes: Routes = [

    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: ParkingDashboardComponent },
    // { path: 'reserve', component: ReserveSlotsComponent },
    { path: 'reserve', component: ReserveAndVacateComponent },
    { path: 'notifications', component: NotificationsComponent },
    { path: '**', redirectTo: '/dashboard' } // Unknown path

];
