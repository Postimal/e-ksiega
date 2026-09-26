import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UrlQueryParamService } from './services/url-query-params.service';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  protected groupService = inject(UrlQueryParamService);
  groupFromUrl = computed(() => this.groupService.groupIdParam());
}
