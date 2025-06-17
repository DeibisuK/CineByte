import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',

})
export class HeaderComponent {
  toggleSidebar(){
    const layout = document.getElementById("sidebar");
    if (layout) {
      layout.classList.toggle("no-sidebar");
    }
  }
}
