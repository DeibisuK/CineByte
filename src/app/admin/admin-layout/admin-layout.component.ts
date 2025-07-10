import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet} from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { LoadingComponent } from '../../core/components/loading/loading.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, NavbarComponent, LoadingComponent, CommonModule],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css',
})
export class AdminLayoutComponent implements OnInit {
  sidebarClosed = false;
  isLoading = true;
  loadingFadeOut = false;

  constructor(private router: Router) {}

  toggleMobileSidebar(): void {
    this.sidebarClosed = !this.sidebarClosed;
  }

ngOnInit(): void {
  // Mostrar la pantalla de carga durante 3 segundos
  setTimeout(() => {
    this.loadingFadeOut = true;
    setTimeout(() => {
      this.isLoading = false;
    }, 600); // Tiempo para aplicar el fade-out
  }, 1500); // 1,5 segundos de carga
}

  
}
