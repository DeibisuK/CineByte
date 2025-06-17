import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-scroll-top',
  imports: [CommonModule],
  templateUrl: './scroll-top.component.html',
  styleUrl: './scroll-top.component.css'
})
export class ScrollTopComponent {
 visible = false;
  private lastScrollPosition = 0;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const currentPosition = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;
    
    // Mostrar u ocultar el botón
    this.visible = currentPosition > (scrollHeight - clientHeight) * 0.3;
    
    // Guardar la última posición para detectar scroll manual
    this.lastScrollPosition = currentPosition;
  }

  scrollToTop() {
    const duration = 600; // Duración en milisegundos
    const start = window.pageYOffset;
    const startTime = performance.now();

    const animateScroll = (timestamp: number) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeInOutCubic = progress < 0.5 
        ? 4 * progress * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      window.scrollTo(0, start * (1 - easeInOutCubic));
      
      if (progress < 1) {
        window.requestAnimationFrame(animateScroll);
      }
    };

    window.requestAnimationFrame(animateScroll);
  }
}
