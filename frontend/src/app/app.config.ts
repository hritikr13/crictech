
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection
} from '@angular/core';

import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // Global error listeners
    provideBrowserGlobalErrorListeners(),

    // Angular change detection configuration
    provideZoneChangeDetection({
      eventCoalescing: true
    }),

    // HTTP client for Spring Boot REST APIs
    provideHttpClient(withFetch()),

    // Application routing
    provideRouter(routes)
  ]
};
