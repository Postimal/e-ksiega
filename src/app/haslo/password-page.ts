import { Component, computed, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth';
import { InteractionService } from '../services/interaction.service';
import { QUERY_PARAM_REDIRECT, UrlQueryParamService } from '../services/url-query-params.service';

@Component({
  selector: 'app-password-page',
  styleUrl: './password-page.scss',
  templateUrl: './password-page.html',
})
export class PasswordPage {
  protected readonly password = signal('');
  protected readonly errorMessage = signal('');

  private readonly redirectUrl: string;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private authService: AuthService,
    private urlQueryParamService: UrlQueryParamService,
    protected readonly interactionService: InteractionService,
  ) {
    this.redirectUrl = this.route.snapshot.queryParamMap.get(QUERY_PARAM_REDIRECT) || '/';
  }

  groupFromUrl = computed(() => this.urlQueryParamService.groupIdParam());

  protected async submitPassword(): Promise<void> {
    if (!this.password().length) {
      this.errorMessage.set('Pole jest wymagane. Wprowadź hasło');
      return;
    }

    this.errorMessage.set('');

    try {
      this.interactionService.start('Logowanie w trakcie');
      await this.authService.loginWithPassword(this.password(), this.groupFromUrl() ?? '');

      void this.router.navigate([this.redirectUrl]);
    } catch (error) {
      this.errorMessage.set('Nieprawidłowe hasło. Spróbuj ponownie.');
      console.error('Szczegóły błędu logowania:', error);
    } finally {
      this.interactionService.stop();
    }
  }
}
