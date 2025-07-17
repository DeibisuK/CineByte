import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PromocionesShowcaseComponent } from '../home/components/promociones-showcase/promociones-showcase.component';

@Component({
  selector: 'app-promociones-page',
  standalone: true,
  imports: [CommonModule, RouterModule, PromocionesShowcaseComponent],
  template: `
    <div class="promociones-page">
      <div class="hero-section">
        <div class="hero-content">
          <h1 class="page-title">
            <i class="fas fa-fire"></i>
            Promociones Especiales
          </h1>
          <p class="page-subtitle">
            ¡Descubre todas nuestras ofertas y ahorra en tus entradas favoritas!
          </p>
        </div>
      </div>
      
      <div class="container">
        <!-- Showcase de promociones -->
        <app-promociones-showcase></app-promociones-showcase>
        
        <!-- Sección de cupones -->
        <div class="cupones-section">
          <h2 class="section-title">¿Tienes un cupón?</h2>
          <p class="section-desc">
            Puedes aplicar tu código de cupón durante el proceso de compra para obtener descuentos exclusivos.
          </p>
          <button class="btn-comprar" routerLink="/peliculas">
            <i class="fas fa-ticket-alt"></i>
            Ver Películas Disponibles
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .promociones-page {
      min-height: 100vh;
      background: var(--background-color);
    }
    
    .hero-section {
      background: linear-gradient(135deg, rgba(20, 20, 20, 0.95) 0%, rgba(30, 30, 30, 0.98) 100%);
      padding: 4rem 0 2rem;
      text-align: center;
      border-bottom: 1px solid var(--dropdown-border);
    }
    
    .page-title {
      font-size: 3rem;
      font-weight: 700;
      color: var(--yellow);
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
    }
    
    .page-title i {
      color: #ff6b35;
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
    
    .page-subtitle {
      font-size: 1.2rem;
      color: var(--footer-link);
      max-width: 600px;
      margin: 0 auto;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }
    
    .cupones-section {
      background: var(--card-background);
      border-radius: 16px;
      padding: 3rem;
      text-align: center;
      margin: 3rem 0;
      border: 1px solid var(--dropdown-border);
    }
    
    .section-title {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-color);
      margin-bottom: 1rem;
    }
    
    .section-desc {
      font-size: 1.1rem;
      color: var(--footer-link);
      margin-bottom: 2rem;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
    }
    
    .btn-comprar {
      background: linear-gradient(135deg, var(--yellow), #ff8c00);
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 25px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1rem;
      text-decoration: none;
    }
    
    .btn-comprar:hover {
      background: linear-gradient(135deg, #ffd700, #ff7700);
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(247, 203, 90, 0.4);
    }
    
    @media (max-width: 768px) {
      .page-title {
        font-size: 2rem;
      }
      
      .cupones-section {
        padding: 2rem 1rem;
      }
    }
  `]
})
export class PromocionesPageComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
}
