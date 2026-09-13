import { Component, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { temporaryAccessPassword } from '../routing/access-password';

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
  ) {
    this.redirectUrl = this.route.snapshot.queryParamMap.get('redirect') || '/';
  }

  protected submitPassword(): void {
    if (this.password() !== temporaryAccessPassword) {
      this.errorMessage.set('Nieprawidłowe hasło. Spróbuj ponownie.');
      return;
    }

    sessionStorage.setItem('guestbook-access', 'granted');
    void this.router.navigateByUrl(this.redirectUrl);
  }
}
