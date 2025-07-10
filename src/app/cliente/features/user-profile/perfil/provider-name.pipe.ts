import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'providerName' })
export class ProviderNamePipe implements PipeTransform {
  transform(providerId: string): string {
    switch(providerId) {
      case 'google.com': return 'Google';
      case 'facebook.com': return 'Facebook';
      case 'password': return 'Email/Contraseña';
      default: return providerId;
    }
  }
}