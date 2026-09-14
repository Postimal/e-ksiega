import { Component, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth';

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
  ) {
    this.redirectUrl = this.route.snapshot.queryParamMap.get('redirect') || '/';
  }

  protected async submitPassword(): Promise<void> {
    if (!this.password().length) {
      this.errorMessage.set('Pole jest wymagane. Wprowadź hasło');
      return;
    }

    this.errorMessage.set('');

    try {
      await this.authService.loginWithPassword(this.password());

      sessionStorage.setItem('guestbook-access', 'granted');
      void this.router.navigateByUrl(this.redirectUrl);
    } catch (error) {
      this.errorMessage.set('Nieprawidłowe hasło. Spróbuj ponownie.');
      console.error('Szczegóły błędu logowania:', error);
    }
  }
}
