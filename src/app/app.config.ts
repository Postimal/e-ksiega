import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { routes } from './routing/app.routes';
import { UrlQueryParamService } from './services/url-query-params.service';

export function initializeApp(configService: UrlQueryParamService) {
  return () => configService.init();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
      }),
      withComponentInputBinding(),
    ),
    provideAppInitializer(() => inject(UrlQueryParamService).init()),
  ],
};
