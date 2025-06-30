import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet,NavbarComponent],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css',
})
export class AdminLayoutComponent {
  sidebarClosed = false; // <-- Agrega esta propiedad
  toggleMobileSidebar(): void {
    this.sidebarClosed = !this.sidebarClosed;
  }
}
