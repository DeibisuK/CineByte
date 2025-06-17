import { NgStyle } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-edades',
  imports: [NgStyle],
  templateUrl: './edades.component.html',
  styleUrl: './edades.component.css'
})
export class EdadesComponent {
  @Input() edad: number = 0;

  get label(): string {
    if (this.edad >= 18) return '+18';
    if (this.edad >= 16) return '+16';
    if (this.edad >= 13) return '+13';
    if (this.edad >= 7) return '+7';
    return 'ATP';
  }

  get color(): string {
    if (this.edad >= 18) return '#F44336';
    if (this.edad >= 16) return '#FF7043';
    if (this.edad >= 13) return '#FFC107';
    if (this.edad >= 7) return '#42A5F5';
    return '#4CAF50';
  }
}
