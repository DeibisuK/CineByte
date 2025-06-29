import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgClass, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';

@Component({
  selector: 'app-alert-confirm',
  standalone: true,
  imports: [NgClass, NgSwitch, NgSwitchCase, NgSwitchDefault],
  template: `
    <div class="alert-backdrop">
      <div class="alert-box" [ngClass]="{ 'dark': theme === 'dark' }">
        <div class="icon-container">
          <ng-container [ngSwitch]="type">
            <svg *ngSwitchCase="'success'" class="icon success" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="#43a047"/>
              <path d="M7 13l3 3 7-7" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg *ngSwitchCase="'error'" class="icon error" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="#e53935"/>
              <path d="M8 8l8 8M16 8l-8 8" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/>
            </svg>
            <svg *ngSwitchCase="'warning'" class="icon warning" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="#f7cb5a"/>
              <path d="M12 7v5M12 16h.01" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/>
            </svg>
            <svg *ngSwitchDefault class="icon info" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="#1976d2"/>
              <path d="M12 8h.01M12 12v4" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/>
            </svg>
          </ng-container>
        </div>
        <p>{{ message }}</p>
        <div class="alert-actions">
          <button class="btn-confirm" (click)="confirm.emit()">Confirmar</button>
          <button class="btn-cancel" (click)="close.emit()">Cancelar</button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./alert-confirm.component.css']
})


export class AlertConfirmComponent {
  
  @Input() message = '';
  @Input() theme: 'light' | 'dark' = 'light';
  @Input() type: 'success' | 'error' | 'warning' | 'info' = 'warning';
  @Output() confirm = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();
}
