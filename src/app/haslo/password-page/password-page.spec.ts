import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { vi } from 'vitest';
import { AuthService } from '../../auth';
import { InteractionService } from '../../services/interaction.service';
import { UrlQueryParamService } from '../../services/url-query-params.service';
import { PasswordPage } from './password-page';

describe('PasswordPage', () => {
  const authService = {
    loginWithPassword: vi.fn<() => Promise<void>>(),
  };
  const router = {
    navigate: vi.fn<() => Promise<boolean>>(),
  };
  const interactionService = {
    isBusy: signal(false),
    message: signal(''),
    start: vi.fn(),
    stop: vi.fn(),
  };

  beforeEach(async () => {
    authService.loginWithPassword.mockReset().mockResolvedValue(undefined);
    router.navigate.mockReset().mockResolvedValue(true);
    interactionService.start.mockReset();
    interactionService.stop.mockReset();

    await TestBed.configureTestingModule({
      imports: [PasswordPage],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: { get: () => '/gallery' } } },
        },
        { provide: Router, useValue: router },
        { provide: AuthService, useValue: authService },
        {
          provide: UrlQueryParamService,
          useValue: { groupIdParam: signal('group-42') },
        },
        { provide: InteractionService, useValue: interactionService },
      ],
    }).compileComponents();
  });

  it('renders the updated password page decorations and accessible label', () => {
    const fixture = TestBed.createComponent(PasswordPage);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.teddy-decoration')?.getAttribute('src')).toContain(
      'mis%20sredni.png',
    );
    expect(element.querySelector('.camera-icon')?.getAttribute('src')).toContain(
      'aparat%20maly.png',
    );
    expect(element.querySelector('.heart-divider')?.getAttribute('src')).toContain(
      'maly%20serce.png',
    );
    expect(element.querySelector('.leaf-decoration')).toBeNull();
    expect(element.querySelector('.eyebrow')).toBeNull();
    expect(element.querySelector('label')?.textContent).toContain('Hasło');
    expect(element.querySelector('.lock-icon')).toBeTruthy();
  });

  it('shows the required-field error without attempting login', () => {
    const fixture = TestBed.createComponent(PasswordPage);
    fixture.detectChanges();
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      'Pole jest wymagane',
    );
    expect(authService.loginWithPassword).not.toHaveBeenCalled();
  });

  it('logs in with the entered password and navigates to the redirect URL', async () => {
    const fixture = TestBed.createComponent(PasswordPage);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('#password') as HTMLInputElement;
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;

    input.value = '123456';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();

    expect(authService.loginWithPassword).toHaveBeenCalledWith('123456', 'group-42');
    expect(router.navigate).toHaveBeenCalledWith(['/gallery']);
    expect(interactionService.start).toHaveBeenCalled();
    expect(interactionService.stop).toHaveBeenCalled();
  });
});
