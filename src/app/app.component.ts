import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Car_Parking';

  constructor(private router: Router) { }

  onDashboardClick() {
    this.router.navigate(['/dashboard']);
  }

  onReserveClick() {
    this.router.navigate(['/reserve']);
  }

  onNotificationsClick() {
    this.router.navigate(['/notifications']);
  }
}
