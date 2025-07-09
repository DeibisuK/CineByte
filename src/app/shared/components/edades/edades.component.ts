import { NgStyle } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-edades',
  imports: [NgStyle],
  templateUrl: './edades.component.html',
  styleUrl: './edades.component.css'
})
export class EdadesComponent {
  @Input() edad: string = '';
//['G', 'PG', 'PG-13', 'R', 'NC-17']
  get label(): string {
    if (this.edad === 'NC-17') return '+18';
    if (this.edad === 'R') return '+16';
    if (this.edad === 'PG-13') return '+13';
    if (this.edad === 'PG') return '+7';
    return 'G';
  }

  get color(): string {
    if (this.edad === 'NC-17') return '#F44336';
    if (this.edad === 'R') return '#FF7043';
    if (this.edad === 'PG-13') return '#FFC107';
    if (this.edad === 'PG') return '#42A5F5';
    return '#4CAF50';
  }
}
