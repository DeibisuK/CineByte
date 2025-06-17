import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAuth0 } from '@auth0/auth0-angular';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes),provideAuth0({
      domain: 'dev-ff0kkw3qtll5p0mb.us.auth0.com',
      clientId: 'JwKGPp7kCEPmisIefcjkqrf6Nu0fTwIz',
      authorizationParams: {
        redirect_uri: window.location.origin
      }
    })]
};
