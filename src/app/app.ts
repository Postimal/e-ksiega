import { Component, computed, DOCUMENT, inject, Renderer2 } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { UrlQueryParamService } from './services/url-query-params.service';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  protected groupService = inject(UrlQueryParamService);
  private route = inject(ActivatedRoute);
  private renderer = inject(Renderer2);
  private document = inject(DOCUMENT);

  private currentThemeClass = '';

  constructor() {
    this.setBodyTheme(this.groupService.variantParam() ?? '');
  }

  private setBodyTheme(variant: string) {
    if (!variant) return;
    const body = this.document.body;

    if (this.currentThemeClass) {
      this.renderer.removeClass(body, this.currentThemeClass);
    }

    this.currentThemeClass = `theme-${variant}`;

    this.renderer.addClass(body, this.currentThemeClass);
  }
}
